// Leaderboard API - returns ranked users from Supabase
// Supports period: total (default), weekly, monthly
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';

/**
 * Resolve user display names via the get_user_metadata RPC function.
 * Falls back to public_leaderboard and profiles tables.
 */
async function resolveUserNames(
  userIds: string[]
): Promise<Record<string, { name: string; avatar: string }>> {
  const nameMap: Record<string, { name: string; avatar: string }> = {};
  const remainingIds = [...userIds];

  // Source 1: get_user_metadata RPC (reads auth.users via SECURITY DEFINER)
  if (remainingIds.length > 0) {
    try {
      const { data: metaRows } = await supabaseAdmin.rpc('get_user_metadata', {
        user_ids: remainingIds,
      });

      for (const row of metaRows || []) {
        if (row.display_name) {
          nameMap[row.user_id] = {
            name: row.display_name,
            avatar: row.avatar_url || '',
          };
        }
      }
    } catch (e) {
      console.warn('[leaderboard] get_user_metadata RPC failed, falling back:', e);
    }
  }

  // Source 2: public_leaderboard view for users still missing
  const stillMissing1 = remainingIds.filter((id) => !nameMap[id]?.name);
  if (stillMissing1.length > 0) {
    const { data: lbRows } = await supabase
      .from('public_leaderboard')
      .select('user_id, name, avatar')
      .in('user_id', stillMissing1);

    for (const row of lbRows || []) {
      if (row.name && !nameMap[row.user_id]?.name) {
        nameMap[row.user_id] = {
          name: row.name,
          avatar: row.avatar || '',
        };
      }
    }
  }

  // Source 3: profiles table for users still missing
  const stillMissing2 = remainingIds.filter((id) => !nameMap[id]?.name);
  if (stillMissing2.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', stillMissing2);

    for (const p of profiles || []) {
      if (p.display_name && !nameMap[p.user_id]?.name) {
        nameMap[p.user_id] = {
          name: p.display_name,
          avatar: p.avatar_url || '',
        };
      }
    }
  }

  // Source 4: supabaseAdmin.auth.admin.getUserById for remaining users
  const stillMissing3 = remainingIds.filter((id) => !nameMap[id]?.name);
  for (const uid of stillMissing3) {
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(uid);
      if (userData?.user) {
        const meta = userData.user.user_metadata || {};
        const name =
          (meta.name as string) ||
          (meta.full_name as string) ||
          (meta.user_name as string) ||
          '';
        const avatar =
          (meta.avatar_url as string) || (meta.picture as string) || '';
        if (name) {
          nameMap[uid] = { name, avatar };
        }
      }
    } catch {
      // Admin API might not be available
    }
  }

  return nameMap;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const period = url.searchParams.get('period') || 'total';

  if (period === 'weekly' || period === 'monthly') {
    // For weekly/monthly: aggregate points from points_transactions within time window
    const now = new Date();
    let startDate: Date;

    if (period === 'weekly') {
      // Start of current week (Monday)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Aggregate points earned in the period
    const { data: transactions, error: txError } = await supabase
      .from('points_transactions')
      .select('user_id, amount')
      .gte('created_at', startDate.toISOString())
      .gt('amount', 0);

    if (txError) {
      console.error('[leaderboard] Error fetching period transactions:', txError);
      return new Response(
        JSON.stringify({ success: false, error: { message: 'Failed to fetch leaderboard' } }),
        { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Aggregate by user
    const userPoints: Record<string, number> = {};
    for (const tx of transactions || []) {
      userPoints[tx.user_id] = (userPoints[tx.user_id] || 0) + tx.amount;
    }

    // Sort and take top N
    const sorted = Object.entries(userPoints)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    if (sorted.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [], period, message: 'No leaderboard data yet' }),
        { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Resolve real user names
    const userIds = sorted.map(([id]) => id);
    const nameMap = await resolveUserNames(userIds);

    const leaderboard = sorted.map(([userId, points], index) => {
      const seed = userId.substring(0, 8);
      const info = nameMap[userId];
      return {
        rank: index + 1,
        userId,
        name: info?.name || `用户${seed}`,
        avatar:
          info?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
        points,
        totalEarned: points,
        updatedAt: new Date().toISOString(),
      };
    });

    return new Response(
      JSON.stringify({ success: true, data: leaderboard, period }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  // Default: total period - use user_points_balance table
  const { data: balances, error: balanceError } = await supabase
    .from('user_points_balance')
    .select('user_id, balance, total_earned, updated_at')
    .order('balance', { ascending: false })
    .limit(limit);

  if (balanceError) {
    console.error('[leaderboard] Error fetching balances:', balanceError);
    return new Response(
      JSON.stringify({ success: false, error: { message: 'Failed to fetch leaderboard' } }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  if (!balances || balances.length === 0) {
    return new Response(
      JSON.stringify({ success: true, data: [], period: 'total', message: 'No leaderboard data yet' }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  // Resolve real user names
  const userIds = balances.map((b) => b.user_id);
  const nameMap = await resolveUserNames(userIds);

  const leaderboard = balances.map((b, index) => {
    const seed = b.user_id.substring(0, 8);
    const info = nameMap[b.user_id];
    return {
      rank: index + 1,
      userId: b.user_id,
      name: info?.name || `用户${seed}`,
      avatar:
        info?.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
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
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
