// 自动推送服务
import type { CommunityPost, CommunityCategory } from '@/lib/community/types';
import { supabaseAdmin } from '@/lib/supabase';
import { DEFAULT_AUTO_PROMOTE_RULES, type AutoPromoteRule } from './rules';

// 自动推送使用 supabaseAdmin 绕过 RLS（服务端操作，需要更新任意帖子）

// 获取活跃规则
export async function getActiveRules(): Promise<AutoPromoteRule[]> {
  return DEFAULT_AUTO_PROMOTE_RULES.filter(rule => rule.isActive);
}

// 评估规则
function evaluateRule(post: CommunityPost, rule: AutoPromoteRule): boolean {
  const { type, thresholds, timeWindowMinutes } = rule.trigger;

  // 检查分类过滤
  if (rule.categoryFilter && rule.categoryFilter.length > 0) {
    if (!rule.categoryFilter.includes(post.category)) {
      return false;
    }
  }

  // 检查时间窗口
  if (timeWindowMinutes) {
    const postAge = Date.now() - new Date(post.createdAt).getTime();
    const windowMs = timeWindowMinutes * 60 * 1000;
    if (postAge > windowMs) {
      return false;
    }
  }

  switch (type) {
    case 'likes_threshold':
      return post.likesCount >= (thresholds.likes || 0);

    case 'comments_threshold':
      return post.commentsCount >= (thresholds.comments || 0);

    case 'favorites_threshold':
      return post.favoritesCount >= (thresholds.favorites || 0);

    case 'combined_threshold':
      return evaluateCombined(post, thresholds);

    default:
      return false;
  }
}

// 评估组合条件
function evaluateCombined(
  post: CommunityPost,
  thresholds: AutoPromoteRule['trigger']['thresholds']
): boolean {
  const conditions: boolean[] = [];

  if (thresholds.likes) {
    conditions.push(post.likesCount >= thresholds.likes);
  }
  if (thresholds.comments) {
    conditions.push(post.commentsCount >= thresholds.comments);
  }
  if (thresholds.favorites) {
    conditions.push(post.favoritesCount >= thresholds.favorites);
  }
  if (thresholds.views) {
    conditions.push(post.viewsCount >= thresholds.views);
  }

  // 所有条件都满足
  return conditions.length > 0 && conditions.every(Boolean);
}

// 执行推送
async function executePromotion(
  postId: string,
  rule: AutoPromoteRule
): Promise<void> {
  const updateData: Record<string, unknown> = {
    auto_promoted: true,
    auto_promote_reason: rule.name,
  };

  if (rule.action.type === 'promote_to_category' && rule.action.targetCategory) {
    updateData.promoted_to_category = rule.action.targetCategory;
  }

  if (rule.action.type === 'add_featured') {
    // 设置为置顶
    updateData.is_pinned = true;
  }

  await supabaseAdmin
    .from('community_posts')
    .update(updateData)
    .eq('id', postId);

  // TODO: 通知用户帖子被推送
}

// 检查并执行推送
export async function checkAndPromote(postId: string): Promise<void> {
  // 获取帖子
  const { data: post, error } = await supabaseAdmin
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error || !post) {
    console.error('Error fetching post for auto-promote:', error);
    return;
  }

  // 如果已经推送过，不再处理
  if (post.auto_promoted) {
    return;
  }

  const communityPost: CommunityPost = {
    id: post.id,
    userId: post.user_id,
    userName: '',
    userAvatar: '',
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    category: post.category as CommunityCategory,
    tags: post.tags || [],
    images: post.images || [],
    likesCount: post.likes_count || 0,
    commentsCount: post.comments_count || 0,
    viewsCount: post.views_count || 0,
    favoritesCount: post.favorites_count || 0,
    isPinned: post.is_pinned || false,
    isLocked: post.is_locked || false,
    autoPromoted: post.auto_promoted || false,
    status: post.status,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  };

  // 获取活跃规则
  const rules = await getActiveRules();

  // 按优先级排序
  rules.sort((a, b) => b.priority - a.priority);

  // 检查规则
  for (const rule of rules) {
    if (evaluateRule(communityPost, rule)) {
      await executePromotion(postId, rule);
      break; // 只推送一次
    }
  }
}

