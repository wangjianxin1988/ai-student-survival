export const prerender = false;
import type { APIRoute } from 'astro';

// @ts-ignore
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async () => {
  const rawKey = (env as Record<string, unknown>)['SUPABASE_SERVICE_ROLE_KEY'];
  const keyLen = typeof rawKey === 'string' ? rawKey.length : null;

  return new Response(JSON.stringify({
    keyType: typeof rawKey,
    keyIsEmpty: rawKey === '',
    keyIsNull: rawKey === null,
    keyIsUndefined: rawKey === undefined,
    keyLength: keyLen,
    keyFirstChars: typeof rawKey === 'string' && rawKey.length > 0 ? rawKey.substring(0, 20) : null,
    envKeys: Object.keys(env).filter(k => k.includes('SUPABASE')),
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
