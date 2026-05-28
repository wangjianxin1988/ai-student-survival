// Follows API - manage follow relationships in Supabase
// Uses existing `user_follows` table (id, follower_id, following_id, created_at)
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

// GET /api/follows?type=following|followers&user_id=xxx
export const GET: APIRoute = async ({ request, url }) => {
  const serverUser = await getServerUser(request);

  const targetUserId = url.searchParams.get('user_id') || serverUser?.id;
  const type = url.searchParams.get('type') || 'following';

  if (!targetUserId) {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'user_id is required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  if (type === 'following') {
    // Get users that targetUserId follows
    const { data, error } = await supabaseAdmin
      .from('user_follows')
      .select('following_id, created_at')
      .eq('follower_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[follows] Error fetching following:', error);
      return new Response(
        JSON.stringify({ success: false, error: { message: error.message } }),
        { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: data || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  } else {
    // Get followers of targetUserId
    const { data, error } = await supabaseAdmin
      .from('user_follows')
      .select('follower_id, created_at')
      .eq('following_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[follows] Error fetching followers:', error);
      return new Response(
        JSON.stringify({ success: false, error: { message: error.message } }),
        { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: data || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};

// POST /api/follows { following_id: string }
export const POST: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(
      JSON.stringify({ success: false, error: { message: '请先登录' } }),
      { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const body = await request.json();
  const { following_id } = body;

  if (!following_id) {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'following_id is required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  if (following_id === serverUser.id) {
    return new Response(
      JSON.stringify({ success: false, error: { message: '不能关注自己' } }),
      { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('user_follows')
    .insert({ follower_id: serverUser.id, following_id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return new Response(
        JSON.stringify({ success: false, error: { message: '已经关注了' } }),
        { status: 409, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }
    console.error('[follows] Error creating follow:', error);
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 201, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};

// DELETE /api/follows { following_id: string }
export const DELETE: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(
      JSON.stringify({ success: false, error: { message: '请先登录' } }),
      { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const body = await request.json();
  const { following_id } = body;

  if (!following_id) {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'following_id is required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const { error } = await supabaseAdmin
    .from('user_follows')
    .delete()
    .eq('follower_id', serverUser.id)
    .eq('following_id', following_id);

  if (error) {
    console.error('[follows] Error deleting follow:', error);
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
