import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { data: ratings, error } = await supabaseAdmin
      .from('ratings')
      .select('rating, target_type, target_id, created_at')
      .eq('user_id', serverUser.id)
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
