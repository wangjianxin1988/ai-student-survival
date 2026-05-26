// Get current user's like/favorite state for multiple posts
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

export const GET: APIRoute = async ({ request }) => {
  const user = await getServerUser(request);

  if (!user) {
    // Return empty state for unauthenticated users
    return new Response(
      JSON.stringify({ success: true, data: { likes: [], favorites: [] } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(request.url);
  const postIds = url.searchParams.getAll('postId');

  if (postIds.length === 0) {
    return new Response(
      JSON.stringify({ success: true, data: { likes: [], favorites: [] } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Fetch user's likes (post_likes has public SELECT policy)
  const { data: likes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds);

  // Fetch user's favorites (uses supabaseAdmin to bypass RLS which requires auth.uid = user_id)
  const { data: favorites } = await supabaseAdmin
    .from('post_favorites')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        likes: (likes || []).map(l => l.post_id),
        favorites: (favorites || []).map(f => f.post_id),
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
