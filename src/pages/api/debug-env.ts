export const prerender = false;

import type { APIRoute } from 'astro';
import type { Runtime } from '@astrojs/cloudflare';

export const GET: APIRoute = async ({ locals }) => {
  const runtime = locals.runtime as Runtime;

  return new Response(JSON.stringify({
    hasRuntime: !!runtime,
    runtimeType: typeof runtime,
    runtimeKeys: runtime ? Object.keys(runtime) : [],
    envKeys: runtime?.env ? Object.keys(runtime.env as Record<string, unknown>) : [],
    supabaseServiceKey: runtime?.env
      ? ((runtime.env as Record<string, unknown>).SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[UNDEFINED]')
      : '[NO ENV]',
    processEnv: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[UNDEFINED]',
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
