// Query user points balance API
export const prerender = false;

import type { APIRoute } from 'astro';
import { getCurrentUser } from '@/lib/auth';
import { getUserBalance } from '@/lib/points/storage';

export const GET: APIRoute = async ({ request }) => {
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

  // Parse query params
  const url = new URL(request.url);
  const userIdParam = url.searchParams.get('userId');

  // If userId is provided, only allow admins to query others
  const targetUserId = userIdParam || user.id;

  if (userIdParam && userIdParam !== user.id) {
    // TODO: Check if user is admin - for now, restrict to own balance
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only query your own balance' },
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const balance = await getUserBalance(targetUserId);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        userId: balance.userId,
        balance: balance.balance,
        totalEarned: balance.totalEarned,
        totalSpent: balance.totalSpent,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};