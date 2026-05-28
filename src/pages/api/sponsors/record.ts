// Record Sponsor API - authenticated users can submit a sponsorship record
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

export const POST: APIRoute = async ({ request }) => {
  // Verify auth using server-side helper (handles both demo and real auth)
  const serverUser = await getServerUser(request);

  let body: { nickname?: string; amount?: number; tier?: string; paymentMethod?: string; message?: string; profileUrl?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'INVALID_JSON', message: '请求格式错误' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { nickname, amount, tier = 'coffee', paymentMethod = 'wechat', message, profileUrl } = body;

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

  // Get user ID from server auth (NULL for demo users - their UUID doesn't exist in auth.users)
  const isDemoUser = serverUser?.id?.startsWith('demo-') || false;
  const userId: string | null = (serverUser && !isDemoUser) ? serverUser.id : null;

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
      profile_url: profileUrl?.trim() || null,
      status: 'approved', // Auto-approve for now
    })
    .select('id, nickname, amount, tier, payment_method, message, avatar_url, profile_url, created_at')
    .single();

  if (error) {
    console.error('[sponsors/record] Error inserting sponsor:', error);
    return new Response(
      JSON.stringify({ success: false, error: { code: 'DB_ERROR', message: '记录赞助失败，请稍后重试' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Award points to logged-in user
  const pointsMap: Record<string, number> = { coffee: 66, meal: 188, super: 666 };
  const awardedPoints = pointsMap[resolvedTier] || 66;

  if (userId) {
    await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        amount: awardedPoints,
        type: 'earn_sponsor',
        description: `赞助奖励 (${amount}元 ${tier === 'coffee' ? '一杯咖啡' : tier === 'meal' ? '一顿饭' : '超级赞助'})`,
      })
      .catch(e => console.warn('[sponsors/record] Failed to award points:', e));
  }

  return new Response(
    JSON.stringify({ success: true, data: sponsor, points: userId ? awardedPoints : 0 }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
