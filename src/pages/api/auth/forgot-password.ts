import type { APIRoute } from 'astro';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        message: error.message.includes('not found')
          ? '该邮箱尚未注册'
          : '发送失败，请稍后重试'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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