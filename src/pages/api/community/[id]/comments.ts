export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { getPostById } from '@/lib/community/storage';
import { earnPoints } from '@/lib/points/service';
import { checkAndPromote } from '@/lib/auto-promote/service';
import { contentModerationApi } from '@/lib/content-moderation';
import { notifyMentionedUsers } from '@/lib/notifications/service';

export const GET: APIRoute = async ({ params }) => {
  const postId = params.id;

  if (!postId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Post ID is required' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Use raw SQL RPC to avoid PostgREST schema cache relationship issues
  const { data: comments, error } = await supabase.rpc('get_post_comments', {
    p_post_id: postId,
  });

  if (error) {
    // Fallback: query without join and fetch users separately
    const { data: rawComments, error: fallbackError } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'published')
      .order('created_at', { ascending: true });

    if (fallbackError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'DB_ERROR', message: fallbackError.message },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch unique user IDs
    const userIds = [...new Set((rawComments || []).map((c) => c.user_id).filter(Boolean))];
    let usersMap: Record<string, { id: string; name: string; avatar_url: string }> = {};
    if (userIds.length > 0) {
      // Try users table first
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, name, avatar_url')
        .in('id', userIds);
      if (users) {
        for (const u of users) {
          if (u.name) {
            usersMap[u.id] = { id: u.id, name: u.name, avatar_url: u.avatar_url || '' };
          }
        }
      }

      // For users still missing names, try auth admin API
      const missingNameIds = userIds.filter(id => !usersMap[id]?.name);
      if (missingNameIds.length > 0) {
        try {
          const { data: metaRows } = await supabaseAdmin.rpc('get_user_metadata', {
            user_ids: missingNameIds,
          });
          if (metaRows) {
            for (const row of metaRows) {
              if (row.display_name) {
                usersMap[row.user_id] = {
                  id: row.user_id,
                  name: row.display_name,
                  avatar_url: row.avatar_url || usersMap[row.user_id]?.avatar_url || '',
                };
              }
            }
          }
        } catch { /* RPC might not exist */ }

        // Final fallback: try auth admin API for remaining
        const stillMissing = missingNameIds.filter(id => !usersMap[id]?.name);
        for (const uid of stillMissing.slice(0, 10)) {
          try {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(uid);
            if (userData?.user) {
              const meta = userData.user.user_metadata || {};
              const name = (meta.name as string) || (meta.full_name as string) || '';
              const avatar = (meta.avatar_url as string) || '';
              if (name) {
                usersMap[uid] = { id: uid, name, avatar_url: avatar };
              }
            }
          } catch { /* ignore */ }
        }
      }
    }

    const formattedComments = (rawComments || []).map((c) => {
      const userInfo = usersMap[c.user_id];
      const displayName = userInfo?.name || '匿名用户';
      return {
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        content: c.content,
        status: c.status,
        likesCount: c.likes_count || 0,
        parentId: c.parent_id || null,
        createdAt: c.created_at,
        author: {
          id: c.user_id,
          name: displayName,
          avatar: userInfo?.avatar_url || '',
        },
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: formattedComments,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const formattedComments = ((comments as Array<Record<string, unknown>>) || []).map((c) => ({
    id: c.id,
    postId: c.post_id,
    userId: c.user_id,
    content: c.content,
    status: c.status,
    likesCount: c.likes_count || 0,
    parentId: c.parent_id || null,
    createdAt: c.created_at,
    author: {
      id: c.user_id,
      name: (c.author_name as string) || '匿名用户',
      avatar: (c.author_avatar as string) || '',
    },
  }));

  return new Response(
    JSON.stringify({
      success: true,
      data: formattedComments,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const POST: APIRoute = async ({ params, request }) => {
  const postId = params.id;
  const user = await getServerUser(request);

  if (!user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Please login first' },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!postId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Post ID is required' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 获取帖子作者ID
  const post = await getPostById(postId);
  if (!post) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' },
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Comment content is required' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Content moderation check for comment
    const modResult = contentModerationApi.moderate(content, user.id, 'comment');

    if (!modResult.isAllowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CONTENT_BLOCKED',
            message: modResult.reason || '内容审核未通过，请修改后重试',
            flags: modResult.flags,
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Resolve user name from users table or auth metadata
    let authorName = user.name || '';
    if (!authorName) {
      try {
        const { data: userRow } = await supabaseAdmin
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single();
        if (userRow?.name) authorName = userRow.name;
      } catch { /* ignore */ }
    }
    if (!authorName) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.id);
        if (userData?.user) {
          const meta = userData.user.user_metadata || {};
          authorName = (meta.name as string) || (meta.full_name as string) || '';
        }
      } catch { /* ignore */ }
    }
    if (!authorName && user.email) {
      authorName = user.email.split('@')[0];
    }
    if (!authorName) authorName = '匿名用户';

    // 创建评论 (use supabaseAdmin to bypass RLS)
    const { data: newComment, error } = await supabaseAdmin
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
        status: 'published',
      })
      .select('*')
      .single();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'DB_ERROR', message: error.message },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 增加帖子评论数
    try { await supabase.rpc('increment_comments_count', { post_id: postId }); } catch { /* ignore */ }

    // 给帖子作者增加积分（被评论）
    try {
      await earnPoints(supabaseAdmin, post.userId, {
        amount: 3,
        type: 'earn_comment',
        description: '帖子被评论',
        referenceId: postId,
      });
    } catch (e) {
      console.error('[comments] Failed to award post author points:', e);
    }

    // 给评论者增加积分
    try {
      await earnPoints(supabaseAdmin, user.id, {
        amount: 5,
        type: 'comment',
        description: '发表评论',
        referenceId: postId,
      });
    } catch (e) {
      console.error('[comments] Failed to award commenter points:', e);
    }

    // 检查自动推送规则
    await checkAndPromote(postId);

    // 通知被 @提及 的用户（异步，不阻塞响应）
    try {
      notifyMentionedUsers(content.trim(), postId, post.title, authorName, 'community')
        .catch((err) => console.error('[comments] Failed to notify mentioned users:', err));
    } catch { /* ignore */ }

    const formattedComment = {
      id: newComment.id,
      postId: newComment.post_id,
      userId: newComment.user_id,
      content: newComment.content,
      status: newComment.status,
      likesCount: 0,
      parentId: newComment.parent_id || null,
      createdAt: newComment.created_at,
      author: {
        id: user.id,
        name: authorName,
        avatar: '',
      },
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: formattedComment,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal server error' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
