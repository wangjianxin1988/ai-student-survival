// Leaderboard API - returns ranked users from Supabase
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  // Use regular supabase client (anon key) — RLS policies allow public read for positive balance
  let balanceQuery = supabase
    .from('user_points_balance')
    .select('user_id, balance, total_earned, updated_at')
    .order('balance', { ascending: false })
    .limit(limit);

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

  // Build leaderboard with ranks and fallback avatars
  const leaderboard = balances.map((b, index) => {
    const seed = b.user_id.substring(0, 8);
    return {
      rank: index + 1,
      userId: b.user_id,
      name: `用户${seed}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
      points: b.balance,
      totalEarned: b.total_earned || b.balance,
      updatedAt: b.updated_at,
    };
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: leaderboard,
      period: 'total',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
