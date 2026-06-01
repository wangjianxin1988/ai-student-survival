import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Fetch user's posts from community_posts
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('community_posts')
      .select('id, title, content, slug, category, created_at')
      .eq('user_id', serverUser.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsError) {
      console.error('[api/user/activity] Posts error:', postsError);
    }

    // Fetch user's comments from post_comments
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('post_comments')
      .select('id, content, post_id, created_at')
      .eq('user_id', serverUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (commentsError) {
      console.error('[api/user/activity] Comments error:', commentsError);
    }

    // For comments, fetch the parent post title
    const postIds = [...new Set((comments || []).map(c => c.post_id).filter(Boolean))];
    let postTitleMap: Record<string, { title: string; slug: string }> = {};

    if (postIds.length > 0) {
      const { data: parentPosts } = await supabaseAdmin
        .from('community_posts')
        .select('id, title, slug')
        .in('id', postIds);

      if (parentPosts) {
        for (const p of parentPosts) {
          postTitleMap[p.id] = { title: p.title, slug: p.slug };
        }
      }
    }

    // Format posts
    const formattedPosts = (posts || []).map(p => ({
      type: 'post' as const,
      id: p.id,
      title: p.title,
      snippet: (p.content || '').substring(0, 120),
      createdAt: p.created_at,
      href: `/community/post/${p.slug || p.id}`,
    }));

    // Format comments
    const formattedComments = (comments || []).map(c => {
      const parent = postTitleMap[c.post_id];
      return {
        type: 'comment' as const,
        id: c.id,
        title: parent?.title || '帖子',
        snippet: (c.content || '').substring(0, 120),
        createdAt: c.created_at,
        href: parent?.slug ? `/community/post/${parent.slug}` : `/community/post/${c.post_id}`,
      };
    });

    // Merge and sort by date
    const items = [...formattedPosts, ...formattedComments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return new Response(
      JSON.stringify({ success: true, items }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  } catch (err) {
    console.error('[api/user/activity] Error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
