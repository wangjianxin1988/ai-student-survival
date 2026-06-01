import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

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
    // This works without needing the service role key in the browser bundle
    const { data, error } = await supabase.rpc('get_oauth_provider_v2', {
      p_email: email.toLowerCase(),
    });

    if (error) {
      console.error('[check-user] RPC error:', JSON.stringify(error), 'email:', email);
      // Fall back to generic message
      return new Response(JSON.stringify({ exists: false, provider: null, fallback: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (data && typeof data === 'string') {
      // RPC returned a provider — but the auth.identities row may be stale
      // (user deleted from auth.users but identity row left behind).
      // Verify the user actually exists in auth.users before returning the provider.
      try {
        const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (!listError && userData?.users) {
          const userExists = userData.users.some(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );
          if (!userExists) {
            // Stale identity — user doesn't exist in auth.users
            return new Response(JSON.stringify({ exists: false, provider: null }),
              { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        }
        // If listUsers fails, trust the RPC result (better to show OAuth hint than block login)
      } catch (verifyErr) {
        console.warn('[check-user] User verification failed, trusting RPC:', verifyErr);
      }

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
