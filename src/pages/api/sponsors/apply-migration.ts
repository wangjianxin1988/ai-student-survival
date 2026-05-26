// Apply Sponsors Migration - uses Supabase management API with service role key
export const prerender = false;

import type { APIRoute } from 'astro';
// @ts-ignore
import { env as cfEnv } from 'cloudflare:workers';

const SUPABASE_URL = 'https://giynvpfnzzelzwpmsgtf.supabase.co';
const MANAGEMENT_API = `https://giynvpfnzzelzwpmsgtf.supabase.co/rest/v1/projects/giynvpfnzzelzwpmsgtf/`;

export const POST: APIRoute = async () => {
  const rawKey = (cfEnv as Record<string, unknown>)?.SUPABASE_SERVICE_ROLE_KEY;
  const serviceRoleKey = typeof rawKey === 'string' && rawKey.length > 0 ? rawKey : null;

  if (!serviceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not available' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`,
    'apikey': serviceRoleKey,
  };

  const sql = `
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

    CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
    CREATE INDEX IF NOT EXISTS idx_sponsors_created_at ON sponsors(created_at DESC);

    ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public read of approved sponsors" ON sponsors;
    CREATE POLICY "Allow public read of approved sponsors" ON sponsors
      FOR SELECT USING (status = 'approved');

    DROP POLICY IF EXISTS "Allow authenticated users to create sponsors" ON sponsors;
    CREATE POLICY "Allow authenticated users to create sponsors" ON sponsors
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    GRANT USAGE ON SCHEMA public TO anon;
    GRANT SELECT ON sponsors TO anon;
    GRANT INSERT ON sponsors TO anon;

    NOTIFY pgrst, 'reload schema';

    INSERT INTO sponsors (nickname, amount, tier, payment_method, message, status)
    VALUES
      ('小明同学', 18, 'meal', 'wechat', '希望平台越办越好！', 'approved'),
      ('留学小助手', 66, 'super', 'alipay', '加油！', 'approved'),
      ('匿名好友', 6, 'coffee', 'wechat', NULL, 'approved'),
      ('Jack W', 18, 'meal', 'wechat', 'Great platform!', 'approved'),
      ('璐璐', 66, 'super', 'alipay', '帮助更多留学生！', 'approved')
    ON CONFLICT DO NOTHING;
  `;

  const response = await fetch(`${MANAGEMENT_API}sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: sql }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[sponsors/migrate] Migration error:', JSON.stringify(data));
    return new Response(
      JSON.stringify({ success: false, error: data.message || 'Migration failed', details: data }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Count how many were inserted
  const insertCount = data.filter((r: any) => r.command === 'INSERT')[0]?.rows?.length || 0;

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Sponsors migration applied',
      seeded: insertCount,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
