-- ============================================================
-- Public Leaderboard: Table + View + RLS Policies
-- Purpose: Allow public access to leaderboard data via RPC
-- ============================================================

-- Step 1: Create user_points_balance table (if not exists)
CREATE TABLE IF NOT EXISTS user_points_balance (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 NOT NULL,
  total_earned INTEGER DEFAULT 0 NOT NULL,
  total_spent INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 2: Create points_transactions table (if not exists)
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 3: Create public_leaderboard view
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  upb.user_id,
  upb.balance,
  upb.total_earned,
  upb.updated_at,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'avatar_url' as avatar
FROM user_points_balance upb
LEFT JOIN auth.users u ON u.id = upb.user_id
WHERE upb.balance > 0
ORDER BY upb.balance DESC;

-- Step 4: Public SELECT policy on view (views inherit RLS from base tables)
DROP POLICY IF EXISTS "Allow public read of public_leaderboard" ON public_leaderboard;
CREATE POLICY "Allow public read of public_leaderboard"
ON public_leaderboard FOR SELECT USING (true);

-- Step 6: Public SELECT policy on user_points_balance (positive balance only)
DROP POLICY IF EXISTS "Allow public read for positive balance" ON user_points_balance;
CREATE POLICY "Allow public read for positive balance"
ON user_points_balance FOR SELECT USING (balance > 0);

-- Step 7: Ensure users table public read policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow public read of user profiles'
  ) THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read of user profiles" ON users FOR SELECT USING (true);
  END IF;
END
$$;

-- Step 8: Grant usage on public schema for anon access to views
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public_leaderboard TO anon;
GRANT SELECT ON user_points_balance TO anon;
