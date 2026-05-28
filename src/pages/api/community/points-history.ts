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
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 200);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

  // Check if this is a demo user (demo IDs start with 'demo-' prefix)
  const isDemoUser = user.id.startsWith('demo-');

  if (isDemoUser) {
    // Demo mode: return demo points history from localStorage-like mock data
    // The client handles local storage for demo users
    return new Response(
      JSON.stringify({
        success: true,
        data: [],
        meta: { total: 0 },
        demo: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result = await getPointsHistory(user.id, { limit, offset });

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
      meta: {
        total: result.total,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
