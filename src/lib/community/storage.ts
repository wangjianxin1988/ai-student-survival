// 社区帖子存储操作
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { CommunityPost, CreatePostInput, UpdatePostInput, PostLike, PostFavorite } from './types';

// Create a Supabase client with the user's access token for RLS auth
function getAuthClient(accessToken?: string) {
  if (!accessToken) return supabase;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getPosts(options?: {
  category?: string;
  limit?: number;
  offset?: number;
  sort?: 'latest' | 'popular';
  autoPromoted?: boolean;
}): Promise<{ posts: CommunityPost[]; total: number }> {
  const { category, limit = 20, offset = 0, sort = 'latest', autoPromoted } = options || {};

  let query = supabase
    .from('community_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

  if (category) {
    query = query.eq('category', category);
  }

  if (autoPromoted !== undefined) {
    query = query.eq('auto_promoted', autoPromoted);
  }

  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('likes_count', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], total: 0 };
  }

  const posts: CommunityPost[] = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    userId: row.user_id as string,
    userName: '', // 需要关联users表获取
    userAvatar: '',
    title: row.title as string,
    content: row.content as string,
    excerpt: row.excerpt as string | undefined,
    category: row.category as CommunityPost['category'],
    tags: (row.tags as string[]) || [],
    images: (row.images as string[]) || [],
    meta: (row.meta as Record<string, unknown>) || undefined,
    likesCount: row.likes_count as number || 0,
    commentsCount: row.comments_count as number || 0,
    viewsCount: row.views_count as number || 0,
    favoritesCount: row.favorites_count as number || 0,
    isPinned: row.is_pinned as boolean || false,
    isLocked: row.is_locked as boolean || false,
    autoPromoted: row.auto_promoted as boolean || false,
    autoPromoteReason: row.auto_promote_reason as string | undefined,
    promotedToCategory: row.promoted_to_category as string | undefined,
    promoteSource: row.promote_source as 'auto' | 'points' | undefined,
    promoteScore: row.promote_score as number | undefined,
    directPublishRequested: row.direct_publish_requested as boolean || false,
    directPublishCost: row.direct_publish_cost as number | undefined,
    isHotBoost: row.is_hot_boost as boolean || false,
    hotBoostExpiresAt: row.hot_boost_expires_at as string | undefined,
    aiSummary: row.ai_summary as string | undefined,
    status: row.status as CommunityPost['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  return { posts, total: count || 0 };
}

export async function getPostById(id: string): Promise<CommunityPost | null> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    userName: '',
    userAvatar: '',
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    category: data.category,
    tags: data.tags || [],
    images: data.images || [],
    meta: data.meta || undefined,
    likesCount: data.likes_count || 0,
    commentsCount: data.comments_count || 0,
    viewsCount: data.views_count || 0,
    favoritesCount: data.favorites_count || 0,
    isPinned: data.is_pinned || false,
    isLocked: data.is_locked || false,
    autoPromoted: data.auto_promoted || false,
    autoPromoteReason: data.auto_promote_reason,
    promotedToCategory: data.promoted_to_category,
    promoteSource: data.promote_source,
    promoteScore: data.promote_score,
    directPublishRequested: data.direct_publish_requested || false,
    directPublishCost: data.direct_publish_cost,
    isHotBoost: data.is_hot_boost || false,
    hotBoostExpiresAt: data.hot_boost_expires_at,
    aiSummary: data.ai_summary,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createPost(
  userId: string,
  input: CreatePostInput,
  accessToken?: string
): Promise<CommunityPost | null> {
  // 生成摘要
  const excerpt = input.content.length > 200
    ? input.content.substring(0, 200) + '...'
    : input.content;

  const client = getAuthClient(accessToken);
  const { data, error } = await client
    .from('community_posts')
    .insert({
      user_id: userId,
      title: input.title,
      content: input.content,
      excerpt,
      category: input.category,
      tags: input.tags || [],
      images: input.images || [],
      meta: input.meta || null,
      status: input.status || 'published',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    userName: '',
    userAvatar: '',
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    category: data.category,
    tags: data.tags || [],
    images: data.images || [],
    meta: data.meta || undefined,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    favoritesCount: 0,
    isPinned: false,
    isLocked: false,
    autoPromoted: false,
    promoteSource: undefined,
    promoteScore: undefined,
    directPublishRequested: false,
    directPublishCost: undefined,
    isHotBoost: false,
    hotBoostExpiresAt: undefined,
    aiSummary: undefined,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updatePost(
  postId: string,
  userId: string,
  input: UpdatePostInput
): Promise<CommunityPost | null> {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.content !== undefined) {
    updateData.content = input.content;
    updateData.excerpt = input.content.length > 200
      ? input.content.substring(0, 200) + '...'
      : input.content;
  }
  if (input.category !== undefined) updateData.category = input.category;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.images !== undefined) updateData.images = input.images;
  if (input.status !== undefined) updateData.status = input.status;

  const { data, error } = await supabase
    .from('community_posts')
    .update(updateData)
    .eq('id', postId)
    .eq('user_id', userId) // 确保只能修改自己的帖子
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    userName: '',
    userAvatar: '',
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    category: data.category,
    tags: data.tags || [],
    images: data.images || [],
    meta: data.meta || undefined,
    likesCount: data.likes_count || 0,
    commentsCount: data.comments_count || 0,
    viewsCount: data.views_count || 0,
    favoritesCount: data.favorites_count || 0,
    isPinned: data.is_pinned || false,
    isLocked: data.is_locked || false,
    autoPromoted: data.auto_promoted || false,
    autoPromoteReason: data.auto_promote_reason,
    promotedToCategory: data.promoted_to_category,
    promoteSource: data.promote_source,
    promoteScore: data.promote_score,
    directPublishRequested: data.direct_publish_requested || false,
    directPublishCost: data.direct_publish_cost,
    isHotBoost: data.is_hot_boost || false,
    hotBoostExpiresAt: data.hot_boost_expires_at,
    aiSummary: data.ai_summary,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deletePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('community_posts')
    .update({ status: 'deleted' })
    .eq('id', postId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }

  return true;
}

export async function toggleLike(postId: string, userId: string, accessToken?: string): Promise<{
  liked: boolean;
  likesCount: number;
}> {
  const client = getAuthClient(accessToken);

  // 检查是否已经点赞
  const { data: existing } = await client
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  let liked: boolean;

  if (existing) {
    // 取消点赞
    await client
      .from('post_likes')
      .delete()
      .eq('id', existing.id);

    // 减少点赞数
    await client.rpc('decrement_likes_count', { post_id: postId });

    liked = false;
  } else {
    // 添加点赞
    await client
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId });

    // 增加点赞数
    await client.rpc('increment_likes_count', { post_id: postId });

    liked = true;
  }

  // 获取最新的点赞数
  const { data: post } = await client
    .from('community_posts')
    .select('likes_count')
    .eq('id', postId)
    .single();

  return {
    liked,
    likesCount: post?.likes_count || 0,
  };
}

export async function toggleFavorite(postId: string, userId: string, accessToken?: string): Promise<{
  favorited: boolean;
  favoritesCount: number;
}> {
  const client = getAuthClient(accessToken);

  // 检查是否已经收藏
  const { data: existing } = await client
    .from('post_favorites')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  let favorited: boolean;

  if (existing) {
    // 取消收藏
    await client
      .from('post_favorites')
      .delete()
      .eq('id', existing.id);

    // 减少收藏数
    await client.rpc('decrement_favorites_count', { post_id: postId });

    favorited = false;
  } else {
    // 添加收藏
    await client
      .from('post_favorites')
      .insert({ post_id: postId, user_id: userId });

    // 增加收藏数
    await client.rpc('increment_favorites_count', { post_id: postId });

    favorited = true;
  }

  // 获取最新的收藏数
  const { data: post } = await client
    .from('community_posts')
    .select('favorites_count')
    .eq('id', postId)
    .single();

  return {
    favorited,
    favoritesCount: post?.favorites_count || 0,
  };
}

export async function incrementViews(postId: string): Promise<void> {
  await supabase.rpc('increment_views_count', { post_id: postId });
}
