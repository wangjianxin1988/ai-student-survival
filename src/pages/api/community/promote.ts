// Direct publish API - costs 50 points
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { POINTS_CONFIG } from '@/lib/points/config';
import { getUserBalance } from '@/lib/points/storage';
import { recordTransaction } from '@/lib/points/storage';
import { executePromotionFromService } from '@/lib/auto-promote/service';
import { checkPromotionEligibility } from '@/lib/community/types';
import type { CommunityPost } from '@/lib/community/types';

const DIRECT_PUBLISH_COST = Math.abs(POINTS_CONFIG.ACTIONS.DIRECT_PUBLISH); // 50

export const POST: APIRoute = async ({ request }) => {
  const user = await getServerUser(request);

  if (!user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Please login first' },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { postId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { postId } = body;

  if (!postId || typeof postId !== 'string') {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'postId is required' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 1. Check post exists and not already promoted
  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (postError || !post) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' },
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check ownership
  if (post.user_id !== user.id) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not own this post' },
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check not already directly promoted
  if (post.direct_publish_requested || post.auto_promoted) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'ALREADY_PROMOTED', message: 'Post is already promoted' },
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Check user points balance
  const balance = await getUserBalance(user.id);

  if (balance.balance < DIRECT_PUBLISH_COST) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INSUFFICIENT_POINTS',
          message: `Not enough points. Required: ${DIRECT_PUBLISH_COST}, Current: ${balance.balance}`,
        },
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Deduct points (record transaction with negative amount)
  const transaction = await recordTransaction(
    user.id,
    -DIRECT_PUBLISH_COST,
    'direct_publish',
    'Direct publish post',
    postId
  );

  if (!transaction) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'POINTS_ERROR', message: 'Failed to deduct points' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Execute promotion
  const communityPost: CommunityPost = {
    id: post.id,
    userId: post.user_id,
    userName: '',
    userAvatar: '',
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    category: post.category,
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

  const eligibility = checkPromotionEligibility(communityPost);

  const promoted = await executePromotionFromService(postId, 'points', eligibility.score);

  if (!promoted) {
    // Rollback: refund points
    await recordTransaction(
      user.id,
      DIRECT_PUBLISH_COST,
      'direct_publish_refund',
      'Direct publish failed - refund',
      postId
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'PROMOTION_FAILED', message: 'Failed to promote post, points refunded' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 5. Mark as direct publish requested
  await supabase
    .from('community_posts')
    .update({
      direct_publish_requested: true,
      direct_publish_cost: DIRECT_PUBLISH_COST,
    })
    .eq('id', postId);

  // 6. Get updated balance
  const updatedBalance = await getUserBalance(user.id);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        postId,
        cost: DIRECT_PUBLISH_COST,
        newBalance: updatedBalance.balance,
        transactionId: transaction.id,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};