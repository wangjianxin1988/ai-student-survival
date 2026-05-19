import type { APIRoute } from 'astro';
import { checkSensitiveEndpoint, SENSITIVE_ENDPOINTS } from '@/lib/rate-limit';

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

    // Store contact message (in production, this would go to a database or email service)
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

    // In production, send email notification here using a service like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer (with SMTP)

    // For now, store in localStorage for demo (and console log for visibility)
    if (typeof window !== 'undefined') {
      const contacts = JSON.parse(localStorage.getItem('demo_contacts') || '[]');
      contacts.push(contactData);
      localStorage.setItem('demo_contacts', JSON.stringify(contacts));
    }

    console.log('Contact form submission:', JSON.stringify(contactData, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: contactData.id,
          message: '感谢您的反馈！我们会尽快处理。',
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
          wechat: 'jian_xin_happy',
          email: 'contact@example.com',
        },
      },
    }),
    { status: 200, headers: SECURITY_HEADERS }
  );
};
