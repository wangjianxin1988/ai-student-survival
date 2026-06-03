// Points Leaderboard API - delegates to community leaderboard
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  // Fetch top users by balance
  const { data: balances, error } = await supabaseAdmin
    .from('user_points_balance')
    .select('user_id, balance, total_earned, updated_at')
    .order('balance', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[points/leaderboard] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: { message: 'Failed to fetch leaderboard' } }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const data = (balances || []).map((b, index) => ({
    rank: index + 1,
    userId: b.user_id,
    points: b.balance,
    totalEarned: b.total_earned || b.balance,
    updatedAt: b.updated_at,
  }));

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
