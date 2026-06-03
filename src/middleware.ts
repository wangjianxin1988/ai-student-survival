import { defineMiddleware } from 'astro:middleware';
import { setCloudflareEnv } from '@/lib/supabase';

export const onRequest = defineMiddleware((context, next) => {
  // Inject Cloudflare runtime env into supabase module
  const runtime = (context.locals as any)?.runtime;
  if (runtime?.env) {
    setCloudflareEnv(runtime.env);
  }

  return next().then((response) => {
    // Add security headers to all responses
    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      
      // Prevent clickjacking
      headers.set('X-Frame-Options', 'SAMEORIGIN');
      
      // Prevent MIME type sniffing
      headers.set('X-Content-Type-Options', 'nosniff');
      
      // Referrer policy
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Permissions policy - restrict sensitive APIs
      headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
      
      // Content Security Policy (enforcing)
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://cdn.jsdelivr.net https://pagead2.googlesyndication.com https://adservice.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://giynvpfnzzelzwpmsgtf.supabase.co https://api.resend.com https://api.anthropic.com wss://giynvpfnzzelzwpmsgtf.supabase.co https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://adservice.google.com https://googleads.g.doubleclick.net https://www.google.com",
        "frame-src 'self' https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');
      headers.set('Content-Security-Policy', csp);
      
      // HSTS - force HTTPS for 1 year
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    return response;
  });
});
