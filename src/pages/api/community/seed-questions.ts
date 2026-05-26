export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { questionsData } from '@/data/questions';
import type { CommunityCategory } from '@/lib/community/types';

// @ts-ignore - cloudflare:workers is available in Cloudflare Pages runtime
import { env as cfEnv } from 'cloudflare:workers';

function mapQuestionCategoryToCommunity(qCat: string): CommunityCategory {
  const map: Record<string, CommunityCategory> = {
    academic: 'academic',
    life: 'life',
    visa: 'visa',
    job: 'job',
    policy: 'policy',
    payment: 'payment',
    ai_tools: 'academic',
    study_life: 'study_life',
    job_recruitment: 'job_recruitment',
    other: 'discussion',
  };
  return map[qCat] || 'discussion';
}

export const POST: APIRoute = async () => {
  // Get service role key from Cloudflare Workers runtime env
  // @ts-ignore
  const rawKey = (cfEnv as Record<string, unknown>)['SUPABASE_SERVICE_ROLE_KEY'];
  const serviceRoleKey = typeof rawKey === 'string' && rawKey.length > 0 ? rawKey : null;

  if (!serviceRoleKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'SUPABASE_SERVICE_ROLE_KEY not available or empty' },
        debug: {
          cfEnvKeys: cfEnv ? Object.keys(cfEnv).filter(k => k.includes('SUPABASE')) : [],
          rawKeyType: typeof rawKey,
          rawKeyIsEmpty: rawKey === '',
          rawKeyIsNull: rawKey === null,
          rawKeyIsUndefined: rawKey === undefined,
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = 'https://giynvpfnzzelzwpmsgtf.supabase.co';
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1: Delete all existing Q&A posts (both q-XXX and UUID-format)
  // to ensure clean re-seed with q-XXX IDs matching questionsData
  const qIds = questionsData.map(q => q.id);
  const { error: deleteError } = await supabaseAdmin
    .from('community_posts')
    .delete()
    .in('id', qIds);

  if (deleteError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: `Delete failed: ${deleteError.message}` },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Step 2: Insert posts with q-XXX IDs matching questionsData
  const posts = questionsData.map((q) => ({
    id: q.id,
    user_id: '7fa8052c-4d62-4ec6-947d-9d49ba927b76',
    title: q.titleZh,
    content: q.contentZh,
    excerpt: q.contentZh.substring(0, 150),
    category: mapQuestionCategoryToCommunity(q.category),
    tags: q.tags,
    images: [],
    likes_count: Math.floor(Math.random() * 20) + 1,
    comments_count: q.answerCount,
    views_count: q.viewCount,
    favorites_count: Math.floor(Math.random() * 10),
    is_pinned: false,
    is_locked: false,
    auto_promoted: false,
    status: 'published' as const,
    created_at: q.createdAt,
    updated_at: q.createdAt,
  }));

  const { data, error: insertError } = await supabaseAdmin
    .from('community_posts')
    .insert(posts)
    .select('id');

  if (insertError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: `Insert failed: ${insertError.message}` },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Seeded ${posts.length} posts`,
      postIds: data?.map((p) => p.id),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
