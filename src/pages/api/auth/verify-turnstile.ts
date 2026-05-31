import type { APIRoute } from 'astro';

const TURNSTILE_SECRET_KEY = import.meta.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing Turnstile token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    
    const ip = request.headers.get('cf-connecting-ip');
    if (ip) formData.append('remoteip', ip);

    const result = await fetch(VERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const outcome = await result.json();

    return new Response(
      JSON.stringify({ success: outcome.success }),
      {
        status: outcome.success ? 200 : 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Verification failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
