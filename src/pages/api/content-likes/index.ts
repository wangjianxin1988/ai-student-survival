import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { earnPoints } from '@/lib/points/service';

export const prerender = false;

// GET: Check if user liked a target, or get all likes for a user
export const GET: APIRoute = async ({ url, request }) => {
  const targetType = url.searchParams.get('target_type');
  const targetId = url.searchParams.get('target_id');
  const userId = url.searchParams.get('user_id');

  // Get all likes by a user (for user center)
  if (userId) {
    const { data: likes, error } = await supabaseAdmin
      .from('content_likes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, likes: likes || [] }), { status: 200 });
  }

  // Check if current user liked a specific target
  const user = await getServerUser(request);
  if (!user || !targetType || !targetId) {
    // Also get count even without auth
    if (targetType && targetId) {
      const { count } = await supabaseAdmin
        .from('content_likes')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', targetType)
        .eq('target_id', targetId);
      return new Response(JSON.stringify({ success: true, isLiked: false, count: count || 0 }), { status: 200 });
    }
    return new Response(JSON.stringify({ success: true, isLiked: false, count: 0 }), { status: 200 });
  }

  const { data: existing } = await supabaseAdmin
    .from('content_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single();

  const { count } = await supabaseAdmin
    .from('content_likes')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  return new Response(JSON.stringify({
    success: true,
    isLiked: !!existing,
    count: count || 0,
  }), { status: 200 });
};

// POST: Toggle like
export const POST: APIRoute = async ({ request }) => {
  const user = await getServerUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id } = body;

  if (!target_type || !target_id) {
    return new Response(JSON.stringify({ error: 'target_type and target_id are required' }), { status: 400 });
  }

  // Check if already liked
  const { data: existing } = await supabaseAdmin
    .from('content_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', target_type)
    .eq('target_id', target_id)
    .single();

  if (existing) {
    // Unlike
    await supabaseAdmin.from('content_likes').delete().eq('id', existing.id);
    // Get updated count
    const { count } = await supabaseAdmin
      .from('content_likes')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', target_type)
      .eq('target_id', target_id);
    return new Response(JSON.stringify({ success: true, liked: false, count: count || 0 }), { status: 200 });
  }

  // Like
  const { error } = await supabaseAdmin
    .from('content_likes')
    .insert({ user_id: user.id, target_type, target_id });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Award points for liking (5 points)
  try {
    await earnPoints(supabaseAdmin, user.id, {
      amount: 5,
      type: 'earn_like',
      description: `点赞 ${target_type}: ${target_id}`,
    });
  } catch (e) {
    console.warn('[content-likes] Failed to award points:', e);
  }

  // Get updated count
  const { count } = await supabaseAdmin
    .from('content_likes')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', target_type)
    .eq('target_id', target_id);

  return new Response(JSON.stringify({ success: true, liked: true, count: count || 0 }), { status: 201 });
};

// DELETE: Remove like
export const DELETE: APIRoute = async ({ request }) => {
  const user = await getServerUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id } = body;

  const { error } = await supabaseAdmin
    .from('content_likes')
    .delete()
    .eq('user_id', user.id)
    .eq('target_type', target_type)
    .eq('target_id', target_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
