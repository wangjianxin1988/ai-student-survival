export const prerender = false;

import type { APIRoute } from 'astro';

// @ts-ignore
import { env as cfEnv } from 'cloudflare:workers';

export const GET: APIRoute = async () => {
  const key: unknown = (cfEnv as Record<string, unknown>)['SUPABASE_SERVICE_ROLE_KEY'];
  const url: unknown = (cfEnv as Record<string, unknown>)['SUPABASE_URL'];

  return new Response(JSON.stringify({
    cfEnvKeys: cfEnv ? Object.keys(cfEnv) : [],
    keyType: typeof key,
    keyIsEmpty: key === '',
    keyIsNull: key === null,
    keyIsUndefined: key === undefined,
    keyLength: typeof key === 'string' ? key.length : null,
    keyFirst10: typeof key === 'string' && key.length > 0 ? key.substring(0, 10) : null,
    urlValue: typeof url === 'string' ? url.substring(0, 20) : String(url),
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const GET: APIRoute = async () => {
  // Cloudflare global
  // @ts-ignore
  const cfGlobal = (globalThis as Record<string, unknown>)['Cloudflare'];
  // @ts-ignore
  const cfModule = typeof Cloudflare !== 'undefined' ? Cloudflare : undefined;

  let envAccess: Record<string, unknown> = {};

  // Try cloudflare:workers import
  let cfWorkersEnv = null;
  try {
    // @ts-ignore
    const mod = await import('cloudflare:workers');
    envAccess.cloudflareWorkersModuleKeys = mod ? Object.keys(mod) : null;
    if (mod && mod.env) {
      cfWorkersEnv = mod.env;
      envAccess.cloudflareWorkersEnv = typeof mod.env;
      envAccess.cloudflareWorkersEnvKeys = Object.keys(mod.env).filter(k => k.includes('SUPABASE'));
    }
  } catch (e) {
    envAccess.cloudflareWorkersError = String(e);
  }

  // Try process (CF polyfill)
  // @ts-ignore
  const proc = (globalThis as Record<string, unknown>)['process'];
  if (proc && typeof proc === 'object') {
    const procObj = proc as Record<string, unknown>;
    envAccess.processEnvKeys = Object.keys(procObj.env || {}).filter(k =>
      k.includes('SUPABASE') || k.includes('CLOUDFLARE') || k.includes('PUBLIC')
    );
  }

  // Cloudflare global
  envAccess.cfGlobalKeys = cfGlobal ? Object.keys(cfGlobal as object) : null;
  envAccess.cfModuleKeys = cfModule ? Object.keys(cfModule) : null;

  return new Response(JSON.stringify(envAccess, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
