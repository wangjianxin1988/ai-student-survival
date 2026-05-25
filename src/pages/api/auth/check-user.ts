import type { APIRoute } from 'astro';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ exists: false, type: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (!isSupabaseConfigured) {
      return new Response(JSON.stringify({ exists: false, type: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // List users (paginated, get first page - typically 50 users)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      // Service role key not available at runtime on Cloudflare Pages
      // Fall back to showing helpful generic message
      return new Response(JSON.stringify({ exists: false, type: null, fallback: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const users = data?.users || [];
    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return new Response(JSON.stringify({ exists: false, type: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const identities = user.identities || [];
    const hasOAuth = identities.length > 0;

    return new Response(JSON.stringify({
      exists: true,
      type: hasOAuth ? 'oauth' : 'password',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ exists: false, type: null, fallback: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
