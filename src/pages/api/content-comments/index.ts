import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { earnPoints } from '@/lib/points/service';

export const prerender = false;

// GET: Fetch comments for a specific target
export const GET: APIRoute = async ({ url }) => {
  const targetType = url.searchParams.get('target_type');
  const targetId = url.searchParams.get('target_id');
  const userId = url.searchParams.get('user_id');

  if (userId) {
    const { data: comments, error } = await supabaseAdmin
      .from('content_comments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, comments: comments || [] }), { status: 200 });
  }

  if (!targetType || !targetId) {
    return new Response(JSON.stringify({ error: 'target_type and target_id are required' }), { status: 400 });
  }

  const { data: comments, error } = await supabaseAdmin
    .from('content_comments')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, comments: comments || [] }), { status: 200 });
};

// POST: Create a new comment
export const POST: APIRoute = async ({ request }) => {
  const user = await getServerUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { target_type, target_id, content, rating, parent_id } = body;

  if (!target_type || !target_id || !content?.trim()) {
    return new Response(JSON.stringify({ error: 'target_type, target_id and content are required' }), { status: 400 });
  }

  const { data: comment, error } = await supabaseAdmin
    .from('content_comments')
    .insert({
      user_id: user.id,
      user_name: user.name || user.email?.split('@')[0] || 'User',
      user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      target_type,
      target_id,
      content: content.trim(),
      rating: rating || null,
      parent_id: parent_id || null,
      status: 'published',
    })
    .select('*')
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Award points for commenting (10 points)
  try {
    await earnPoints(supabaseAdmin, user.id, {
      amount: 10,
      type: 'earn_comment',
      description: `评论 ${target_type}: ${target_id}`,
      referenceId: comment.id,
    });
  } catch (e) {
    // Points system may not be set up yet, don't block comment
    console.warn('[content-comments] Failed to award points:', e);
  }

  return new Response(JSON.stringify({ success: true, comment }), { status: 201 });
};

// DELETE: Delete a comment
export const DELETE: APIRoute = async ({ request }) => {
  const user = await getServerUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { comment_id } = body;

  if (!comment_id) {
    return new Response(JSON.stringify({ error: 'comment_id is required' }), { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('content_comments')
    .delete()
    .eq('id', comment_id)
    .eq('user_id', user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
