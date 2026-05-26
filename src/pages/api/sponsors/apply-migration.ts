// Apply Sponsors Migration - creates sponsors table and seeds data
export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import { env as cfEnv } from 'cloudflare:workers';

const SUPABASE_URL = 'https://giynvpfnzzelzwpmsgtf.supabase.co';

export const POST: APIRoute = async () => {
  const rawKey = (cfEnv as Record<string, unknown>)?.SUPABASE_SERVICE_ROLE_KEY;
  const serviceRoleKey = typeof rawKey === 'string' && rawKey.length > 0 ? rawKey : null;

  if (!serviceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not available' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const admin = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1: Check if sponsors table exists
  const { error: checkError } = await admin.from('sponsors').select('id').limit(1).single();

  if (checkError?.code === 'PGRST204' || checkError?.code === '42P01') {
    // Table doesn't exist - create it using raw SQL
    const { error: createError } = await admin.query(`
      CREATE TABLE sponsors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        nickname TEXT NOT NULL,
        amount INTEGER NOT NULL,
        tier VARCHAR(20) NOT NULL DEFAULT 'coffee',
        payment_method VARCHAR(20) NOT NULL DEFAULT 'wechat',
        message TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'approved',
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX idx_sponsors_status ON sponsors(status);
      CREATE INDEX idx_sponsors_created_at ON sponsors(created_at DESC);
      ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow public read of approved sponsors" ON sponsors;
      CREATE POLICY "Allow public read of approved sponsors" ON sponsors FOR SELECT USING (status = 'approved');
      DROP POLICY IF EXISTS "Allow authenticated users to create sponsors" ON sponsors;
      CREATE POLICY "Allow authenticated users to create sponsors" ON sponsors FOR INSERT WITH CHECK (auth.uid() = user_id);
      GRANT USAGE ON SCHEMA public TO anon;
      GRANT SELECT ON sponsors TO anon;
      GRANT INSERT ON sponsors TO anon;
    `);

    if (createError) {
      console.error('[sponsors/migrate] Create table error:', createError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create table', details: createError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Step 2: Reload PostgREST schema cache
  await admin.query(`NOTIFY pgrst, 'reload schema';`).catch(e =>
    console.warn('[sponsors/migrate] Notify error:', e)
  );

  // Step 3: Seed data using upsert
  const seedData = [
    { nickname: '小明同学', amount: 18, tier: 'meal', payment_method: 'wechat', message: '希望平台越办越好！' },
    { nickname: '留学小助手', amount: 66, tier: 'super', payment_method: 'alipay', message: '加油！' },
    { nickname: '匿名好友', amount: 6, tier: 'coffee', payment_method: 'wechat', message: null },
    { nickname: 'Jack W', amount: 18, tier: 'meal', payment_method: 'wechat', message: 'Great platform!' },
    { nickname: '璐璐', amount: 66, tier: 'super', payment_method: 'alipay', message: '帮助更多留学生！' },
  ];

  let seeded = 0;
  const errors: string[] = [];

  for (const sponsor of seedData) {
    const { error } = await admin.from('sponsors').upsert(sponsor, {
      onConflict: 'nickname',
    }).select('id').limit(1);
    if (!error) seeded++;
    else errors.push(`${sponsor.nickname}: ${error.code || error.message}`);
  }

  // Step 4: Verify wall API works
  const { error: wallError } = await admin.from('sponsors').select('id').limit(1);
  if (wallError) {
    console.error('[sponsors/migrate] Wall API check failed:', wallError);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Schema cache not updated. Run migration again.',
        seeded,
        errors,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Migration applied', seeded, errors: errors.length > 0 ? errors : undefined }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
