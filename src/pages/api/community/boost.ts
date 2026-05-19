// Hot boost API - costs 20 points, 24hr validity
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { POINTS_CONFIG } from '@/lib/points/config';
import { getUserBalance, recordTransaction } from '@/lib/points/storage';

const HOT_BOOST_COST = Math.abs(POINTS_CONFIG.ACTIONS.HOT_BOOST); // 20
const HOT_BOOST_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const POST: APIRoute = async ({ request }) => {
  const user = getCurrentUser();

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

  // 1. Check post exists
  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .select('id, user_id, is_hot_boost, hot_boost_expires_at')
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

  // 2. Check if hot boost is still active
  if (post.is_hot_boost && post.hot_boost_expires_at) {
    const expiresAt = new Date(post.hot_boost_expires_at).getTime();
    if (Date.now() < expiresAt) {
      const remainingHours = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60));
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'BOOST_ALREADY_ACTIVE',
            message: `Hot boost is already active. ${remainingHours} hours remaining.`,
          },
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 3. Check user points balance
  const balance = await getUserBalance(user.id);

  if (balance.balance < HOT_BOOST_COST) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INSUFFICIENT_POINTS',
          message: `Not enough points. Required: ${HOT_BOOST_COST}, Current: ${balance.balance}`,
        },
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Deduct points
  const transaction = await recordTransaction(
    user.id,
    -HOT_BOOST_COST,
    'hot_boost',
    'Hot boost post for 24 hours',
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

  // 5. Set hot boost on post
  const expiresAt = new Date(Date.now() + HOT_BOOST_DURATION_MS).toISOString();

  const { error: updateError } = await supabase
    .from('community_posts')
    .update({
      is_hot_boost: true,
      hot_boost_expires_at: expiresAt,
    })
    .eq('id', postId);

  if (updateError) {
    // Rollback: refund points
    await recordTransaction(
      user.id,
      HOT_BOOST_COST,
      'hot_boost_refund',
      'Hot boost failed - refund',
      postId
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'UPDATE_ERROR', message: 'Failed to apply hot boost, points refunded' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 6. Get updated balance
  const updatedBalance = await getUserBalance(user.id);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        postId,
        cost: HOT_BOOST_COST,
        expiresAt,
        newBalance: updatedBalance.balance,
        transactionId: transaction.id,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};