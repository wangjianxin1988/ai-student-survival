export const prerender = false;

import type { APIRoute } from 'astro';

// @ts-ignore - cloudflare:workers is available in Cloudflare Pages runtime
import { env as cfEnv } from 'cloudflare:workers';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    process_env: {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[UNDEFINED]',
    },
    cloudflare_workers_env: {
      SUPABASE_SERVICE_ROLE_KEY: (cfEnv as any).SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[UNDEFINED]',
    },
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
