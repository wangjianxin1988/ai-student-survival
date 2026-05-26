// Points transaction history API
export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { getPointsHistory } from '@/lib/points/service';

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

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

  const result = await getPointsHistory(user.id, { limit });

  return new Response(
    JSON.stringify({
      success: true,
      data: result.transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        referenceId: t.referenceId,
        createdAt: t.createdAt,
      })),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
