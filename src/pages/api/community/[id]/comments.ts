export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { getPostById } from '@/lib/community/storage';
import { earnPoints } from '@/lib/points/service';
import { checkAndPromote } from '@/lib/auto-promote/service';
import { contentModerationApi } from '@/lib/content-moderation';

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
    .select(`
      *,
      author:users(id, name, avatar_url)
    `)
    .eq('post_id', postId)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'DB_ERROR', message: error.message },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const formattedComments = (comments || []).map((c) => ({
    id: c.id,
    postId: c.post_id,
    userId: c.user_id,
    content: c.content,
    status: c.status,
    createdAt: c.created_at,
    author: {
      id: c.author?.id,
      name: c.author?.name || '匿名用户',
      avatar: c.author?.avatar_url,
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

    // 创建评论
    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        status: 'published',
      })
      .select(`
        *,
        author:users(id, name, avatar_url)
      `)
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
    await supabase.rpc('increment_comments_count', { post_id: postId });

    // 给帖子作者增加积分（被评论）
    await earnPoints(supabase, post.userId, {
      amount: 3,
      type: 'earn_comment',
      description: '帖子被评论',
      referenceId: postId,
    });

    // 检查自动推送规则
    await checkAndPromote(postId);

    const formattedComment = {
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      content: comment.content,
      status: comment.status,
      createdAt: comment.created_at,
      author: {
        id: comment.author?.id,
        name: comment.author?.name || '匿名用户',
        avatar: comment.author?.avatar_url,
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
