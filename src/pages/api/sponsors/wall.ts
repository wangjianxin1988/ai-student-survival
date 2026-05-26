// Sponsor Wall API - returns approved sponsors from Supabase
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  // RLS policy allows public read of approved sponsors
  const { data: sponsors, error } = await supabase
    .from('sponsors')
    .select('id, nickname, display_name, amount, tier, payment_method, message, avatar_url, profile_url, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[sponsors/wall] Error fetching sponsors:', JSON.stringify(error));
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message, code: error.code } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data: sponsors }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
