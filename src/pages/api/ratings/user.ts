import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

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

    const { data: ratings, error } = await client
      .from('ratings')
      .select('rating, target_type, target_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ratings: ratings || [] }), { status: 200 });
  } catch (err) {
    console.error('[api/ratings/user] Error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
