import type { APIRoute } from 'astro';
import { getCloudflareEnv } from '@/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any)?.runtime;
  const envKeys = runtime?.env ? Object.keys(runtime.env) : [];
  const resendKey = getCloudflareEnv('RESEND_API_KEY');
  const resendFromRuntime = runtime?.env?.RESEND_API_KEY;
  
  return new Response(JSON.stringify({
    hasRuntime: !!runtime,
    envKeys,
    resendKeyLength: resendKey.length,
    resendFromRuntimeLength: typeof resendFromRuntime === 'string' ? resendFromRuntime.length : typeof resendFromRuntime,
    supabaseUrl: getCloudflareEnv('PUBLIC_SUPABASE_URL') || runtime?.env?.SUPABASE_URL || 'not set',
    supabaseAnonKeyLength: (getCloudflareEnv('PUBLIC_SUPABASE_ANON_KEY') || runtime?.env?.SUPABASE_ANON_KEY || '').length,
  }), { headers: { 'Content-Type': 'application/json' } });
};
