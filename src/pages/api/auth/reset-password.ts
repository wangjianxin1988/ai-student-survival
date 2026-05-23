import type { APIRoute } from 'astro';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        message: '密码至少6个字符',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!isSupabaseConfigured) {
      return new Response(JSON.stringify({
        success: false,
        message: '服务未配置',
      }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }

    // Get the current session from Supabase's auth cookie/localStorage
    // The reset password link from Supabase contains the token in the URL
    // which Supabase automatically processes and stores in its session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return new Response(JSON.stringify({
        success: false,
        message: '会话已过期，请重新点击邮件中的链接',
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(JSON.stringify({
        success: false,
        message: updateError.message || '修改失败，请重试',
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Sign out after password change (user should re-login with new password)
    await supabase.auth.signOut();

    return new Response(JSON.stringify({
      success: true,
      message: '密码修改成功',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Reset password error:', e);
    return new Response(JSON.stringify({
      success: false,
      message: '服务器错误，请稍后重试',
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
