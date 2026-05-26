export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { supabase } from '@/lib/supabase';

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

  // Check existing favorite
  const { data: existing } = await supabase
    .from('post_favorites')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  let favorited: boolean;
  if (existing) {
    // Unfavorite
    await supabase.from('post_favorites').delete().eq('id', existing.id);
    await supabase.rpc('decrement_favorites_count', { post_id: postId });
    favorited = false;
  } else {
    // Favorite
    await supabase.from('post_favorites').insert({ post_id: postId, user_id: user.id });
    await supabase.rpc('increment_favorites_count', { post_id: postId });
    favorited = true;
  }

  const { data: post } = await supabase
    .from('community_posts')
    .select('favorites_count')
    .eq('id', postId)
    .single();

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        favorited,
        favoritesCount: post?.favorites_count || 0,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
