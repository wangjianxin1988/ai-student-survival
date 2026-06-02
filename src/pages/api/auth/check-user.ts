import type { APIRoute } from 'astro';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ exists: false, provider: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (!isSupabaseConfigured) {
      return new Response(JSON.stringify({ exists: false, provider: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Use the SECURITY DEFINER RPC function to check OAuth provider
    const { data, error } = await supabase.rpc('get_oauth_provider_v2', {
      p_email: email.toLowerCase(),
    });

    if (error) {
      console.error('[check-user] RPC error:', JSON.stringify(error), 'email:', email);
      return new Response(JSON.stringify({ exists: false, provider: null, fallback: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (data && typeof data === 'string') {
      return new Response(JSON.stringify({
        exists: true,
        provider: data,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // No OAuth account found
    return new Response(JSON.stringify({ exists: false, provider: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('[check-user] Unexpected error:', e);
    return new Response(JSON.stringify({ exists: false, provider: null, fallback: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
