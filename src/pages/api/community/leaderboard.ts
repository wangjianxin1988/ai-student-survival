// 临时调试版本
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const period = url.searchParams.get('period') || 'total';

  console.log('[leaderboard] supabaseAdmin configured:', !!supabaseAdmin);
  console.log('[leaderboard] SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 获取积分数据
  let query = supabase
    .from('user_points_balance')
    .select('user_id, balance, total_earned, updated_at')
    .order('balance', { ascending: false })
    .limit(limit);

  const { data: balances, error: balanceError } = await query;

  if (balanceError) {
    console.error('[leaderboard] Error:', balanceError);
    return new Response(JSON.stringify({ success: false, error: balanceError.message }), { status: 500 });
  }

  if (!balances || balances.length === 0) {
    return new Response(JSON.stringify({ success: true, data: [], period }), { status: 200 });
  }

  const userIds = balances.map(b => b.user_id);
  console.log('[leaderboard] User IDs:', userIds);

  // 尝试RPC调用
  try {
    const { data: metaRows, error: rpcError } = await supabaseAdmin.rpc('get_user_metadata', {
      user_ids: userIds,
    });
    
    console.log('[leaderboard] RPC result:', metaRows);
    console.log('[leaderboard] RPC error:', rpcError);

    if (metaRows && metaRows.length > 0) {
      const nameMap: Record<string, string> = {};
      for (const row of metaRows) {
        if (row.display_name) {
          nameMap[row.user_id] = row.display_name;
        }
      }

      const leaderboard = balances.map((b, index) => ({
        rank: index + 1,
        userId: b.user_id,
        name: nameMap[b.user_id] || `用户${b.user_id.substring(0, 8)}`,
        points: b.balance,
        totalEarned: b.total_earned,
        updatedAt: b.updated_at,
      }));

      return new Response(JSON.stringify({ success: true, data: leaderboard, period }), { status: 200 });
    }
  } catch (e) {
    console.error('[leaderboard] RPC failed:', e);
  }

  // Fallback
  const leaderboard = balances.map((b, index) => ({
    rank: index + 1,
    userId: b.user_id,
    name: `用户${b.user_id.substring(0, 8)}`,
    points: b.balance,
    totalEarned: b.total_earned,
    updatedAt: b.updated_at,
  }));

  return new Response(JSON.stringify({ success: true, data: leaderboard, period }), { status: 200 });
};
