export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { toggleFavorite, getPostById } from '@/lib/community/service';

export const POST: APIRoute = async ({ params, request }) => {
  const postId = params.id;
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

  if (!postId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Post ID is required' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Extract access token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  // 获取帖子作者ID
  const resultPost = await getPostById(supabaseAdmin, postId);
  if (!resultPost.success || !resultPost.post) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Post not found' },
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result = await toggleFavorite(supabaseAdmin, postId, user.id, resultPost.post.userId, accessToken);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'FAVORITE_ERROR', message: result.error },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        favorited: result.favorited,
        favoritesCount: result.favoritesCount,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
