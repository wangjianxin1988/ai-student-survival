import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

export const prerender = false;

// Table: content_comment_likes (comment_id, user_id, created_at)

// GET: Get liked comment IDs for a user
export const GET: APIRoute = async ({ url, request }) => {
  const userId = url.searchParams.get('user_id');
  if (!userId) {
    const user = await getServerUser(request);
    if (!user) {
      return new Response(JSON.stringify({ success: true, liked_comment_ids: [] }), { status: 200 });
    }
  }

  const uid = userId || (await getServerUser(request))?.id;
  if (!uid) {
    return new Response(JSON.stringify({ success: true, liked_comment_ids: [] }), { status: 200 });
  }

  const { data } = await supabaseAdmin
    .from('content_comment_likes')
    .select('comment_id')
    .eq('user_id', uid);

  return new Response(JSON.stringify({
    success: true,
    liked_comment_ids: (data || []).map(d => d.comment_id),
  }), { status: 200 });
};

// POST: Toggle like on a comment
export const POST: APIRoute = async ({ request }) => {
  const user = await getServerUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { comment_id } = body;
  if (!comment_id) {
    return new Response(JSON.stringify({ error: 'comment_id is required' }), { status: 400 });
  }

  // Check if already liked
  const { data: existing } = await supabaseAdmin
    .from('content_comment_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('comment_id', comment_id)
    .single();

  if (existing) {
    // Unlike
    await supabaseAdmin.from('content_comment_likes').delete().eq('id', existing.id);
    // Decrement likes count on comment
    await supabaseAdmin.rpc('decrement_comment_likes', { cid: comment_id }).catch(() => {});
    return new Response(JSON.stringify({ success: true, liked: false }), { status: 200 });
  }

  // Like
  const { error } = await supabaseAdmin
    .from('content_comment_likes')
    .insert({ user_id: user.id, comment_id });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Increment likes count on comment
  await supabaseAdmin.rpc('increment_comment_likes', { cid: comment_id }).catch(() => {});

  return new Response(JSON.stringify({ success: true, liked: true }), { status: 201 });
};
