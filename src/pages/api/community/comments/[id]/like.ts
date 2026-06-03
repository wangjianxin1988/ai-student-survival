export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

// POST: Toggle like on a comment
export const POST: APIRoute = async ({ params, request }) => {
  const commentId = params.id;
  const user = await getServerUser(request);

  if (!user) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please login first' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!commentId) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Comment ID is required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check if already liked
  const { data: existing } = await supabaseAdmin
    .from('post_comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .single();

  let liked: boolean;

  if (existing) {
    // Unlike
    await supabaseAdmin.from('post_comment_likes').delete().eq('id', existing.id);
    await supabaseAdmin.rpc('decrement_comment_likes_count', { comment_id: commentId });
    liked = false;
  } else {
    // Like
    await supabaseAdmin.from('post_comment_likes').insert({ comment_id: commentId, user_id: user.id });
    await supabaseAdmin.rpc('increment_comment_likes_count', { comment_id: commentId });
    liked = true;
  }

  // Get updated count
  const { data: comment } = await supabaseAdmin
    .from('post_comments')
    .select('likes_count')
    .eq('id', commentId)
    .single();

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        liked,
        likesCount: comment?.likes_count || 0,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

// GET: Check if user liked a comment, get like count
export const GET: APIRoute = async ({ params, request }) => {
  const commentId = params.id;

  if (!commentId) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Comment ID is required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get like count (no auth needed)
  const { data: comment } = await supabaseAdmin
    .from('post_comments')
    .select('likes_count')
    .eq('id', commentId)
    .single();

  // Check if current user liked it
  const user = await getServerUser(request);
  let isLiked = false;

  if (user) {
    const { data: existing } = await supabaseAdmin
      .from('post_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();
    isLiked = !!existing;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        isLiked,
        likesCount: comment?.likes_count || 0,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
