import type { APIRoute } from 'astro';
import { getCloudflareEnv } from '@/lib/supabase';

export const prerender = false;

/**
 * Public endpoint: returns Supabase URL and anon key for client-side initialization.
 * The anon key is a public API key designed to be exposed to the browser.
 */
export const GET: APIRoute = async ({ locals }) => {
  // Use getCloudflareEnv() which reads from the injected Cloudflare env bindings.
  // Direct runtime.env access returns empty values in some Cloudflare Pages configurations.
  const supabaseUrl = getCloudflareEnv('PUBLIC_SUPABASE_URL')
    || 'https://giynvpfnzzelzwpmsgtf.supabase.co';
    
  const supabaseAnonKey = getCloudflareEnv('PUBLIC_SUPABASE_ANON_KEY')
    || '';

  return new Response(
    JSON.stringify({ url: supabaseUrl, anonKey: supabaseAnonKey }),
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      } 
    }
  );
};
