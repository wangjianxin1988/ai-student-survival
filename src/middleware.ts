import { defineMiddleware } from 'astro:middleware';
import { setCloudflareEnv } from '@/lib/supabase';

export const onRequest = defineMiddleware((context, next) => {
  // Inject Cloudflare runtime env into supabase module
  // This makes SUPABASE_SERVICE_ROLE_KEY available to supabaseAdmin
  const runtime = (context.locals as any)?.runtime;
  if (runtime?.env) {
    setCloudflareEnv(runtime.env);
  }
  return next();
});
