import type { APIRoute } from 'astro';
import { promptTemplates, searchPromptTemplates, getPromptTemplatesByCategory } from '@/data/promptTemplates';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const category = url.searchParams.get('category') || '';
  const toolId = url.searchParams.get('toolId') || '';
  const search = url.searchParams.get('search') || '';

  try {
    let results = [...promptTemplates];

    // Apply filters
    if (category) {
      results = getPromptTemplatesByCategory(category as 'application' | 'thesis' | 'job' | 'daily' | 'research');
    }
    if (toolId) {
      results = results.filter(p => p.toolId === toolId);
    }
    if (search) {
      results = searchPromptTemplates(search);
    }

    // Transform to API response format
    const transformedResults = results.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      description: prompt.description,
      category: prompt.category,
      toolId: prompt.toolId,
      rating: prompt.rating,
      ratingCount: prompt.ratingCount,
      usageCount: prompt.usageCount,
      tags: prompt.tags,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    }));

    return new Response(JSON.stringify({
      success: true,
      data: transformedResults,
      total: transformedResults.length,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'static',
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // CORS: Public read-only prompt template library
        // These are public prompt templates shared for educational use.
        // No authentication or user-specific data involved.
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'index, follow',
      },
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch prompts',
      },
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        // CORS: Allow cross-origin for error responses
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
