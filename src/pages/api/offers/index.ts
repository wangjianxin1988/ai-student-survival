import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project');

export const prerender = false;

// Demo mode storage
const DEMO_OFFERS_KEY = 'demo_offers';

// Standard security headers for API responses
const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  // CORS: Public read-only data - no authentication required
  'Access-Control-Allow-Origin': '*',
};

function getDemoOffers(): Record<string, any[]> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(DEMO_OFFERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

export const GET: APIRoute = async () => {
  // Demo mode - return offers from localStorage
  if (!isConfigured) {
    return new Response(JSON.stringify({ success: true, data: [], demo: true }), {
      status: 200,
      headers: SECURITY_HEADERS,
    });
  }

  const client = createClient(supabaseUrl, supabaseAnonKey);

  const { data: offers, error } = await client
    .from('offers')
    .select(`
      id,
      university_name,
      university_slug,
      program,
      admission_result,
      background,
      tools_used,
      created_at,
      user_id
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ success: false, error: { code: 'DB_ERROR', message: error.message } }), {
      status: 500,
      headers: SECURITY_HEADERS,
    });
  }

  return new Response(JSON.stringify({ success: true, data: offers }), {
    status: 200,
    headers: SECURITY_HEADERS,
  });
};

export const POST: APIRoute = async ({ request }) => {
  // Demo mode - return success without storing
  if (!isConfigured) {
    const demoOffer = {
      id: 'demo-' + Date.now(),
      university_name: '演示大学',
      program: '演示项目',
      admission_result: 'accepted',
      created_at: new Date().toISOString(),
    };
    return new Response(JSON.stringify({ success: true, data: demoOffer, demo: true }), {
      status: 201,
      headers: SECURITY_HEADERS,
    });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }), {
      status: 401,
      headers: SECURITY_HEADERS,
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: authError } = await client.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }), {
      status: 401,
      headers: SECURITY_HEADERS,
    });
  }

  const body = await request.json();
  const { university_name, university_slug, program, admission_result, background, tools_used } = body;

  if (!university_name || !program || !admission_result) {
    return new Response(JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', message: 'university_name, program, and admission_result are required' } }), {
      status: 400,
      headers: SECURITY_HEADERS,
    });
  }

  const { data, error } = await client
    .from('offers')
    .insert({
      user_id: user.id,
      university_name,
      university_slug: university_slug || university_name.toLowerCase().replace(/\s+/g, '-'),
      program,
      admission_result,
      background,
      tools_used: tools_used || [],
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ success: false, error: { code: 'DB_ERROR', message: error.message } }), {
      status: 500,
      headers: SECURITY_HEADERS,
    });
  }

  return new Response(JSON.stringify({ success: true, data }), {
    status: 201,
    headers: SECURITY_HEADERS,
  });
};
