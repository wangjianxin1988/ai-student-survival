export const prerender = false;

import type { APIRoute } from 'astro';

// @ts-ignore
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async () => {
  const result: Record<string, unknown> = {
    envType: typeof env,
    envIsObject: typeof env === 'object' && env !== null,
  };

  if (typeof env === 'object' && env !== null) {
    result.envKeys = Object.keys(env);
    result.envEntries = Object.entries(env);

    // Check for the specific key
    result.directAccess = {
      viaDot: env['SUPABASE_SERVICE_ROLE_KEY'],
      viaBracket: env['SUPABASE_SERVICE_ROLE_KEY'],
      viaReflect: Reflect.get(env, 'SUPABASE_SERVICE_ROLE_KEY'),
    };

    // Check property descriptors
    const desc = Object.getOwnPropertyDescriptor(env, 'SUPABASE_SERVICE_ROLE_KEY');
    result.propertyDescriptor = desc ? {
      value: desc.value,
      writable: desc.writable,
      enumerable: desc.enumerable,
      configurable: desc.configurable,
    } : 'not own property';

    // Try getOwnPropertyNames
    result.ownPropNames = Object.getOwnPropertyNames(env);

    // Try for...in
    const forInKeys: string[] = [];
    for (const k in env) { forInKeys.push(k); }
    result.forInKeys = forInKeys;

    // Check if Proxy
    result.isProxy = env.toString().includes('Proxy');
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
