// Users Profile API - get/update user profile from Supabase
// Uses existing `profiles` table (id, user_id, display_name, avatar_url, ...)
// Settings stored in `preferences` jsonb column
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

// GET /api/users/profile - get current user's profile
export const GET: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(
      JSON.stringify({ success: false, error: { message: '请先登录' } }),
      { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  // Get profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', serverUser.id)
    .single();

  // Get auth user metadata for name/email/avatar
  let authName = serverUser.name || '';
  let authEmail = serverUser.email || '';
  let authAvatar = '';

  try {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(serverUser.id);
    if (userData?.user) {
      authName = (userData.user.user_metadata?.name as string) || (userData.user.user_metadata?.full_name as string) || authName;
      authEmail = userData.user.email || authEmail;
      authAvatar = (userData.user.user_metadata?.avatar_url as string) || (userData.user.user_metadata?.picture as string) || '';
    }
  } catch {
    // Admin API might not be available, use server user data
  }

  const prefs = (profile?.preferences as Record<string, unknown>) || {};

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        id: serverUser.id,
        email: authEmail,
        name: profile?.display_name || authName,
        bio: (prefs.bio as string) || '',
        avatar: profile?.avatar_url || authAvatar,
        privacy: (prefs.privacy as string) || 'public',
        notifications: (prefs.notifications as Record<string, boolean>) || {
          email: true,
          newFollower: true,
          newComment: true,
          newFavorite: true,
          newRating: true,
          weeklyDigest: false,
        },
        language: profile?.native_language || (prefs.language as string) || 'zh',
        points: profile?.points || 0,
        badges: profile?.badges || [],
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};

// PUT /api/users/profile - update current user's profile
export const PUT: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(
      JSON.stringify({ success: false, error: { message: '请先登录' } }),
      { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  const body = await request.json();
  const { name, bio, avatar_url, privacy, notifications, language } = body;

  // Get existing profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('user_id', serverUser.id)
    .single();

  const existingPrefs = (existingProfile?.preferences as Record<string, unknown>) || {};

  // Build update data
  const updateData: Record<string, unknown> = {
    user_id: serverUser.id,
    updated_at: new Date().toISOString(),
    preferences: {
      ...existingPrefs,
      ...(bio !== undefined ? { bio } : {}),
      ...(privacy !== undefined ? { privacy } : {}),
      ...(notifications !== undefined ? { notifications } : {}),
      ...(language !== undefined ? { language } : {}),
    },
  };

  if (name !== undefined) updateData.display_name = name;
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
  if (language !== undefined) updateData.native_language = language;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updateData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[users/profile] Error updating profile:', error);
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
};
