// User public stats API - returns stats for a specific user
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  const userId = params.id;

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'User ID is required' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get user points balance using supabase client with RLS
  const { data: balanceData } = await supabase
    .from('user_points_balance')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get post count (community_posts has public read policy)
  const { count: postsCount } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'published');

  // Get comments count
  const { count: commentsCount } = await supabase
    .from('post_comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const seed = userId.substring(0, 8);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        userId,
        name: `用户${seed}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
        email: '',
        points: balanceData?.balance || 0,
        totalEarned: balanceData?.total_earned || 0,
        totalSpent: balanceData?.total_spent || 0,
        postsCount: postsCount || 0,
        commentsCount: commentsCount || 0,
        joinDate: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
