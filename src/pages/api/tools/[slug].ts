import type { APIRoute } from 'astro';
import { staticTools, getToolBySlug } from '@/data/static-tools';

// This endpoint needs to handle dynamic slugs at runtime
export const prerender = false;



export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'MISSING_SLUG',
        message: 'Tool slug is required',
      },
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        // CORS: Allow cross-origin for error responses
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const tool = getToolBySlug(slug as string);

  if (!tool) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'TOOL_NOT_FOUND',
        message: `Tool with slug "${slug}" not found`,
      },
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        // CORS: Allow cross-origin for error responses
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const response = {
    success: true,
    data: tool,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // CORS: Public read-only tool detail data
      // Single tool details are public informational content.
      // No authentication or user-specific data involved.
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'index, follow',
    },
  });
};
