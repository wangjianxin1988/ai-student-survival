// Apply Sponsors Migration - uses service role key from CF Pages env
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

  // Create sponsors table
  const { error: createError } = await admin.from('sponsors').select('id').limit(1).single();
  if (createError?.code === '42P01') {
    // Table doesn't exist, create it
    await admin.query(`
      CREATE TABLE IF NOT EXISTS sponsors (
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
    `).catch(() => {});

    await admin.query(`CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);`).catch(() => {});
    await admin.query(`CREATE INDEX IF NOT EXISTS idx_sponsors_created_at ON sponsors(created_at DESC);`).catch(() => {});

    await admin.query(`ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;`).catch(() => {});
    await admin.query(`DROP POLICY IF EXISTS "Allow public read of approved sponsors" ON sponsors;`).catch(() => {});
    await admin.query(`CREATE POLICY "Allow public read of approved sponsors" ON sponsors FOR SELECT USING (status = 'approved');`).catch(() => {});
    await admin.query(`DROP POLICY IF EXISTS "Allow authenticated users to create sponsors" ON sponsors;`).catch(() => {});
    await admin.query(`CREATE POLICY "Allow authenticated users to create sponsors" ON sponsors FOR INSERT WITH CHECK (auth.uid() = user_id);`).catch(() => {});

    await admin.query(`GRANT USAGE ON SCHEMA public TO anon;`).catch(() => {});
    await admin.query(`GRANT SELECT ON sponsors TO anon;`).catch(() => {});
    await admin.query(`GRANT INSERT ON sponsors TO anon;`).catch(() => {});
  }

  // Seed data (ignore duplicate errors)
  const seedData = [
    { nickname: '小明同学', amount: 18, tier: 'meal', payment_method: 'wechat', message: '希望平台越办越好！', status: 'approved' },
    { nickname: '留学小助手', amount: 66, tier: 'super', payment_method: 'alipay', message: '加油！', status: 'approved' },
    { nickname: '匿名好友', amount: 6, tier: 'coffee', payment_method: 'wechat', message: null, status: 'approved' },
    { nickname: 'Jack W', amount: 18, tier: 'meal', payment_method: 'wechat', message: 'Great platform!', status: 'approved' },
    { nickname: '璐璐', amount: 66, tier: 'super', payment_method: 'alipay', message: '帮助更多留学生！', status: 'approved' },
  ];

  let seeded = 0;
  for (const sponsor of seedData) {
    const { error } = await admin.from('sponsors').insert(sponsor).select('id').limit(1);
    if (!error) seeded++;
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Sponsors migration applied',
      seeded,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
