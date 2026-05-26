// Leaderboard API - returns ranked users from Supabase
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const period = url.searchParams.get('period') || 'total'; // total, weekly, monthly

  // Fetch top users by points from user_points_balance
  let balanceQuery = supabase
    .from('user_points_balance')
    .select('user_id, balance, total_earned, updated_at')
    .order('balance', { ascending: false })
    .limit(limit);

  // For weekly/monthly, we'd need to filter points_transactions by date
  // For now, we only support total (all-time)
  const { data: balances, error: balanceError } = await balanceQuery;

  if (balanceError) {
    console.error('[leaderboard] Error fetching balances:', balanceError);
    return new Response(
      JSON.stringify({ success: false, error: { message: 'Failed to fetch leaderboard' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!balances || balances.length === 0) {
    return new Response(
      JSON.stringify({ success: true, data: [], message: 'No leaderboard data yet' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get user IDs
  const userIds = balances.map(b => b.user_id);

  // Fetch user metadata from auth.users
  const { data: users, error: usersError } = await supabase
    .from('auth.users' as any)
    .select('id, email, user_metadata')
    .in('id', userIds);

  if (usersError) {
    console.error('[leaderboard] Error fetching users:', usersError);
    // Continue without user details - just use balances
  }

  // Build user map
  const userMap = new Map();
  if (users) {
    for (const u of users) {
      const meta = u.user_metadata as Record<string, unknown> || {};
      userMap.set(u.id, {
        name: (meta.name as string) || (meta.full_name as string) || `用户${u.id.substring(0, 8)}`,
        avatar: (meta.avatar_url as string) || (meta.picture as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
        email: u.email,
      });
    }
  }

  // Build leaderboard with ranks
  const leaderboard = balances.map((b, index) => {
    const userInfo = userMap.get(b.user_id) || {
      name: `用户${b.user_id.substring(0, 8)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.user_id}`,
    };

    return {
      rank: index + 1,
      userId: b.user_id,
      name: userInfo.name,
      avatar: userInfo.avatar,
      points: b.balance,
      totalEarned: b.total_earned || b.balance,
      updatedAt: b.updated_at,
    };
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: leaderboard,
      period,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
