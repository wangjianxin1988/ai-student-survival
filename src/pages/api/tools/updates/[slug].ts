import type { APIRoute } from 'astro';
import { fetchToolUpdate, UPDATE_SOURCES } from '@/lib/updateFetcher';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug;

  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'Slug is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 检查是否配置了更新源
  const source = UPDATE_SOURCES[slug];
  if (!source || source.type === 'none') {
    return new Response(
      JSON.stringify({
        error: 'No update source configured for this tool',
        slug,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const update = await fetchToolUpdate(slug);

    if (!update) {
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch update',
          slug,
          sourceUrl: source.url,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(update), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // 不缓存，每次实时抓取
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error(`Error fetching update for ${slug}:`, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
