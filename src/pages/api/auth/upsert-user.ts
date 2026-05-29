import type { APIRoute } from 'astro';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';
import { earnPoints } from '@/lib/points/service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isSupabaseConfigured) {
    return new Response(JSON.stringify({ success: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Authenticate the request
  const user = await getServerUser(request);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const { id, email, name, avatar_url } = body;

    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Only allow the authenticated user to update their own record
    if (id !== user.id) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const { error } = await supabase
      .from('users')
      .upsert({
        id,
        email: email || user.email,
        name: name || null,
        avatar_url: avatar_url || null,
      }, { onConflict: 'id' });

    if (error) {
      console.error('[upsert-user] error:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // After successful upsert, check if user needs registration points (retroactive)
    try {
      const { data: existingBalance } = await supabaseAdmin
        .from('user_points_balance')
        .select('user_id')
        .eq('user_id', id)
        .single();

      if (!existingBalance) {
        // User doesn't have a balance record - award registration points
        await earnPoints(supabaseAdmin, id, {
          amount: 10,
          type: 'register',
          description: '注册奖励',
        });
        console.log(`[upsert-user] Awarded registration points to user ${id}`);
      }
    } catch (pointsErr) {
      // Don't fail the upsert if points award fails
      console.warn('[upsert-user] Failed to check/award registration points:', pointsErr);
    }

    return new Response(JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('[upsert-user] unexpected error:', e);
    return new Response(JSON.stringify({ success: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
