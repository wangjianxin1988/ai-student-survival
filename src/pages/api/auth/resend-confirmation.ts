import type { APIRoute } from 'astro';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isSupabaseConfigured) {
    return new Response(JSON.stringify({ success: false, error: 'Supabase not configured' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const origin = typeof import.meta.env !== 'undefined'
      ? (import.meta.env.SITE || 'https://mi-to-ai.com')
      : 'https://mi-to-ai.com';

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('[resend-confirmation] error:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('[resend-confirmation] unexpected error:', e);
    return new Response(JSON.stringify({ success: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
