export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

export const GET: APIRoute = async ({ request }) => {
  // 需要认证
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
  const query = url.searchParams.get('q')?.trim();

  if (!query) {
    return new Response(
      JSON.stringify({ success: true, data: [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 搜索用户名或邮箱匹配的用户，限制10个
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('[users/search] Query error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'DB_ERROR', message: error.message },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results = (users || []).map((u: Record<string, unknown>) => ({
      id: u.id as string,
      name: (u.name as string) || '匿名用户',
      avatar: (u.avatar_url as string) || '',
    }));

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[users/search] Error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal server error' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
