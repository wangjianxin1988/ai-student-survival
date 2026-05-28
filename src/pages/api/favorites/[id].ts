import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

export const prerender = false;

export function getStaticPaths() {
  return [];
}

export const DELETE: APIRoute = async ({ request, params }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { id } = params;

  const { error } = await supabaseAdmin
    .from('user_favorites')
    .delete()
    .eq('id', id)
    .eq('user_id', serverUser.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(null, { status: 204 });
};
