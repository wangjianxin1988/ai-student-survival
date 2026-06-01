import type { APIRoute } from 'astro';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

type EmailType = 'signup' | 'recovery' | 'magiclink';

interface EmailTemplate {
  subject: string;
  html: string;
}

function getEmailTemplate(type: EmailType, actionLink: string, otpCode?: string): EmailTemplate {
  const baseStyle = `
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0; }
    .body { padding: 40px; }
    .body h2 { color: #18181b; font-size: 20px; font-weight: 600; margin: 0 0 16px; }
    .body p { color: #52525b; font-size: 15px; line-height: 1.7; margin: 0 0 24px; }
    .btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600; text-align: center; }
    .btn:hover { opacity: 0.9; }
    .link-box { background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px 16px; margin: 16px 0 24px; word-break: break-all; font-size: 13px; color: #6366f1; }
    .footer { padding: 24px 40px; background: #fafafa; border-top: 1px solid #e4e4e7; text-align: center; }
    .footer p { color: #a1a1aa; font-size: 12px; line-height: 1.6; margin: 0; }
    .divider { height: 1px; background: #e4e4e7; margin: 24px 0; }
    .note { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #92400e; }
  `;

  const templates: Record<EmailType, EmailTemplate> = {
    signup: {
      subject: '验证您的邮箱 - MiToAI',
      html: `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyle}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🎓 MiToAI</h1>
    <p>AI 工具评测平台</p>
  </div>
  <div class="body">
    <h2>欢迎加入 MiToAI！</h2>
    <p>感谢您注册 MiToAI 账号。请点击下方按钮验证您的邮箱地址，完成账号激活：</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${actionLink}" class="btn">验证邮箱地址</a>
    </div>
    <p style="font-size: 13px; color: #71717a;">如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
    <div class="link-box">${actionLink}</div>
    <div class="note">⚠️ 此链接将在 24 小时后过期。如果您没有注册 MiToAI 账号，请忽略此邮件。</div>
  </div>
  <div class="footer">
    <p>此邮件由系统自动发送，请勿直接回复</p>
    <p style="margin-top: 8px;">© 2025 MiToAI - AI 工具评测平台</p>
  </div>
</div>
</body>
</html>`,
    },
    recovery: {
      subject: '重置您的密码 - MiToAI',
      html: `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyle}</style></head>
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
    },
    magiclink: {
      subject: '您的登录验证码 - MiToAI',
      html: `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyle}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🎓 MiToAI</h1>
    <p>AI 工具评测平台</p>
  </div>
  <div class="body">
    <h2>登录验证码</h2>
    <p>您正在尝试登录 MiToAI，以下是您的验证码：</p>
    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: #f4f4f5; border: 2px solid #6366f1; border-radius: 12px; padding: 20px 40px; letter-spacing: 10px; font-size: 36px; font-weight: 700; color: #6366f1; font-family: 'Courier New', monospace;">${otpCode || '------'}</div>
      <p style="font-size: 13px; color: #a1a1aa; margin-top: 12px;">验证码 5 分钟内有效</p>
    </div>
    <div class="note">⚠️ 如果您没有请求登录，请忽略此邮件。</div>
  </div>
  <div class="footer">
    <p>此邮件由系统自动发送，请勿直接回复</p>
    <p style="margin-top: 8px;">© 2025 MiToAI - AI 工具评测平台</p>
  </div>
</div>
</body>
</html>`,
    },
  };

  return templates[type];
}

/**
 * Build a welcome email HTML (sent after direct email confirmation for signup).
 */
function getWelcomeEmailHtml(): string {
  const baseStyle = `
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0; }
    .body { padding: 40px; }
    .body h2 { color: #18181b; font-size: 20px; font-weight: 600; margin: 0 0 16px; }
    .body p { color: #52525b; font-size: 15px; line-height: 1.7; margin: 0 0 24px; }
    .btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600; text-align: center; }
    .footer { padding: 24px 40px; background: #fafafa; border-top: 1px solid #e4e4e7; text-align: center; }
    .footer p { color: #a1a1aa; font-size: 12px; line-height: 1.6; margin: 0; }
  `;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyle}</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🎓 MiToAI</h1>
    <p>AI 工具评测平台</p>
  </div>
  <div class="body">
    <h2>欢迎加入 MiToAI！</h2>
    <p>您的邮箱已验证成功，账号已激活。现在可以使用全部功能了：</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://mi-to-ai.com/auth/login" class="btn">前往登录</a>
    </div>
    <p style="font-size: 14px; color: #71717a;">探索 500+ AI 工具、支付方案、大学政策和提示词模板，助力您的留学之旅。</p>
  </div>
  <div class="footer">
    <p>此邮件由系统自动发送，请勿直接回复</p>
    <p style="margin-top: 8px;">© 2025 MiToAI - AI 工具评测平台</p>
  </div>
</div>
</body>
</html>`;
}

export const POST: APIRoute = async ({ request }) => {
  if (!isSupabaseConfigured) {
    return new Response(
      JSON.stringify({ success: false, error: 'Supabase not configured' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { type, email, userId } = body as { type: EmailType; email: string; userId?: string };

    // Validate inputs
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: '邮箱地址不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['signup', 'recovery', 'magiclink'].includes(type)) {
      return new Response(
        JSON.stringify({ success: false, error: '无效的邮件类型' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: '请输入有效的邮箱地址' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read Resend API key
    const resendApiKey = import.meta.env.RESEND_API_KEY
      || (typeof process !== 'undefined' ? process.env.RESEND_API_KEY : '');

    if (!resendApiKey) {
      console.error('[send-auth-email] RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: '邮件服务未配置' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ─── SIGNUP: Directly confirm the user's email via Admin API ───
    if (type === 'signup') {
      // Generate signup OTP code via Supabase Admin API
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email,
      });

      if (linkError) {
        console.error('[send-auth-email] generateLink signup error:', linkError);
        return new Response(
          JSON.stringify({ success: false, error: '生成验证码失败' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const emailOtp = linkData?.email_otp || linkData?.properties?.email_otp;
      if (!emailOtp) {
        console.error('[send-auth-email] No email_otp returned for signup');
        return new Response(
          JSON.stringify({ success: false, error: '生成验证码失败' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log('[send-auth-email] Signup OTP code:', emailOtp);

      // Send OTP code via Resend
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MiToAI <onboarding@resend.dev>',
          to: email,
          subject: '您的注册验证码 - MiToAI',
          html: `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
  .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
  .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0; }
  .body { padding: 40px; }
  .body h2 { color: #18181b; font-size: 20px; font-weight: 600; margin: 0 0 16px; }
  .body p { color: #52525b; font-size: 15px; line-height: 1.7; margin: 0 0 24px; }
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
    <h2>注册验证码</h2>
    <p>感谢您注册 MiToAI 账号，以下是您的邮箱验证码：</p>
    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: #f4f4f5; border: 2px solid #6366f1; border-radius: 12px; padding: 20px 40px; letter-spacing: 10px; font-size: 36px; font-weight: 700; color: #6366f1; font-family: 'Courier New', monospace;">${emailOtp}</div>
      <p style="font-size: 13px; color: #a1a1aa; margin-top: 12px;">验证码 5 分钟内有效</p>
    </div>
    <div class="note">⚠️ 如果您没有注册 MiToAI 账号，请忽略此邮件。</div>
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
        console.error('[send-auth-email] Resend API error:', resendResponse.status, resendError);
        return new Response(
          JSON.stringify({ success: false, error: '验证码发送失败，请稍后重试' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log('[send-auth-email] Signup OTP sent to:', email);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ─── RECOVERY / MAGICLINK: Generate link and send via Resend ───
    const siteUrl = 'https://mi-to-ai.com';

    // Determine the redirectTo based on type
    const redirectTo = type === 'recovery'
      ? `${siteUrl}/auth/reset-password`
      : `${siteUrl}/auth/callback`;

    // Generate auth link using Supabase Admin API
    const linkType = type === 'recovery' ? 'recovery' as const : 'magiclink' as const;
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: linkType,
      email,
      options: {
        redirectTo,
      },
    });

    if (linkError) {
      console.error('[send-auth-email] generateLink error:', linkError);
      return new Response(
        JSON.stringify({ success: false, error: linkError.message }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawActionLink = linkData?.action_link || linkData?.properties?.action_link;
    if (!rawActionLink) {
      console.error('[send-auth-email] No action_link returned from generateLink');
      return new Response(
        JSON.stringify({ success: false, error: '生成验证链接失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ─── Build our own verification URL ───
    // Supabase generateLink always strips the path from redirect_to, so we cannot
    // use its action_link directly. Instead, extract the hashed_token from the
    // response and build a URL pointing to OUR callback page.
    const hashedToken = linkData?.hashed_token || linkData?.properties?.hashed_token;
    const emailOtp = linkData?.email_otp || linkData?.properties?.email_otp;

    let actionLink: string;
    if (hashedToken) {
      // Build our own URL with token_hash — bypasses Supabase verify endpoint entirely
      const verifyUrl = new URL(redirectTo);
      verifyUrl.searchParams.set('token_hash', hashedToken);
      verifyUrl.searchParams.set('type', linkType);
      verifyUrl.searchParams.set('email', email);
      actionLink = verifyUrl.toString();
      console.log('[send-auth-email] Built custom verification URL:', actionLink.substring(0, 120) + '...');
      if (emailOtp) {
        console.log('[send-auth-email] OTP code:', emailOtp);
      }
    } else {
      // Fallback: use Supabase's action_link with manual redirect_to replacement
      console.warn('[send-auth-email] No hashed_token, falling back to action_link with redirect_to fix');
      let fixedLink = rawActionLink;
      try {
        const url = new URL(rawActionLink);
        url.searchParams.set('redirect_to', redirectTo);
        fixedLink = url.toString();
      } catch (e) {
        console.warn('[send-auth-email] Failed to fix redirect_to:', e);
      }
      actionLink = fixedLink;
    }

    // Get email template (pass OTP code for magiclink type)
    const template = getEmailTemplate(type, actionLink, emailOtp || undefined);

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MiToAI <onboarding@resend.dev>',
        to: email,
        subject: template.subject,
        html: template.html,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error('[send-auth-email] Resend API error:', resendResponse.status, resendError);
      return new Response(
        JSON.stringify({ success: false, error: '邮件发送失败，请稍后重试' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resendData = await resendResponse.json();
    console.log('[send-auth-email] Email sent successfully:', resendData);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (e) {
    console.error('[send-auth-email] Unexpected error:', e);
    return new Response(
      JSON.stringify({ success: false, error: '服务器错误，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
