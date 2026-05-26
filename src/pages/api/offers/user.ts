import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { getAuthHeaders } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const client = supabase;
    const { data: { user }, error: authError } = await client.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: offers, error } = await client
      .from('offers')
      .select('id, university_name, university_slug, program, admission_result, background, tools_used, created_at, user_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ offers: offers || [] }), { status: 200 });
  } catch (err) {
    console.error('[api/offers/user] Error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
