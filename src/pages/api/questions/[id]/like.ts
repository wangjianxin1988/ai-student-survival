export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { supabaseAdmin } from '@/lib/supabase';

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

  // Check existing like
  const { data: existing } = await supabaseAdmin
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  let liked: boolean;
  if (existing) {
    // Unlike
    await supabaseAdmin.from('post_likes').delete().eq('id', existing.id);
    await supabaseAdmin.rpc('decrement_likes_count', { post_id: postId });
    liked = false;
  } else {
    // Like
    await supabaseAdmin.from('post_likes').insert({ post_id: postId, user_id: user.id });
    await supabaseAdmin.rpc('increment_likes_count', { post_id: postId });
    liked = true;
  }

  const { data: post } = await supabaseAdmin
    .from('community_posts')
    .select('likes_count')
    .eq('id', postId)
    .single();

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        liked,
        likesCount: post?.likes_count || 0,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
