export const prerender = false;

import type { APIRoute } from 'astro';
import { checkAllPendingPromotions } from '@/lib/auto-promote/service';

/**
 * API endpoint to trigger pending promotion checks.
 * Should be called by a cron job hourly.
 *
 * POST /api/community/check-pending-promotions
 */
export const POST: APIRoute = async ({ request }) => {

    // Admin auth check
    const authHeader = request.headers.get('authorization');
    const adminPassword = import.meta.env.ADMIN_PASSWORD;
    if (!adminPassword || !authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  try {
    await checkAllPendingPromotions();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pending promotions checked successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error checking pending promotions:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Failed to check pending promotions' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
