import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { earnPoints } from '@/lib/points/service';

export const prerender = false;

// GET: Get all shares by a user (for user center)
export const GET: APIRoute = async ({ url, request }) => {
  let userId = url.searchParams.get('user_id');

  if (!userId) {
    const user = await getServerUser(request);
    if (!user) {
      return new Response(JSON.stringify({ success: true, shares: [] }), { status: 200 });
    }
    userId = user.id;
  }

  // 1. Fetch all shares
  const { data: shares, error } = await supabaseAdmin
    .from('content_shares')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // 2. Collect community post IDs
  const communityPostIds = (shares || [])
    .filter(s => s.target_type === 'community')
    .map(s => s.target_id);

  // 3. Fetch titles for community posts
  let titleMap: Record<string, { title: string; category: string }> = {};
  if (communityPostIds.length > 0) {
    const { data: posts } = await supabaseAdmin
      .from('community_posts')
      .select('id, title, category')
      .in('id', communityPostIds);
    
    if (posts) {
      titleMap = Object.fromEntries(posts.map(p => [p.id, { title: p.title, category: p.category }]));
    }
  }

  // 4. Merge titles into shares
  const sharesWithTitles = (shares || []).map(s => ({
    ...s,
    community_posts: s.target_type === 'community' ? titleMap[s.target_id] || null : null
  }));

  return new Response(JSON.stringify({ success: true, shares: sharesWithTitles }), { status: 200 });
};

// POST: Record a share
export const POST: APIRoute = async ({ request }) => {
  const user = await getServerUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id, platform = 'copy_link' } = body;

  if (!target_type || !target_id) {
    return new Response(JSON.stringify({ error: 'target_type and target_id are required' }), { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('content_shares')
    .insert({ user_id: user.id, target_type, target_id, platform })
    .select('*')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Award points for sharing (5 points)
  try {
    await earnPoints(supabaseAdmin, user.id, {
      amount: 5,
      type: 'earn_share',
      description: `分享 ${target_type}: ${target_id}`,
    });
  } catch (e) {
    console.warn('[content-shares] Failed to award points:', e);
  }

  return new Response(JSON.stringify({ success: true, share: data }), { status: 201 });
};