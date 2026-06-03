export const prerender = false;

import type { APIRoute } from 'astro';
import { getServerUser } from '@/lib/server-auth';
import { supabaseAdmin } from '@/lib/supabase';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * POST /api/community/[id]/close
 * Close a post (set is_locked = true) and trigger AI summary generation.
 * Only the post author or admins can close a post.
 */
export const POST: APIRoute = async ({ params, request }) => {
  const postId = params.id;

  if (!postId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Post ID is required' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

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
    // Fetch the post to verify ownership
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('community_posts')
      .select('id, user_id, title, content, is_locked')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Post not found' },
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if already closed
    if (post.is_locked) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'ALREADY_CLOSED', message: 'Post is already closed' },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check authorization: only post author can close
    // (Admin check can be added later with role-based access)
    if (post.user_id !== user.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only the post author can close this post' },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Close the post
    const { error: updateError } = await supabaseAdmin
      .from('community_posts')
      .update({
        is_locked: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (updateError) {
      console.error('[close] Error closing post:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'UPDATE_ERROR', message: 'Failed to close post' },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Trigger AI summary generation in the background (fire-and-forget)
    // The actual summary will be stored in ai_summary column when complete
    generateAiSummary(postId, post.title, post.content).catch(err => {
      console.error('[close] Background AI summary generation failed:', err);
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Post closed successfully. AI summary is being generated.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[close] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal server error' },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Generate an AI summary for a closed post using Anthropic API.
 * Stores the result in the ai_summary column of community_posts.
 */
async function generateAiSummary(
  postId: string,
  title: string,
  content: string
): Promise<void> {
  const apiKey = (import.meta as any).env?.ANTHROPIC_API_KEY
    || (typeof process !== 'undefined' ? process.env.ANTHROPIC_API_KEY : '');

  if (!apiKey) {
    console.warn('[close] ANTHROPIC_API_KEY not configured, skipping AI summary generation');
    // Store a fallback summary
    await supabaseAdmin
      .from('community_posts')
      .update({ ai_summary: 'AI摘要功能暂未配置，请联系管理员。' })
      .eq('id', postId);
    return;
  }

  try {
    const truncatedContent = content.length > 4000
      ? content.substring(0, 4000) + '...'
      : content;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        system: `你是一个社区帖子摘要助手。请为以下帖子生成一个简洁的中文摘要，包括：
1. 帖子的核心问题或主题
2. 关键讨论要点或解决方案（如有）
3. 最终结论或建议

要求：
- 摘要长度在100-200字之间
- 使用简洁清晰的中文
- 不要使用"该帖子"等指代词，直接陈述内容`,
        messages: [
          {
            role: 'user',
            content: `标题：${title}\n\n内容：\n${truncatedContent}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[close] Anthropic API error:', response.status, errorText);
      await supabaseAdmin
        .from('community_posts')
        .update({ ai_summary: 'AI摘要生成失败，请稍后刷新页面重试。' })
        .eq('id', postId);
      return;
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text || '无法生成摘要';

    // Store the AI summary
    const { error: updateError } = await supabaseAdmin
      .from('community_posts')
      .update({ ai_summary: summary })
      .eq('id', postId);

    if (updateError) {
      console.error('[close] Error storing AI summary:', updateError);
    }
  } catch (err) {
    console.error('[close] AI summary generation exception:', err);
    await supabaseAdmin
      .from('community_posts')
      .update({ ai_summary: 'AI摘要生成失败，请稍后刷新页面重试。' })
      .eq('id', postId);
  }
}
