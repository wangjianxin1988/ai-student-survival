// User public stats API - returns stats for a specific user
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  const userId = params.id;

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'User ID is required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  // Get user points balance
  const { data: balanceData } = await supabase
    .from('user_points_balance')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get post count
  const { count: postsCount } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'published');

  // Get comments count
  let commentsCount = 0;
  const { count } = await supabase
    .from('post_comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (count !== null) commentsCount = count;

  // Resolve real user name from multiple sources
  let userName = '';
  let userAvatar = '';

  // Source 1: get_user_metadata RPC (reads auth.users via SECURITY DEFINER)
  try {
    const { data: metaRows } = await supabaseAdmin.rpc('get_user_metadata', {
      user_ids: [userId],
    });
    if (metaRows && metaRows.length > 0) {
      userName = metaRows[0].display_name || '';
      userAvatar = metaRows[0].avatar_url || '';
    }
  } catch (e) {
    console.warn('[stats] get_user_metadata RPC failed, falling back:', e);
  }

  // Source 2: public_leaderboard view
  if (!userName) {
    const { data: lbRow } = await supabase
      .from('public_leaderboard')
      .select('name, avatar')
      .eq('user_id', userId)
      .single();

    if (lbRow) {
      userName = lbRow.name || '';
      userAvatar = lbRow.avatar || '';
    }
  }

  // Source 3: profiles table
  if (!userName) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', userId)
      .single();

    if (profile) {
      userName = profile.display_name || '';
      userAvatar = profile.avatar_url || '';
    }
  }

  // Source 4: supabaseAdmin auth API (requires service role key)
  if (!userName) {
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userData?.user) {
        const meta = userData.user.user_metadata || {};
        userName =
          (meta.name as string) ||
          (meta.full_name as string) ||
          (meta.user_name as string) ||
          '';
        userAvatar =
          (meta.avatar_url as string) || (meta.picture as string) || '';
      }
    } catch {
      // Admin API might not be available
    }
  }

  const seed = userId.substring(0, 8);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        userId,
        name: userName || `用户${seed}`,
        avatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
        email: '',
        points: balanceData?.balance || 0,
        totalEarned: balanceData?.total_earned || 0,
        totalSpent: balanceData?.total_spent || 0,
        postsCount: postsCount || 0,
        commentsCount: commentsCount || 0,
        joinDate: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
