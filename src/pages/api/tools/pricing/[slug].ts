import type { APIRoute } from 'astro';
import { getPricing } from '../../../../lib/pricing/scraper';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await getPricing(slug);

  if (!result.plans || result.plans.length === 0) {
    return new Response(JSON.stringify({ error: 'Tool not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    data: result.plans,
    meta: {
      slug,
      scraped: result.scraped,
      source: result.source,
      fetchedAt: result.fetchedAt,
    },
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
