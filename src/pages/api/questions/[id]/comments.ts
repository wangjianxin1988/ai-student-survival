export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { supabase, supabaseAdmin } from '@/lib/supabase';
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

  const { data: comments, error } = await supabase
    .from('post_comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get user info for comments with better name resolution
  const userIds = [...new Set((comments || []).map(c => c.user_id))];
  const userMap: Record<string, { name: string; avatar: string }> = {};

  if (userIds.length > 0) {
    // Try users table first
    const { data: usersData } = await supabaseAdmin
      .from('users')
      .select('id, name, avatar_url')
      .in('id', userIds);

    (usersData || []).forEach((u: Record<string, unknown>) => {
      if (u.name) {
        userMap[u.id as string] = {
          name: u.name as string,
          avatar: (u.avatar_url as string) || '',
        };
      }
    });

    // For users still missing names, try auth metadata
    const missingNameIds = userIds.filter(id => !userMap[id]?.name);
    if (missingNameIds.length > 0) {
      try {
        const { data: metaRows } = await supabaseAdmin.rpc('get_user_metadata', {
          user_ids: missingNameIds,
        });
        if (metaRows) {
          for (const row of metaRows) {
            if (row.display_name) {
              userMap[row.user_id] = {
                name: row.display_name,
                avatar: row.avatar_url || userMap[row.user_id]?.avatar || '',
              };
            }
          }
        }
      } catch { /* RPC might not exist */ }

      // Final fallback: auth admin API
      const stillMissing = missingNameIds.filter(id => !userMap[id]?.name);
      for (const uid of stillMissing.slice(0, 10)) {
        try {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(uid);
          if (userData?.user) {
            const meta = userData.user.user_metadata || {};
            const name = (meta.name as string) || (meta.full_name as string) || '';
            if (name) {
              userMap[uid] = {
                name,
                avatar: (meta.avatar_url as string) || '',
              };
            }
          }
        } catch { /* ignore */ }
      }
    }
  }

  const formattedComments = (comments || []).map((c: Record<string, unknown>) => {
    const userInfo = userMap[c.user_id as string];
    return {
      id: c.id as string,
      postId: c.post_id as string,
      userId: c.user_id as string,
      userName: userInfo?.name || '匿名用户',
      userAvatar: userInfo?.avatar || '',
      content: c.content as string,
      likes: (c.likes_count as number) || 0,
      likesCount: (c.likes_count as number) || 0,
      parentId: (c.parent_id as string) || null,
      likedBy: [],
      createdAt: c.created_at as string,
    };
  });

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

    // Resolve user name from multiple sources
    let authorName = user.name || '';
    let authorAvatar = '';

    // Try users table
    if (!authorName) {
      try {
        const { data: userRow } = await supabaseAdmin
          .from('users')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single();
        if (userRow?.name) {
          authorName = userRow.name;
          authorAvatar = userRow.avatar_url || '';
        }
      } catch { /* ignore */ }
    }

    // Try auth admin API
    if (!authorName) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.id);
        if (userData?.user) {
          const meta = userData.user.user_metadata || {};
          authorName = (meta.name as string) || (meta.full_name as string) || '';
          authorAvatar = (meta.avatar_url as string) || '';
        }
      } catch { /* ignore */ }
    }

    // Fallback to email prefix
    if (!authorName && user.email) {
      authorName = user.email.split('@')[0];
    }
    if (!authorName) authorName = '匿名用户';

    // Content moderation check
    const modResult = contentModerationApi.moderate(content, user.id, 'comment');
    if (!modResult.isAllowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CONTENT_BLOCKED',
            message: modResult.reason || 'Content moderation failed, please revise',
            flags: modResult.flags,
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get post author for points and title for notifications
    const { data: postData } = await supabase
      .from('community_posts')
      .select('user_id, title')
      .eq('id', postId)
      .single();

    // Use supabaseAdmin to bypass RLS for INSERT
    const { data: comment, error } = await supabaseAdmin
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
        status: 'published',
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: { message: error.message } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Increment comments count
    try { await supabase.rpc('increment_comments_count', { post_id: postId }); } catch { /* ignore */ }

    // Award points to post author (commented on post)
    if (postData?.user_id && postData.user_id !== user.id) {
      try {
        await earnPoints(supabaseAdmin, postData.user_id, {
          amount: 3,
          type: 'earn_comment',
          description: 'Post received a comment',
          referenceId: postId,
        });
      } catch (e) {
        console.error('[questions/comments] Failed to award post author points:', e);
      }
    }

    // Award points to commenter
    try {
      await earnPoints(supabaseAdmin, user.id, {
        amount: 5,
        type: 'comment',
        description: 'Posted a comment',
        referenceId: postId,
      });
    } catch (e) {
      console.error('[questions/comments] Failed to award commenter points:', e);
    }

    // Check auto-promote rules
    try { await checkAndPromote(postId); } catch { /* ignore */ }

    // 通知被 @提及 的用户（异步，不阻塞响应）
    try {
      const postTitle = (postData?.title as string) || '帖子';
      notifyMentionedUsers(content.trim(), postId, postTitle, authorName, 'questions')
        .catch((err) => console.error('[questions/comments] Failed to notify mentioned users:', err));
    } catch { /* ignore */ }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: comment.id as string,
          postId: comment.post_id as string,
          userId: comment.user_id as string,
          userName: authorName,
          userAvatar: authorAvatar,
          content: comment.content as string,
          likes: 0,
          likedBy: [],
          createdAt: comment.created_at as string,
        },
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
