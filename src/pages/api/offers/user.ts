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
    const { data: offers, error } = await supabaseAdmin
      .from('offers')
      .select('id, university_name, university_slug, program, admission_result, background, tools_used, created_at, user_id')
      .eq('user_id', serverUser.id)
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
