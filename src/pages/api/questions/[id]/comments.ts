export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { supabase } from '@/lib/supabase';

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
    await supabase.rpc('increment_comments_count', { post_id: postId });

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
