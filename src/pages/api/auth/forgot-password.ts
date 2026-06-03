import type { APIRoute } from 'astro';
import { supabaseAdmin, isSupabaseConfigured, getCloudflareEnv } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        message: '邮箱地址不能为空'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: '请输入有效的邮箱地址'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!isSupabaseConfigured) {
      return new Response(JSON.stringify({
        success: false,
        message: '邮件服务未配置，请联系管理员'
      }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    // Generate recovery link using direct fetch to Supabase Admin API
    const supabaseUrl = getCloudflareEnv('PUBLIC_SUPABASE_URL') || 'https://giynvpfnzzelzwpmsgtf.supabase.co';
    const serviceKey = getCloudflareEnv('SUPABASE_SERVICE_ROLE_KEY');

    if (!serviceKey) {
      return new Response(JSON.stringify({
        success: false, message: '服务端密钥未配置'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const siteUrl = 'https://mi-to-ai.com';
    const genLinkResp = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'recovery',
        email,
        redirect_to: `${siteUrl}/auth/reset-password`,
      }),
    });

    const linkData = await genLinkResp.json();

    if (!genLinkResp.ok) {
      console.error('[forgot-password] generateLink error:', linkData);
      return new Response(JSON.stringify({
        success: false,
        message: linkData.msg?.includes('not found') ? '该邮箱尚未注册' : '发送失败，请稍后重试'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const rawActionLink = linkData?.action_link || linkData?.properties?.action_link;
    if (!rawActionLink) {
      console.error('[forgot-password] No action_link returned');
      return new Response(JSON.stringify({
        success: false,
        message: '生成重置链接失败，请稍后重试'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Get the RAW token from the generate_link response.
    // IMPORTANT: action_link contains the HASHED token — if we pass it to verifyOtp,
    // it gets hashed again (double hash) and verification fails.
    // The raw token is at linkData.token or linkData.properties?.token.
    const rawToken = linkData?.token || linkData?.properties?.token || '';

    let actionLink: string;
    if (rawToken) {
      const verifyUrl = new URL(`${siteUrl}/auth/reset-password`);
      verifyUrl.searchParams.set('token', rawToken);
      verifyUrl.searchParams.set('type', 'recovery');
      verifyUrl.searchParams.set('email', email);
      actionLink = verifyUrl.toString();
      // URL built successfully (token not logged for security)
    } else {
      // Fallback: use Supabase's verify endpoint directly (redirects to our page with hash tokens)
      console.warn('[forgot-password] No raw token in response, using action_link directly');
      actionLink = rawActionLink;
    }

    // Read Resend API key (Cloudflare runtime secret)
    const resendApiKey = getCloudflareEnv('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('[forgot-password] RESEND_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        message: '邮件服务未配置，请联系管理员'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Send password reset email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MiToAI <noreply@mi-to-ai.com>',
        to: email,
        subject: '重置您的密码 - MiToAI',
        html: `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; }
  .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
  .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0; }
  .body { padding: 40px; }
  .body h2 { color: #18181b; font-size: 20px; font-weight: 600; margin: 0 0 16px; }
  .body p { color: #52525b; font-size: 15px; line-height: 1.7; margin: 0 0 24px; }
  .btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600; text-align: center; }
  .link-box { background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px 16px; margin: 16px 0 24px; word-break: break-all; font-size: 13px; color: #6366f1; }
  .footer { padding: 24px 40px; background: #fafafa; border-top: 1px solid #e4e4e7; text-align: center; }
  .footer p { color: #a1a1aa; font-size: 12px; line-height: 1.6; margin: 0; }
  .note { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #92400e; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🎓 MiToAI</h1>
    <p>AI 工具评测平台</p>
  </div>
  <div class="body">
    <h2>重置密码</h2>
    <p>我们收到了您的密码重置请求。请点击下方按钮设置新密码：</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${actionLink}" class="btn">重置密码</a>
    </div>
    <p style="font-size: 13px; color: #71717a;">如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
    <div class="link-box">${actionLink}</div>
    <div class="note">⚠️ 此链接将在 1 小时后过期。如果您没有请求重置密码，请忽略此邮件，您的密码不会被更改。</div>
  </div>
  <div class="footer">
    <p>此邮件由系统自动发送，请勿直接回复</p>
    <p style="margin-top: 8px;">© 2025 MiToAI - AI 工具评测平台</p>
  </div>
</div>
</body>
</html>`,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error('[forgot-password] Resend API error:', resendResponse.status, resendError);
      return new Response(JSON.stringify({
        success: false,
        message: '发送失败，请稍后重试'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }


    return new Response(JSON.stringify({
      success: true,
      message: '重置链接已发送到您的邮箱'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Forgot password error:', e);
    return new Response(JSON.stringify({
      success: false,
      message: '服务器错误，请稍后重试'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
