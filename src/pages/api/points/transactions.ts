export const prerender = false;

import type { APIRoute } from 'astro';
import { getCurrentUser } from '@/lib/auth';
import { getPointsHistory } from '@/lib/points';

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

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const result = await getPointsHistory(user.id, { limit, offset });

  return new Response(
    JSON.stringify({
      success: true,
      data: result.transactions,
      meta: {
        total: result.total,
        limit,
        offset,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
