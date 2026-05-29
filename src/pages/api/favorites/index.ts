import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { earnPoints } from '@/lib/points/service';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Fetch tool/prompt/policy/payment favorites from user_favorites
  const { data: favorites, error } = await supabaseAdmin
    .from('user_favorites')
    .select(`
      id,
      target_type,
      target_id,
      created_at
    `)
    .eq('user_id', serverUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Fetch community post favorites from post_favorites, joined with community_posts for title
  const { data: postFavorites } = await supabaseAdmin
    .from('post_favorites')
    .select('id, post_id, created_at, community_posts(title, slug)')
    .eq('user_id', serverUser.id)
    .order('created_at', { ascending: false });

  // Fetch liked posts from post_likes, joined with community_posts for title
  const { data: postLikes } = await supabaseAdmin
    .from('post_likes')
    .select('id, post_id, created_at, community_posts(title, slug)')
    .eq('user_id', serverUser.id)
    .order('created_at', { ascending: false });

  // Convert post_favorites to unified format
  const postFavoriteItems = (postFavorites || []).map(pf => ({
    id: pf.id,
    target_type: 'post',
    target_id: pf.post_id,
    created_at: pf.created_at,
    _post_title: (pf as any).community_posts?.title || null,
    _post_slug: (pf as any).community_posts?.slug || null,
  }));

  // Convert post_likes to unified format
  const postLikeItems = (postLikes || []).map(pl => ({
    id: pl.id,
    target_type: 'liked_post',
    target_id: pl.post_id,
    created_at: pl.created_at,
    _post_title: (pl as any).community_posts?.title || null,
    _post_slug: (pl as any).community_posts?.slug || null,
  }));

  // Merge all items, sort by created_at descending
  const allItems = [...(favorites || []), ...postFavoriteItems, ...postLikeItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return new Response(JSON.stringify({ favorites: allItems }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id } = body;

  if (!target_type || !target_id) {
    return new Response(JSON.stringify({ error: 'target_type and target_id are required' }), { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('user_favorites')
    .insert({ user_id: serverUser.id, target_type, target_id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return new Response(JSON.stringify({ error: 'Already favorited' }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Award points for favoriting
  try {
    const pointsResult = await earnPoints(supabaseAdmin, serverUser.id, {
      amount: 5,
      type: 'favorite',
      description: `收藏 ${target_type}`,
      referenceId: target_id,
    });
    if (!pointsResult.success) {
      console.warn('[favorites] earnPoints returned success=false for user', serverUser.id);
    }
  } catch (e) {
    console.error('[favorites] Failed to award points:', e);
  }

  return new Response(JSON.stringify({ favorite: data }), { status: 201 });
};
