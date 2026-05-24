export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { getUserPoints } from '@/lib/points';

export const GET: APIRoute = async ({ request }) => {
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

  const result = await getUserPoints(user.id);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        balance: result.balance,
        totalEarned: result.totalEarned,
        totalSpent: result.totalSpent,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
