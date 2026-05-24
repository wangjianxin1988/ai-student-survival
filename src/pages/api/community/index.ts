export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { getPosts, supabase } from '@/lib/community';
import { createPost } from '@/lib/community/service';
import { contentModerationApi } from '@/lib/content-moderation';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const sort = (url.searchParams.get('sort') as 'latest' | 'popular') || 'latest';
  const autoPromotedParam = url.searchParams.get('auto_promoted');
  const autoPromoted = autoPromotedParam === 'true' ? true : autoPromotedParam === 'false' ? false : undefined;

  const result = await getPosts({ category, limit, offset, sort, autoPromoted });

  return new Response(
    JSON.stringify({
      success: true,
      data: result.posts,
      meta: {
        total: result.total,
        limit,
        offset,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  // Extract access token for RLS auth
  const authHeader = request.headers.get('Authorization') || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

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

  try {
    const body = await request.json();
    const { title, content, category, tags, images, status, meta } = body;

    if (!title || !content || !category) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Content moderation check for post title and content
    const combinedContent = `${title} ${content}`;
    const modResult = contentModerationApi.moderate(combinedContent, user.id, 'post');

    if (!modResult.isAllowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CONTENT_BLOCKED',
            message: modResult.reason || '内容审核未通过，请修改后重试',
            flags: modResult.flags,
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await createPost(supabase, user.id, {
      title,
      content,
      category,
      tags,
      images,
      status,
      meta,
    }, accessToken || undefined);

    if (!result.success || !result.post) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'CREATE_ERROR', message: result.error || 'Failed to create post' },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result.post,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal server error' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
