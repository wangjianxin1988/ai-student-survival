// TEMPORARY: Run migration to fix registration points
// DELETE this file after running the migration
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  // Simple auth check - require a secret key
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  if (secret !== 'mi-to-ai-migrate-2026') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const results: string[] = [];

  try {
    // Step 1: Backfill user_points_balance for users who don't have one
    // First get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id');

    if (profilesError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch profiles', details: profilesError.message }), { status: 500 });
    }

    results.push(`Found ${profiles?.length || 0} profiles`);

    // Get existing balance records
    const { data: existingBalances } = await supabaseAdmin
      .from('user_points_balance')
      .select('user_id');

    const existingUserIds = new Set((existingBalances || []).map(b => b.user_id));
    results.push(`Found ${existingUserIds.size} existing balance records`);

    // Find users without balance
    const usersWithoutBalance = (profiles || [])
      .filter(p => !existingUserIds.has(p.user_id))
      .map(p => p.user_id);

    results.push(`Users without balance: ${usersWithoutBalance.length}`);

    // Create balance records and registration transactions for users without balance
    let balanceCreated = 0;
    let transactionCreated = 0;

    for (const userId of usersWithoutBalance) {
      // Create balance record
      const { error: balErr } = await supabaseAdmin
        .from('user_points_balance')
        .insert({ user_id: userId, balance: 10, total_earned: 10, total_spent: 0 });

      if (!balErr) balanceCreated++;

      // Create registration transaction
      const { error: txErr } = await supabaseAdmin
        .from('points_transactions')
        .insert({ user_id: userId, amount: 10, type: 'register', description: '注册奖励（补发）' });

      if (!txErr) transactionCreated++;
    }

    results.push(`Created ${balanceCreated} balance records`);
    results.push(`Created ${transactionCreated} registration transactions`);

    // Step 2: Update profiles.points for users who now have balance
    const { data: updatedProfiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, points')
      .eq('points', 0);

    let profilesUpdated = 0;
    for (const p of (updatedProfiles || [])) {
      if (existingUserIds.has(p.user_id) || usersWithoutBalance.includes(p.user_id)) {
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ points: 10, updated_at: new Date().toISOString() })
          .eq('user_id', p.user_id)
          .eq('points', 0);
        if (!error) profilesUpdated++;
      }
    }

    results.push(`Updated ${profilesUpdated} profiles with points`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Migration completed',
      results,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({
      error: 'Migration failed',
      details: String(e),
      partialResults: results,
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
