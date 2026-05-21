-- Migration: Create community_posts table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/sql

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  category VARCHAR(50) NOT NULL DEFAULT 'tools',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  meta JSONB DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'published',
  auto_promoted BOOLEAN DEFAULT FALSE,
  auto_promote_reason TEXT,
  promoted_to_category VARCHAR(50),
  promote_source VARCHAR(20),
  promote_score INTEGER,
  direct_publish_requested BOOLEAN DEFAULT FALSE,
  direct_publish_cost INTEGER,
  is_hot_boost BOOLEAN DEFAULT FALSE,
  hot_boost_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_auto_promoted ON public.community_posts(auto_promoted);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes_count ON public.community_posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_comments_count ON public.community_posts(comments_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_favorites_count ON public.community_posts(favorites_count DESC);

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to read published posts
CREATE POLICY "Anyone can read published posts"
  ON public.community_posts
  FOR SELECT
  USING (status = 'published');

-- Allow authenticated users to create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.community_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts"
  ON public.community_posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.community_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Verify
SELECT 'community_posts table created successfully' AS result;
