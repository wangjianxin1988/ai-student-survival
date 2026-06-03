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
      .select('id, title, content, category, status, created_at')
      .eq('user_id', serverUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsError) console.error('[activity] Posts error:', postsError);

    // Fetch user's comments WITH post title via join
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('post_comments')
      .select('id, content, post_id, created_at, community_posts(id, title, category)')
      .eq('user_id', serverUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (commentsError) console.error('[activity] Comments error:', commentsError);

    // Fetch user's likes WITH post title via join
    const { data: communityLikes, error: likesError } = await supabaseAdmin
      .from('post_likes')
      .select('id, post_id, created_at, community_posts(id, title, category)')
      .eq('user_id', serverUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (likesError) console.error('[activity] Likes error:', likesError);

    // Fetch user's favorites WITH post title via join
    const { data: communityFavorites, error: favsError } = await supabaseAdmin
      .from('post_favorites')
      .select('id, post_id, created_at, community_posts(id, title, category)')
      .eq('user_id', serverUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (favsError) console.error('[activity] Favorites error:', favsError);

    // Helper: determine the correct href for a post
    function getPostHref(postId: string, category?: string): string {
      const qaCategories = new Set(['academic', 'life', 'visa', 'job', 'study_life', 'job_recruitment', 'policy', 'payment', 'other', 'qa']);
      const basePath = qaCategories.has(category || '') ? '/questions' : '/community';
      return `${basePath}/${postId}`;
    }

    // Format posts
    const formattedPosts = (posts || [])
      .filter(p => p.status === 'published' || p.status === 'approved')
      .map(p => ({
        type: 'post' as const,
        id: p.id,
        title: p.title || '无标题帖子',
        snippet: (p.content || '').substring(0, 120),
        createdAt: p.created_at,
        href: getPostHref(p.id, p.category),
      }));

    // Format comments - get title from joined community_posts
    const formattedComments = (comments || []).map((c: any) => {
      const post = c.community_posts;
      return {
        type: 'comment' as const,
        id: c.id,
        title: post?.title || '原帖已删除',
        snippet: `评论: ${(c.content || '').substring(0, 100)}`,
        createdAt: c.created_at,
        href: post ? getPostHref(post.id, post.category) : '#',
      };
    });

    // Format likes - get title from joined community_posts
    const formattedLikes = (communityLikes || []).map((l: any) => {
      const post = l.community_posts;
      return {
        type: 'like' as const,
        id: l.id,
        title: post?.title || '原帖已删除',
        snippet: post?.title ? `点赞了帖子「${post.title}」` : '点赞了社区帖子',
        createdAt: l.created_at,
        href: post ? getPostHref(post.id, post.category) : '#',
      };
    });

    // Format favorites - get title from joined community_posts
    const formattedFavorites = (communityFavorites || []).map((f: any) => {
      const post = f.community_posts;
      return {
        type: 'favorite' as const,
        id: f.id,
        title: post?.title || '原帖已删除',
        snippet: post?.title ? `收藏了帖子「${post.title}」` : '收藏了社区帖子',
        createdAt: f.created_at,
        href: post ? getPostHref(post.id, post.category) : '#',
      };
    });

    // Merge and sort by date
    const items = [...formattedPosts, ...formattedComments, ...formattedLikes, ...formattedFavorites]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return new Response(
      JSON.stringify({ success: true, items }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  } catch (err) {
    console.error('[activity] Error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
