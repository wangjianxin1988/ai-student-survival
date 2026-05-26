export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Cloudflare Workers/Pages: try to access the env via the global fetch handler context
  // In Cloudflare Workers, env is passed as the second argument to the fetch handler
  // In Astro with Cloudflare adapter, we need to access it via globalThis._cf_
  // or via the specific Workers runtime APIs

  let result: Record<string, unknown> = {
    processEnvKeys: Object.keys(process.env || {}),
    globalKeys: Object.keys(globalThis || {}),
  };

  // Check if we're in a CF Workers context
  // @ts-ignore
  if (typeof globalThis.caches !== 'undefined') {
    result.inCfWorkers = true;
  }

  // Try Cloudflare-specific bindings
  // @ts-ignore
  if (typeof globalThis.__env__ !== 'undefined') {
    result.__env__ = globalThis.__env__;
  }

  // Check for Cloudflare request context
  // @ts-ignore
  if (typeof globalThis.navigator !== 'undefined') {
    result.navUA = String((globalThis.navigator as Record<string, unknown>).userAgent || '').substring(0, 50);
  }

  // Try to check if there's an Astro Cloudflare platform proxy
  // @ts-ignore
  const cfRuntime = (globalThis as Record<string, unknown>)['__astro_runtime__'];
  if (cfRuntime) {
    result.astroRuntime = typeof cfRuntime;
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
