// Record Sponsor API - authenticated users can submit a sponsorship record
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { getAuthHeaders } from '@/lib/auth';

export const POST: APIRoute = async ({ request }) => {
  // Verify auth
  const authHeaders = await getAuthHeaders();
  if (!authHeaders || !authHeaders['Authorization']) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { nickname?: string; amount?: number; tier?: string; paymentMethod?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'INVALID_JSON', message: '请求格式错误' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { nickname, amount, tier = 'coffee', paymentMethod = 'wechat', message } = body;

  // Validation
  if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', message: '请填写昵称' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', message: '请填写正确的赞助金额' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get user from auth headers (check demo mode or real auth)
  let userId: string | null = null;
  const authHeader = authHeaders['Authorization'];

  if (authHeader) {
    // Try to get user from demo auth or real auth
    const demoTokenMatch = authHeader.match(/^Bearer demo_user_([a-f0-9-]+)$/);
    if (demoTokenMatch) {
      userId = demoTokenMatch[1];
    } else if (authHeader !== 'Bearer demo_token') {
      // Real Supabase auth token - validate and get user
      try {
        const { data: userData } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        userId = userData?.user?.id || null;
      } catch {
        // Fallback to null user_id (anonymous sponsorship)
      }
    }
  }

  // Determine tier from amount
  const tierMap: Record<string, string> = {
    coffee: 'coffee',
    meal: 'meal',
    super: 'super',
  };
  const resolvedTier = tierMap[tier] || 'coffee';

  // Insert sponsor record
  const { data: sponsor, error } = await supabase
    .from('sponsors')
    .insert({
      user_id: userId,
      nickname: nickname.trim().substring(0, 50),
      amount,
      tier: resolvedTier,
      payment_method: paymentMethod,
      message: message?.trim().substring(0, 200) || null,
      status: 'approved', // Auto-approve for now
    })
    .select('id, nickname, amount, tier, payment_method, message, created_at')
    .single();

  if (error) {
    console.error('[sponsors/record] Error inserting sponsor:', error);
    return new Response(
      JSON.stringify({ success: false, error: { code: 'DB_ERROR', message: '记录赞助失败，请稍后重试' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Award points to logged-in user
  if (userId) {
    const pointsMap: Record<string, number> = { coffee: 66, meal: 188, super: 666 };
    const points = pointsMap[resolvedTier] || 66;

    await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        amount: points,
        type: 'sponsor_reward',
        description: `赞助奖励 (${amount}元 ${tier === 'coffee' ? '一杯咖啡' : tier === 'meal' ? '一顿饭' : '超级赞助'})`,
      })
      .catch(e => console.warn('[sponsors/record] Failed to award points:', e));
  }

  return new Response(
    JSON.stringify({ success: true, data: sponsor, points: userId ? (pointsMap[resolvedTier] || 66) : 0 }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
