import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const targetType = url.searchParams.get('target_type');
  const targetId = url.searchParams.get('target_id');

  if (!targetType || !targetId) {
    return new Response(JSON.stringify({ error: 'target_type and target_id are required' }), { status: 400 });
  }

  const { data: ratings, error } = await supabase
    .from('ratings')
    .select('rating, created_at')
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const average = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return new Response(JSON.stringify({
    ratings,
    average: Math.round(average * 10) / 10,
    count: ratings.length,
  }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id, rating } = body;

  if (!target_type || !target_id || !rating) {
    return new Response(JSON.stringify({ error: 'target_type, target_id, and rating are required' }), { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      { user_id: user.id, target_type, target_id, rating },
      { onConflict: 'user_id,target_type,target_id' }
    )
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ rating: data }), { status: 201 });
};
