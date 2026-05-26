export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any).runtime;
  const cfEnv = runtime?.env;

  return new Response(JSON.stringify({
    process_env: {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[UNDEFINED]',
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '[SET]' : '[UNDEFINED]',
    },
    runtime_env: cfEnv ? {
      SUPABASE_SERVICE_ROLE_KEY: cfEnv.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[UNDEFINED]',
      SUPABASE_URL: cfEnv.SUPABASE_URL,
      SUPABASE_ANON_KEY: cfEnv.SUPABASE_ANON_KEY ? '[SET]' : '[UNDEFINED]',
    } : '[NO RUNTIME]',
    cloudflare_workers_env: typeof globalThis !== 'undefined' ? '[GLOBAL]' : '[NO_GLOBAL]',
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
