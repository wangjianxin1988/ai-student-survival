// User public stats API - returns stats for a specific user
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  const userId = params.id;

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'User ID is required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Fetch user metadata from auth.users using admin client (bypasses RLS)
  const { data: user, error: userError } = await supabaseAdmin
    .from('auth.users' as any)
    .select('id, email, user_metadata, created_at')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    // User not found in auth.users - try user_points_balance as fallback
    const { data: balanceData } = await supabaseAdmin
      .from('user_points_balance')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!balanceData) {
      return new Response(
        JSON.stringify({ success: false, error: { message: 'User not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userId,
          name: `用户${userId.substring(0, 8)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          email: '',
          points: balanceData.balance || 0,
          totalEarned: balanceData.total_earned || 0,
          totalSpent: balanceData.total_spent || 0,
          postsCount: 0,
          commentsCount: 0,
          joinDate: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get user points balance using admin client
  const { data: balanceData } = await supabaseAdmin
    .from('user_points_balance')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get post count
  const { count: postsCount } = await supabaseAdmin
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'published');

  // Get comments count
  const { count: commentsCount } = await supabaseAdmin
    .from('post_comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const meta = user.user_metadata as Record<string, unknown> || {};

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        userId: user.id,
        name: (meta.name as string) || (meta.full_name as string) || `用户${user.id.substring(0, 8)}`,
        avatar: (meta.avatar_url as string) || (meta.picture as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        email: user.email || '',
        points: balanceData?.balance || 0,
        totalEarned: balanceData?.total_earned || 0,
        totalSpent: balanceData?.total_spent || 0,
        postsCount: postsCount || 0,
        commentsCount: commentsCount || 0,
        joinDate: user.created_at || new Date().toISOString(),
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