// Check all posts pending promotion
export async function checkAllPendingPromotions(): Promise<void> {
  // Get all unpublished posts within 72 hours
  const cutoffTime = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

  console.log('[auto-promote] checkAllPendingPromotions called');
  console.log('[auto-promote] cutoffTime:', cutoffTime);

  const { data: posts, error } = await supabaseAdmin
    .from('community_posts')
    .select('*')
    .eq('auto_promoted', false)
    .eq('status', 'published')
    .gte('created_at', cutoffTime);

  if (error) {
    console.error('[auto-promote] Query error:', JSON.stringify(error));
    return;
  }
  if (!posts) {
    console.error('[auto-promote] No posts returned (null)');
    return;
  }

  console.log(`[auto-promote] Found ${posts.length} pending posts`);
  if (posts.length > 0) {
    console.log('[auto-promote] First post:', JSON.stringify({
      id: posts[0].id,
      title: posts[0].title,
      category: posts[0].category,
      likes: posts[0].likes_count,
      comments: posts[0].comments_count,
      auto_promoted: posts[0].auto_promoted,
    }));
  }

  const rules = await getActiveRules();
  rules.sort((a, b) => b.priority - a.priority);
  console.log(`[auto-promote] ${rules.length} active rules`);

  for (const post of posts) {
    const communityPost = mapDbToCommunityPost(post);

    for (const rule of rules) {
      const matches = evaluateRule(communityPost, rule);
      if (matches) {
        console.log(`[auto-promote] Post "${post.title}" matched rule "${rule.name}", promoting...`);
        await executePromotion(post.id, rule);
        console.log(`[auto-promote] Post "${post.title}" promoted successfully`);
        break;
      }
    }
  }
  console.log('[auto-promote] checkAllPendingPromotions done');
}

// Execute promotion from service (用于积分直接推送)
export async function executePromotionFromService(
  postId: string,
  source: 'auto' | 'points',
  score: number
): Promise<boolean> {
  const { data: post, error } = await supabaseAdmin
    .from('community_posts')
    .select('category')
    .eq('id', postId)
    .single();

  if (error || !post) {
    console.error('Error fetching post for promotion:', error);
    return false;
  }

  const reason = source === 'auto'
    ? `auto-promoted by rules (score: ${score})`
    : `direct publish via points (score: ${score})`;

  const updateData = {
    auto_promoted: true,
    auto_promote_reason: reason,
    promote_source: source,
    promote_score: score,
    promoted_to_category: post.category,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabaseAdmin
    .from('community_posts')
    .update(updateData)
    .eq('id', postId);

  if (updateError) {
    console.error('Error promoting post:', updateError);
    return false;
  }

  return true;
}

// Map database record to CommunityPost
function mapDbToCommunityPost(post: Record<string, unknown>): CommunityPost {
  return {
    id: post.id as string,
    userId: post.user_id as string,
    userName: (post.user_name as string) || '',
    userAvatar: (post.user_avatar as string) || '',
    title: post.title as string,
    content: post.content as string,
    excerpt: post.excerpt as string | undefined,
    category: post.category as CommunityCategory,
    tags: (post.tags as string[]) || [],
    images: (post.images as string[]) || [],
    meta: (post.meta as Record<string, unknown>) || undefined,
    likesCount: (post.likes_count as number) || 0,
    commentsCount: (post.comments_count as number) || 0,
    viewsCount: (post.views_count as number) || 0,
    favoritesCount: (post.favorites_count as number) || 0,
    isPinned: (post.is_pinned as boolean) || false,
    isLocked: (post.is_locked as boolean) || false,
    autoPromoted: (post.auto_promoted as boolean) || false,
    autoPromoteReason: post.auto_promote_reason as string | undefined,
    promotedToCategory: post.promoted_to_category as string | undefined,
    promoteSource: post.promote_source as 'auto' | 'points' | undefined,
    promoteScore: post.promote_score as number | undefined,
    directPublishRequested: (post.direct_publish_requested as boolean) || false,
    directPublishCost: post.direct_publish_cost as number | undefined,
    isHotBoost: (post.is_hot_boost as boolean) || false,
    hotBoostExpiresAt: post.hot_boost_expires_at as string | undefined,
    status: post.status as 'draft' | 'published' | 'deleted',
    createdAt: post.created_at as string,
    updatedAt: post.updated_at as string,
  };
}
