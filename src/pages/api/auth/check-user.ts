import type { APIRoute } from 'astro';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({
        exists: false,
        type: null,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (!isSupabaseConfigured) {
      return new Response(JSON.stringify({
        exists: false,
        type: null,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Use Supabase admin client to find user by email
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Check user error:', error.message);
      return new Response(JSON.stringify({
        exists: false,
        type: null,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const users = data?.users || [];
    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return new Response(JSON.stringify({
        exists: false,
        type: null,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if user has OAuth identities (registered via Google/GitHub)
    const identities = user.identities || [];
    const hasOAuth = identities.length > 0;

    return new Response(JSON.stringify({
      exists: true,
      type: hasOAuth ? 'oauth' : 'password',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Check user error:', e);
    return new Response(JSON.stringify({
      exists: false,
      type: null,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
