import type { APIRoute } from 'astro';
import { getCloudflareEnv } from '@/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any)?.runtime;
  const envKeys = runtime?.env ? Object.keys(runtime.env) : [];
  const resendKey = getCloudflareEnv('RESEND_API_KEY');
  const resendFromRuntime = runtime?.env?.RESEND_API_KEY;
  const supabaseAnonFromCF = getCloudflareEnv('PUBLIC_SUPABASE_ANON_KEY');
  const supabaseAnonFromRuntime = runtime?.env?.PUBLIC_SUPABASE_ANON_KEY;
  
  return new Response(JSON.stringify({
    hasRuntime: !!runtime,
    envKeys,
    resendKeyLength: resendKey.length,
    resendFromRuntimeLength: typeof resendFromRuntime === 'string' ? resendFromRuntime.length : typeof resendFromRuntime,
    supabaseAnonKeyLength: supabaseAnonFromCF.length,
    supabaseAnonFromRuntimeLength: typeof supabaseAnonFromRuntime === 'string' ? supabaseAnonFromRuntime.length : typeof supabaseAnonFromRuntime,
    supabaseUrl: getCloudflareEnv('PUBLIC_SUPABASE_URL') || 'empty',
  }), { headers: { 'Content-Type': 'application/json' } });
};
