// Record Sponsor API - authenticated users can submit a sponsorship record
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

// Send notification email to admin via Resend API
async function sendSponsorEmail(params: {
  nickname: string;
  amount: number;
  tier: string;
  paymentMethod: string;
  message: string | null;
  profileUrl: string | null;
}) {
  const resendApiKey = (import.meta.env.RESEND_API_KEY as string)
    || (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : undefined);

  if (!resendApiKey) {
    console.warn('[sponsors/record] RESEND_API_KEY not configured, skipping email notification');
    return;
  }

  const tierNames: Record<string, string> = { coffee: '一杯咖啡', meal: '一顿饭', super: '超级赞助' };
  const methodNames: Record<string, string> = { wechat: '微信', alipay: '支付宝' };

  const subject = `【新赞助】${params.nickname} 赞助了 ¥${params.amount}`;
  const htmlBody = `
    <h2>收到新的赞助记录</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">昵称</td><td style="padding:8px;border:1px solid #ddd">${params.nickname}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">金额</td><td style="padding:8px;border:1px solid #ddd">¥${params.amount}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">档位</td><td style="padding:8px;border:1px solid #ddd">${tierNames[params.tier] || params.tier}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">支付方式</td><td style="padding:8px;border:1px solid #ddd">${methodNames[params.paymentMethod] || params.paymentMethod}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">留言</td><td style="padding:8px;border:1px solid #ddd">${params.message || '无'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">个人主页</td><td style="padding:8px;border:1px solid #ddd">${params.profileUrl || '无'}</td></tr>
    </table>
    <p style="margin-top:16px;color:#888;font-size:12px">此邮件由 mi-to-ai.com 赞助系统自动发送</p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MI TO AI 赞助通知 <sponsor@mi-to-ai.com>',
        to: ['18801400211@163.com'],
        subject,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[sponsors/record] Email send failed:', res.status, errText);
    } else {
      console.log('[sponsors/record] Notification email sent to 18801400211@163.com');
    }
  } catch (err) {
    console.error('[sponsors/record] Email send error:', err);
  }
}

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

  // Insert sponsor record using admin client (bypasses RLS)
  const { data: sponsor, error } = await supabaseAdmin
    .from('sponsors')
    .insert({
      user_id: userId,
      nickname: nickname.trim().substring(0, 50),
      amount: Math.round(amount),
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

  // Award points to logged-in user (also using admin client to bypass RLS)
  const pointsMap: Record<string, number> = { coffee: 66, meal: 188, super: 666 };
  const awardedPoints = pointsMap[resolvedTier] || 66;

  if (userId) {
    await supabaseAdmin
      .from('points_transactions')
      .insert({
        user_id: userId,
        amount: awardedPoints,
        type: 'earn_sponsor',
        description: `赞助奖励 (${amount}元 ${tier === 'coffee' ? '一杯咖啡' : tier === 'meal' ? '一顿饭' : '超级赞助'})`,
      })
      .catch(e => console.warn('[sponsors/record] Failed to award points:', e));
  }

  // Send email notification to admin (non-blocking)
  sendSponsorEmail({
    nickname: nickname.trim(),
    amount,
    tier: resolvedTier,
    paymentMethod,
    message: message?.trim() || null,
    profileUrl: profileUrl?.trim() || null,
  }).catch(err => console.error('[sponsors/record] Email notification error:', err));

  return new Response(
    JSON.stringify({ success: true, data: sponsor, points: userId ? awardedPoints : 0 }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
