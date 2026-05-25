import type { APIRoute } from 'astro';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response(JSON.stringify({ error: 'email param required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!isSupabaseConfigured) {
    return new Response(JSON.stringify({ error: 'Supabase not configured' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Call the existing RPC function
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_oauth_provider_v2', {
    p_email: email.toLowerCase(),
  });

  // Try to get identities via a direct query through auth schema
  // This uses SECURITY DEFINER so it should work with service role privileges
  const { data: identityData, error: identityError } = await supabase.rpc('get_oauth_provider_v2', {
    p_email: email.toLowerCase(),
  });

  // Try getting raw user data through a debug RPC
  let rawData = null;
  try {
    const { data } = await supabase.rpc('get_oauth_provider_v2' as any, {
      p_email: email.toLowerCase(),
    });
    rawData = data;
  } catch (e: any) {
    rawData = e.message;
  }

  return new Response(JSON.stringify({
    rpc_result: rpcData,
    rpc_error: rpcError ? rpcError.message : null,
    raw_data: rawData,
    identities_result: identityData,
    identities_error: identityError ? identityError.message : null,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
