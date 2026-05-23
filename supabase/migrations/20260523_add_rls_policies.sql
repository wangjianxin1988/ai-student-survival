-- ============================================================
-- Row Level Security (RLS) Policies for MI TO AI Student Survival
-- Created: 2026-05-23
-- ============================================================

-- ============================================================
-- USERS TABLE
-- ============================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read any profile (for display purposes)
CREATE POLICY "Allow public read of user profiles"
ON users FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Allow users to update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile (via trigger, not direct insert)
CREATE POLICY "Allow authenticated users to insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================
-- COMMUNITY_POSTS TABLE
-- ============================================================

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read posts
CREATE POLICY "Allow public read of community posts"
ON community_posts FOR SELECT
USING (true);

-- Authenticated users can create posts
CREATE POLICY "Allow authenticated users to create posts"
ON community_posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only post author or admin can update posts
CREATE POLICY "Allow author to update own posts"
ON community_posts FOR UPDATE
USING (auth.uid() = author_id OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Only post author or admin can delete posts
CREATE POLICY "Allow author to delete own posts"
ON community_posts FOR DELETE
USING (auth.uid() = author_id OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- POST_COMMENTS TABLE
-- ============================================================

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Allow public read of comments"
ON post_comments FOR SELECT
USING (true);

-- Authenticated users can create comments
CREATE POLICY "Allow authenticated users to create comments"
ON post_comments FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only comment author or admin can update comments
CREATE POLICY "Allow author to update own comments"
ON post_comments FOR UPDATE
USING (auth.uid() = user_id OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Only comment author or admin can delete comments
CREATE POLICY "Allow author to delete own comments"
ON post_comments FOR DELETE
USING (auth.uid() = user_id OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- POST_LIKES TABLE
-- ============================================================

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes
CREATE POLICY "Allow public read of likes"
ON post_likes FOR SELECT
USING (true);

-- Authenticated users can like posts
CREATE POLICY "Allow authenticated users to create likes"
ON post_likes FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own likes
CREATE POLICY "Allow users to delete own likes"
ON post_likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- POST_FAVORITES TABLE
-- ============================================================

ALTER TABLE post_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "Allow users to read own favorites"
ON post_favorites FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can create favorites
CREATE POLICY "Allow authenticated users to create favorites"
ON post_favorites FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own favorites
CREATE POLICY "Allow users to delete own favorites"
ON post_favorites FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- RATINGS TABLE
-- ============================================================

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings
CREATE POLICY "Allow public read of ratings"
ON ratings FOR SELECT
USING (true);

-- Authenticated users can create ratings
CREATE POLICY "Allow authenticated users to create ratings"
ON ratings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own ratings
CREATE POLICY "Allow users to update own ratings"
ON ratings FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Allow users to delete own ratings"
ON ratings FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- USER_FAVORITES TABLE
-- ============================================================

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "Allow users to read own favorites"
ON user_favorites FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can create favorites
CREATE POLICY "Allow authenticated users to create favorites"
ON user_favorites FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own favorites
CREATE POLICY "Allow users to delete own favorites"
ON user_favorites FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- OFFERS TABLE
-- ============================================================

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved offers, only author can see pending ones
CREATE POLICY "Allow public read of approved offers"
ON offers FOR SELECT
USING (
  status = 'approved' OR
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Authenticated users can create offers
CREATE POLICY "Allow authenticated users to create offers"
ON offers FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only offer author or admin can update offers
CREATE POLICY "Allow author to update own offers"
ON offers FOR UPDATE
USING (auth.uid() = user_id OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Only offer author or admin can delete offers
CREATE POLICY "Allow author to delete own offers"
ON offers FOR DELETE
USING (auth.uid() = user_id OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- USER_POINTS_BALANCE TABLE
-- ============================================================

ALTER TABLE user_points_balance ENABLE ROW LEVEL SECURITY;

-- Users can read their own balance
CREATE POLICY "Allow users to read own balance"
ON user_points_balance FOR SELECT
USING (auth.uid() = user_id);

-- System can update balance (via service role)
-- No direct INSERT/UPDATE/DELETE for users

-- ============================================================
-- POINTS_TRANSACTIONS TABLE
-- ============================================================

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Allow users to read own transactions"
ON points_transactions FOR SELECT
USING (auth.uid() = user_id);

-- System can create transactions (via service role or triggers)
-- No direct INSERT/UPDATE/DELETE for users

-- ============================================================
-- PUBLIC TABLES (no RLS needed - read by all, managed by admins)
-- ============================================================
-- tools, university_policies, payment_solutions, prompt_templates
-- These tables are managed via admin dashboard, not user-facing writes
-- RLS is disabled or set to permissive policies for reads
