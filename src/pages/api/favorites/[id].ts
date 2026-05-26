import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const prerender = false;

export function getStaticPaths() {
  return [];
}

export const DELETE: APIRoute = async ({ request, params }) => {
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

  const { id } = params;

  const { error } = await client
    .from('user_favorites')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(null, { status: 204 });
};
