// Apply Sponsors Migration - creates sponsors table and seeds data
export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import { env as cfEnv } from 'cloudflare:workers';

const SUPABASE_URL = 'https://giynvpfnzzelzwpmsgtf.supabase.co';
const SUPABASE_REF = 'giynvpfnzzelzwpmsgtf';

const MGMT_API = `https://api.supabase.com/v1/projects/${SUPABASE_REF}/database/query`;

// Executes raw SQL via Supabase Management API (works in CF Workers)
async function runSql(serviceRoleKey: string, sql: string): Promise<{ error: string | null }> {
  const res = await fetch(MGMT_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: `HTTP ${res.status}: ${text}` };
  }

  const data = await res.json().catch(() => ({}));
  if (data?.error) {
    return { error: data.error.message || JSON.stringify(data.error) };
  }
  return { error: null };
}

export const POST: APIRoute = async () => {
  try {
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

    // Step 1: Check if sponsors table exists via PostgREST
    const { error: checkError } = await admin.from('sponsors').select('id').limit(1).single();

    let tableCreated = false;
    if (checkError?.code === 'PGRST204' || checkError?.code === '42P01') {
      // Table doesn't exist - create it using Management API
      const createResult = await runSql(serviceRoleKey, `
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

      if (createResult.error) {
        console.error('[sponsors/migrate] Create table error:', createResult.error);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create table', details: createResult.error }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      tableCreated = true;
    }

    // Step 2: Reload PostgREST schema cache
    if (tableCreated) {
      await runSql(serviceRoleKey, `NOTIFY pgrst, 'reload schema';`);
      // Small delay to allow schema cache to reload
      await new Promise(r => setTimeout(r, 1000));
    }

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
      return new Response(
        JSON.stringify({ success: false, error: 'Schema cache not updated', seeded, errors }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Migration applied', seeded, errors: errors.length > 0 ? errors : undefined }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('[sponsors/migrate] Unhandled error:', e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || 'Unknown error', stack: e?.stack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
