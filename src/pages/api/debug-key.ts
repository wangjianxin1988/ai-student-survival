import type { APIRoute } from 'astro';
import { getCloudflareEnv } from '@/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any)?.runtime;
  const srKey = getCloudflareEnv('SUPABASE_SERVICE_ROLE_KEY');
  const srFromRuntime = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY;
  
  return new Response(JSON.stringify({
    srKeyLength: srKey.length,
    srKeyFirst20: srKey.substring(0, 20),
    srKeyLast15: srKey.substring(srKey.length - 15),
    srFromRuntimeLength: typeof srFromRuntime === 'string' ? srFromRuntime.length : typeof srFromRuntime,
    srFromRuntimeFirst20: typeof srFromRuntime === 'string' ? srFromRuntime.substring(0, 20) : 'N/A',
  }), { headers: { 'Content-Type': 'application/json' } });
};
