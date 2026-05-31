export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { supabase } from '@/lib/supabase';
import type { CommunityCategory } from '@/lib/community/types';

export const GET: APIRoute = async ({ params, request }) => {
  const postId = params.id;

  if (!postId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Post ID is required' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || undefined;

  const { data: row, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .eq('status', 'published')
    .single();

  if (error || !row) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Question not found' },
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Increment views
  await supabase.rpc('increment_views_count', { post_id: postId });

  // Get user info
  const { data: userData } = await supabase
    .from('users')
    .select('name, avatar_url')
    .eq('id', row.user_id)
    .single();

  const post = {
    id: row.id as string,
    userId: row.user_id as string,
    userName: (userData?.name as string) || 'Anonymous',
    userAvatar: (userData?.avatar_url as string) || '',
    title: row.title as string,
    content: row.content as string,
    excerpt: row.excerpt as string | undefined,
    category: row.category as CommunityCategory,
    tags: (row.tags as string[]) || [],
    images: (row.images as string[]) || [],
    meta: (row.meta as Record<string, unknown>) || undefined,
    likesCount: (row.likes_count as number) || 0,
    commentsCount: (row.comments_count as number) || 0,
    viewsCount: ((row.views_count as number) || 0) + 1,
    favoritesCount: (row.favorites_count as number) || 0,
    isPinned: row.is_pinned as boolean || false,
    isLocked: row.is_locked as boolean || false,
    autoPromoted: row.auto_promoted as boolean || false,
    aiSummary: row.ai_summary as string | undefined,
    status: row.status as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };

  // Fetch user's interaction state
  if (userId) {
    const { data: likeData } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    (post as Record<string, unknown>).isLiked = !!likeData;

    const { data: favData } = await supabase
      .from('post_favorites')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    (post as Record<string, unknown>).isFavorited = !!favData;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: post,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
