import type { APIRoute } from 'astro';
import { checkSensitiveEndpoint, SENSITIVE_ENDPOINTS } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';

export const prerender = false;

const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
};

interface ContactRequest {
  name: string;
  email: string;
  type: 'feedback' | 'bug' | 'feature' | 'other';
  message: string;
  captchaVerified?: boolean;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 2000); // Limit length
}

const TYPE_LABELS: Record<string, { zh: string; en: string }> = {
  feedback: { zh: '功能反馈', en: 'Feature Feedback' },
  bug: { zh: '问题报告', en: 'Bug Report' },
  feature: { zh: '功能建议', en: 'Feature Request' },
  other: { zh: '其他', en: 'Other' },
};

async function sendContactEmail(data: {
  name: string;
  email: string;
  type: string;
  message: string;
  ip: string;
  createdAt: string;
}): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  const toEmail = import.meta.env.CONTACT_TO_EMAIL || '188801400211@163.com';

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, email will not be sent');
    return { success: false, error: 'Email service not configured' };
  }

  const typeLabel = TYPE_LABELS[data.type] || TYPE_LABELS.other;
  const subject = `[AI留学生存指南] 新的联系表单提交 - ${typeLabel.zh}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 24px; }
    .field { margin-bottom: 16px; }
    .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { font-size: 15px; color: #1e293b; background: #f8fafc; padding: 10px 14px; border-radius: 8px; }
    .message-content { background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea; white-space: pre-wrap; word-break: break-word; line-height: 1.6; }
    .meta { display: flex; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .meta-item { font-size: 13px; color: #64748b; }
    .meta-item span { color: #1e293b; }
    .footer { text-align: center; padding: 16px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 新的联系表单提交</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">姓名</div>
        <div class="value">${escapeHtml(data.name)}</div>
      </div>
      <div class="field">
        <div class="label">邮箱</div>
        <div class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
      </div>
      <div class="field">
        <div class="label">类型</div>
        <div class="value">${typeLabel.zh} / ${typeLabel.en}</div>
      </div>
      <div class="field">
        <div class="label">消息内容</div>
        <div class="message-content">${escapeHtml(data.message)}</div>
      </div>
      <div class="meta">
        <div class="meta-item">提交时间: <span>${data.createdAt}</span></div>
        <div class="meta-item">IP地址: <span>${data.ip}</span></div>
      </div>
    </div>
    <div class="footer">
      此邮件由 AI 留学生存指南 (mi-to-ai.com) 自动发送
    </div>
  </div>
</body>
</html>
`;

  const textContent = `
新的联系表单提交

姓名: ${data.name}
邮箱: ${data.email}
类型: ${typeLabel.zh} (${typeLabel.en})
时间: ${data.createdAt}
IP: ${data.ip}

消息内容:
${data.message}

---
此邮件由 AI 留学生存指南 (mi-to-ai.com) 自动发送
`.trim();

  try {
    // Use Resend REST API via fetch (works in all runtimes including Cloudflare Workers)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AI留学生存指南 <noreply@mi-to-ai.com>',
        to: [toEmail],
        reply_to: data.email,
        subject,
        text: textContent,
        html: htmlContent,
      }),
    });

    const result = await response.json() as { id?: string; error?: { message: string } };

    if (!response.ok || result.error) {
      console.error('Resend email error:', result.error || response.statusText);
      return { success: false, error: result.error?.message || response.statusText };
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Check rate limit for contact form
    const rateLimitResult = checkSensitiveEndpoint(SENSITIVE_ENDPOINTS.CONTACT, clientIP);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: `提交过于频繁，请 ${rateLimitResult.retryAfter} 秒后再试`,
          },
        }),
        {
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': (rateLimitResult.retryAfter || 60).toString(),
          },
        }
      );
    }

    const body: ContactRequest = await request.json();
    const { name, email, type, message, captchaVerified } = body;

    // Validate required fields
    if (!name || !email || !type || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '请填写所有必填字段' },
        }),
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'INVALID_EMAIL', message: '请输入有效的邮箱地址' },
        }),
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Validate type
    if (!['feedback', 'bug', 'feature', 'other'].includes(type)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'INVALID_TYPE', message: '无效的反馈类型' },
        }),
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedMessage = sanitizeInput(message);

    // Check message length
    if (sanitizedMessage.length < 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'MESSAGE_TOO_SHORT', message: '反馈内容太短，请详细描述您的问题或建议' },
        }),
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const contactData = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: sanitizedName,
      email: sanitizedEmail,
      type,
      message: sanitizedMessage,
      captchaVerified: captchaVerified || false,
      createdAt: new Date().toISOString(),
      ip: clientIP,
    };

    // Send email notification via Resend
    const emailResult = await sendContactEmail(contactData);

    if (!emailResult.success) {
      console.warn('Email sending failed:', emailResult.error);
    }

    // Persist to database (dual storage - survives even if email fails)
    let dbRecordId: string | null = null;
    try {
      const { data: dbData, error: dbError } = await supabaseAdmin
        .from('contact_messages')
        .insert({
          name: sanitizedName,
          email: sanitizedEmail,
          type,
          message: sanitizedMessage,
          ip_address: clientIP,
          captcha_verified: captchaVerified || false,
          email_sent: emailResult.success,
          status: 'pending',
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('Failed to save contact message to database:', dbError);
      } else {
        dbRecordId = dbData?.id || null;
      }
    } catch (dbErr) {
      console.error('Database save error:', dbErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: dbRecordId || contactData.id,
          message: emailResult.success
            ? '感谢您的反馈！我们会尽快处理。'
            : '您的反馈已收到，我们会尽快处理。（系统通知已发送）',
        },
      }),
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: '服务器错误，请稍后重试' },
      }),
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
};

export const GET: APIRoute = async () => {
  // Return contact page info
  return new Response(
    JSON.stringify({
      success: true,
      data: {
        types: [
          { value: 'feedback', label: '功能反馈', labelEn: 'Feedback' },
          { value: 'bug', label: '问题报告', labelEn: 'Bug Report' },
          { value: 'feature', label: '功能建议', labelEn: 'Feature Request' },
          { value: 'other', label: '其他', labelEn: 'Other' },
        ],
        developerContact: {
          wechat: import.meta.env.PUBLIC_DEVELOPER_WECHAT || 'jian_xin_happy',
          email: import.meta.env.PUBLIC_DEVELOPER_EMAIL || 'contact@mi-to-ai.com',
        },
      },
    }),
    { status: 200, headers: SECURITY_HEADERS }
  );
};
