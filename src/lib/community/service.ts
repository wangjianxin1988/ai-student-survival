// 社区服务
import * as storage from './storage';
import * as pointsService from '@/lib/points/service';
import * as autoPromote from '@/lib/auto-promote/service';
import type { CommunityPost, CreatePostInput, UpdatePostInput } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

// 创建帖子
export async function createPost(
  supabase: SupabaseClient,
  userId: string,
  input: CreatePostInput
): Promise<{ success: boolean; post?: CommunityPost; error?: string }> {
  // 创建帖子
  const post = await storage.createPost(userId, input);

  if (!post) {
    return { success: false, error: 'Failed to create post' };
  }

  // 增加发帖积分
  await pointsService.earnPoints(supabase, userId, {
    amount: 15,
    type: 'earn_post',
    description: '发布帖子',
    referenceId: post.id,
  });

  // 检查自动推送规则
  await autoPromote.checkAndPromote(post.id);

  return { success: true, post };
}

// 更新帖子
export async function updatePost(
  supabase: SupabaseClient,
  postId: string,
  userId: string,
  input: UpdatePostInput
): Promise<{ success: boolean; post?: CommunityPost; error?: string }> {
  const post = await storage.updatePost(postId, userId, input);

  if (!post) {
    return { success: false, error: 'Failed to update post' };
  }

  return { success: true, post };
}

// 删除帖子
export async function deletePost(
  supabase: SupabaseClient,
  postId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const success = await storage.deletePost(postId, userId);

  if (!success) {
    return { success: false, error: 'Failed to delete post' };
  }

  return { success: true };
}

// 获取帖子列表
export async function getPosts(options?: {
  category?: string;
  limit?: number;
  offset?: number;
  sort?: 'latest' | 'popular';
}): Promise<{ posts: CommunityPost[]; total: number }> {
  return storage.getPosts(options);
}

// 获取单个帖子
export async function getPostById(
  supabase: SupabaseClient,
  postId: string,
  userId?: string
): Promise<{ success: boolean; post?: CommunityPost; error?: string }> {
  const post = await storage.getPostById(postId);

  if (!post) {
    return { success: false, error: 'Post not found' };
  }

  // 增加浏览数
  await storage.incrementViews(postId);

  // 获取用户信息（关联users表）
  const { data: userData } = await supabase
    .from('users')
    .select('name, avatar_url')
    .eq('id', post.userId)
    .single();

  if (userData) {
    post.userName = userData.name || 'Anonymous';
    post.userAvatar = userData.avatar_url || '';
  }

  return { success: true, post };
}

// 点赞/取消点赞
export async function toggleLike(
  supabase: SupabaseClient,
  postId: string,
  userId: string,
  postUserId: string
): Promise<{ success: boolean; liked?: boolean; likesCount?: number; error?: string }> {
  const result = await storage.toggleLike(postId, userId);

  if (result.liked) {
    // 给帖子作者增加积分（被点赞）
    await pointsService.earnPoints(supabase, postUserId, {
      amount: 2,
      type: 'earn_like_received',
      description: '帖子被点赞',
      referenceId: postId,
    });
  }

  // 检查自动推送规则
  await autoPromote.checkAndPromote(postId);

  return {
    success: true,
    liked: result.liked,
    likesCount: result.likesCount,
  };
}

// 收藏/取消收藏
export async function toggleFavorite(
  supabase: SupabaseClient,
  postId: string,
  userId: string,
  postUserId: string
): Promise<{ success: boolean; favorited?: boolean; favoritesCount?: number; error?: string }> {
  const result = await storage.toggleFavorite(postId, userId);

  if (result.favorited) {
    // 给帖子作者增加积分（被收藏）
    await pointsService.earnPoints(supabase, postUserId, {
      amount: 3,
      type: 'earn_favorite',
      description: '帖子被收藏',
      referenceId: postId,
    });
  }

  // 检查自动推送规则
  await autoPromote.checkAndPromote(postId);

  return {
    success: true,
    favorited: result.favorited,
    favoritesCount: result.favoritesCount,
  };
}
