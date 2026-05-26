export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { supabase } from '@/lib/supabase';
import type { CommunityCategory } from '@/lib/community/types';

const QUESTION_CATEGORIES: CommunityCategory[] = [
  'academic', 'life', 'visa', 'job', 'study_life', 'job_recruitment', 'policy', 'payment', 'other'
];

// Map user-facing category names to DB categories
const USER_CATEGORY_MAP: Record<string, CommunityCategory> = {
  academic: 'academic',
  life: 'life',
  visa: 'visa',
  job: 'job',
  study_life: 'study_life',
  job_recruitment: 'job_recruitment',
  policy: 'policy',
  payment: 'payment',
  other: 'discussion',
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const sort = (url.searchParams.get('sort') as 'latest' | 'popular') || 'latest';
  const userId = url.searchParams.get('userId') || undefined;

  let query = supabase
    .from('community_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .in('category', QUESTION_CATEGORIES);

  if (category && USER_CATEGORY_MAP[category]) {
    query = query.eq('category', USER_CATEGORY_MAP[category]);
  }

  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('likes_count', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
    return new Response(
      JSON.stringify({ success: false, error: { message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const posts = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    userId: row.user_id as string,
    userName: '',
    userAvatar: '',
    title: row.title as string,
    content: row.content as string,
    excerpt: row.excerpt as string | undefined,
    category: row.category as CommunityCategory,
    tags: (row.tags as string[]) || [],
    images: (row.images as string[]) || [],
    meta: (row.meta as Record<string, unknown>) || undefined,
    likesCount: row.likes_count as number || 0,
    commentsCount: row.comments_count as number || 0,
    viewsCount: row.views_count as number || 0,
    favoritesCount: row.favorites_count as number || 0,
    isPinned: row.is_pinned as boolean || false,
    isLocked: row.is_locked as boolean || false,
    autoPromoted: row.auto_promoted as boolean || false,
    status: row.status as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  // If userId is provided, fetch their like/favorite state
  if (userId && posts.length > 0) {
    const postIds = posts.map(p => p.id);

    // Get likes
    const { data: likesData } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);
    const likedSet = new Set((likesData || []).map((l: Record<string, unknown>) => l.post_id as string));

    // Get favorites
    const { data: favsData } = await supabase
      .from('post_favorites')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);
    const favSet = new Set((favsData || []).map((f: Record<string, unknown>) => f.post_id as string));

    posts.forEach(p => {
      (p as Record<string, unknown>).isLiked = likedSet.has(p.id);
      (p as Record<string, unknown>).isFavorited = favSet.has(p.id);
    });
  }

  // Fetch user info for post authors
  const userIds = [...new Set(posts.map(p => p.userId))];
  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .in('id', userIds);
    const userMap: Record<string, { name: string; avatar: string }> = {};
    (usersData || []).forEach((u: Record<string, unknown>) => {
      userMap[u.id as string] = {
        name: (u.name as string) || 'Anonymous',
        avatar: (u.avatar_url as string) || '',
      };
    });
    posts.forEach(p => {
      const userInfo = userMap[p.userId];
      if (userInfo) {
        p.userName = userInfo.name;
        p.userAvatar = userInfo.avatar;
      }
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: posts,
      meta: {
        total: count || 0,
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
    const { title, content, category, tags, images } = body;

    if (!title || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Title and content are required' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const postCategory = category && USER_CATEGORY_MAP[category]
      ? USER_CATEGORY_MAP[category]
      : 'academic';

    const excerpt = content.length > 150 ? content.substring(0, 150) + '...' : content;

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        title,
        content,
        excerpt,
        category: postCategory,
        tags: tags || [],
        images: images || [],
        status: 'published',
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: { message: error.message } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          createdAt: data.created_at,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating question:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal server error' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
