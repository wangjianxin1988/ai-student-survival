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

-- Step 8: Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Step 9: Create post_favorites table
CREATE TABLE IF NOT EXISTS post_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Step 10: Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 11: Create points balance trigger function
CREATE OR REPLACE FUNCTION update_points_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_new_balance INTEGER;
  v_new_earned INTEGER := 0;
  v_new_spent INTEGER := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(balance, 0), COALESCE(total_earned, 0), COALESCE(total_spent, 0)
    INTO v_new_balance, v_new_earned, v_new_spent
    FROM user_points_balance
    WHERE user_id = NEW.user_id;

    v_new_balance := v_new_balance + NEW.amount;

    IF NEW.amount >= 0 THEN
      v_new_earned := v_new_earned + NEW.amount;
    ELSE
      v_new_spent := v_new_spent + ABS(NEW.amount);
    END IF;

    INSERT INTO user_points_balance (user_id, balance, total_earned, total_spent)
    VALUES (NEW.user_id, v_new_balance, v_new_earned, v_new_spent)
    ON CONFLICT (user_id) DO UPDATE SET
      balance = user_points_balance.balance + NEW.amount,
      total_earned = CASE WHEN NEW.amount >= 0 THEN user_points_balance.total_earned + NEW.amount ELSE user_points_balance.total_earned END,
      total_spent = CASE WHEN NEW.amount < 0 THEN user_points_balance.total_spent + ABS(NEW.amount) ELSE user_points_balance.total_spent END,
      updated_at = NOW();

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create trigger on points_transactions
DROP TRIGGER IF EXISTS trigger_update_points_balance ON points_transactions;
CREATE TRIGGER trigger_update_points_balance
  AFTER INSERT ON points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_points_balance_on_transaction();

-- Step 13: RLS policies for post_likes
DROP POLICY IF EXISTS "Allow public read of post_likes" ON post_likes;
CREATE POLICY "Allow public read of post_likes" ON post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert of post_likes" ON post_likes;
CREATE POLICY "Allow authenticated insert of post_likes" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner delete post_likes" ON post_likes;
CREATE POLICY "Allow owner delete post_likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Step 14: RLS policies for post_favorites
DROP POLICY IF EXISTS "Allow public read of post_favorites" ON post_favorites;
CREATE POLICY "Allow public read of post_favorites" ON post_favorites FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert of post_favorites" ON post_favorites;
CREATE POLICY "Allow authenticated insert of post_favorites" ON post_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner delete post_favorites" ON post_favorites;
CREATE POLICY "Allow owner delete post_favorites" ON post_favorites FOR DELETE USING (auth.uid() = user_id);

-- Step 15: RLS policies for post_comments
DROP POLICY IF EXISTS "Allow public read of post_comments" ON post_comments;
CREATE POLICY "Allow public read of post_comments" ON post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert of post_comments" ON post_comments;
CREATE POLICY "Allow authenticated insert of post_comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow owner delete post_comments" ON post_comments;
CREATE POLICY "Allow owner delete post_comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- Step 16: Grant usage on public schema for anon access to views
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public_leaderboard TO anon;
GRANT SELECT ON user_points_balance TO anon;
GRANT SELECT, INSERT, DELETE ON post_likes TO anon;
GRANT SELECT, INSERT, DELETE ON post_favorites TO anon;
GRANT SELECT, INSERT, DELETE ON post_comments TO anon;

-- Step 17: Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_post_id ON post_favorites(post_id);
CREATE INDEX IF NOT EXISTS idx_post_favorites_user_id ON post_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- Step 18: Count RPC functions (for like/favorite denormalized counts)
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_favorites_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts SET favorites_count = favorites_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_favorites_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts SET favorites_count = GREATEST(favorites_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 19: Grant execute on RPC functions
GRANT EXECUTE ON FUNCTION increment_likes_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION decrement_likes_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_favorites_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION decrement_favorites_count(UUID) TO anon;
