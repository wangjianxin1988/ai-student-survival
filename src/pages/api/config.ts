import type { APIRoute } from 'astro';
import { getCloudflareEnv } from '@/lib/supabase';

export const prerender = false;

/**
 * Public endpoint: returns Supabase URL and anon key for client-side initialization.
 * The anon key is a public API key designed to be exposed to the browser.
 */
export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any)?.runtime;
  
  // Read directly from runtime.env (secrets have higher precedence than [vars])
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL
    || runtime?.env?.SUPABASE_URL 
    || 'https://giynvpfnzzelzwpmsgtf.supabase.co';
    
  const supabaseAnonKey = runtime?.env?.PUBLIC_SUPABASE_ANON_KEY
    || runtime?.env?.SUPABASE_ANON_KEY 
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
