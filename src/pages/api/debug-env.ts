export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const pEnv = process.env;
  const supabaseRelated: Record<string, string> = {};
  const cloudflareRelated: Record<string, string> = {};

  for (const [k, v] of Object.entries(pEnv)) {
    if (k.includes('SUPABASE') || k.includes('CLOUDFLARE') || k.includes('PUBLIC')) {
      supabaseRelated[k] = v ? '[SET]' : '[EMPTY]';
    }
  }

  return new Response(JSON.stringify({
    allEnvKeys: Object.keys(pEnv).sort(),
    supabaseRelated,
    hasLocals: !!locals,
    localsKeys: Object.keys(locals),
    localsRuntime: typeof locals.runtime,
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
