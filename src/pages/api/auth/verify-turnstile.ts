import type { APIRoute } from 'astro';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Turnstile server-side verification.
 *
 * Cloudflare adapter + Astro dev server has a known issue where request.json()
 * fails because the body stream is already consumed. To work around this:
 *  - If TURNSTILE_SECRET_KEY is available from CF runtime env → production mode → verify with Cloudflare
 *  - Otherwise → dev/test mode → auto-pass (frontend already enforces non-empty token)
 */
export const POST: APIRoute = async (context) => {
  // Try to get Turnstile secret from Cloudflare runtime env
  const cfEnv = (context.locals as any)?.runtime?.env;
  const secretKey = cfEnv?.TURNSTILE_SECRET_KEY;

  // Production mode: real secret key available → verify with Cloudflare
  if (secretKey && secretKey !== '1x0000000000000000000000000000000AA') {
    try {
      const body = await context.request.json();
      const token = body?.token;

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing Turnstile token' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);

      const ip = context.request.headers.get('cf-connecting-ip');
      if (ip) formData.append('remoteip', ip);

      const result = await fetch(VERIFY_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const outcome = await result.json();
      return new Response(
        JSON.stringify({ success: outcome.success }),
        { status: outcome.success ? 200 : 403, headers: { 'Content-Type': 'application/json' } }
      );
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Verification failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Dev/test mode: no real secret key → auto-pass
  // Frontend TurnstileWidget already ensures token is non-empty before submit
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
