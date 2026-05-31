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

  // Get user info for comments
  const userIds = [...new Set((comments || []).map(c => c.user_id))];
  const { data: usersData } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .in('id', userIds);

  const userMap: Record<string, { name: string; avatar: string }> = {};
  (usersData || []).forEach((u: Record<string, unknown>) => {
    userMap[u.id as string] = {
      name: (u.name as string) || 'Anonymous',
      avatar: (u.avatar_url as string) || '',
    };
  });

  const formattedComments = (comments || []).map((c: Record<string, unknown>) => {
    const userInfo = userMap[c.user_id as string] || { name: 'Anonymous', avatar: '' };
    return {
      id: c.id as string,
      postId: c.post_id as string,
      userId: c.user_id as string,
      userName: userInfo.name,
      userAvatar: userInfo.avatar,
      content: c.content as string,
      likes: 0,
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
    const { content } = body;

    if (!content || !content.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Comment content is required' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user info
    const { data: userData } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();

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

    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
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
      const commenterName = (userData?.name as string) || 'Anonymous';
      const postTitle = (postData?.title as string) || '帖子';
      notifyMentionedUsers(content.trim(), postId, postTitle, commenterName, 'questions')
        .catch((err) => console.error('[questions/comments] Failed to notify mentioned users:', err));
    } catch { /* ignore */ }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: comment.id as string,
          postId: comment.post_id as string,
          userId: comment.user_id as string,
          userName: (userData?.name as string) || 'Anonymous',
          userAvatar: (userData?.avatar_url as string) || '',
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
