// 积分存储操作
import { supabase, supabaseAdmin, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface UserPointsBalance {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

// 获取用户积分余额 (server-side, uses admin client to bypass RLS)
export async function getUserBalance(userId: string): Promise<UserPointsBalance> {
  const { data, error } = await supabaseAdmin
    .from('user_points_balance')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // 如果没有记录，返回默认余额
    return {
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
    };
  }

  return {
    userId: data.user_id,
    balance: data.balance,
    totalEarned: data.total_earned,
    totalSpent: data.total_spent,
  };
}

// 获取积分变动历史 (server-side, uses admin client to bypass RLS)
export async function getTransactionHistory(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: string;
  }
): Promise<{ transactions: PointsTransaction[]; total: number }> {
  const { limit = 20, offset = 0, type } = options || {};

  let query = supabaseAdmin
    .from('points_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching transaction history:', error);
    return { transactions: [], total: 0 };
  }

  const transactions: PointsTransaction[] = (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    referenceId: row.reference_id,
    createdAt: row.created_at,
  }));

  return { transactions, total: count || 0 };
}

// 记录积分变动（不处理余额，由数据库触发器自动更新） (server-side, uses admin client to bypass RLS)
export async function recordTransaction(
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string
): Promise<PointsTransaction | null> {
  const { data, error } = await supabaseAdmin
    .from('points_transactions')
    .insert({
      user_id: userId,
      amount,
      type,
      description,
      reference_id: referenceId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording transaction:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    amount: data.amount,
    type: data.type,
    description: data.description,
    referenceId: data.reference_id,
    createdAt: data.created_at,
  };
}

// 确保用户有积分余额记录 (server-side, uses admin client to bypass RLS)
export async function ensureUserBalance(userId: string, accessToken?: string): Promise<void> {
  // Use admin client to bypass RLS for server-side operations
  const client = supabaseAdmin;

  const { data } = await client
    .from('user_points_balance')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (!data) {
    await client.from('user_points_balance').insert({
      user_id: userId,
      balance: 0,
      total_earned: 0,
      total_spent: 0,
    });
  }
}

// ============ SM2 Content Learning ============

export interface ContentLearningRecord {
  id: string;
  userId: string;
  contentType: string;
  contentId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: string | null;
  lastQuality: number;
  totalBonusPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Get or create a content_learning record
export async function getContentLearning(
  userId: string,
  contentType: string,
  contentId: string
): Promise<ContentLearningRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('content_learning')
    .select('*')
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    contentType: data.content_type,
    contentId: data.content_id,
    easeFactor: data.ease_factor,
    intervalDays: data.interval_days,
    repetitions: data.repetitions,
    nextReview: data.next_review,
    lastQuality: data.last_quality,
    totalBonusPoints: data.total_bonus_points,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Upsert a content_learning record with SM2 data
export async function upsertContentLearning(
  userId: string,
  contentType: string,
  contentId: string,
  sm2Data: { easeFactor: number; interval: number; repetitions: number; nextReview: Date },
  quality: number,
  bonusPoints: number
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('content_learning')
    .upsert({
      user_id: userId,
      content_type: contentType,
      content_id: contentId,
      ease_factor: sm2Data.easeFactor,
      interval_days: sm2Data.interval,
      repetitions: sm2Data.repetitions,
      next_review: sm2Data.nextReview.toISOString(),
      last_quality: quality,
      total_bonus_points: bonusPoints,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,content_type,content_id',
    });

  if (error) {
    console.error('Error upserting content_learning:', error);
    return false;
  }
  return true;
}

// Ensure content_learning table exists (run once)
export async function ensureContentLearningTable(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS content_learning (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      ease_factor DECIMAL(4,2) DEFAULT 2.50,
      interval_days INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review TIMESTAMPTZ,
      last_quality INTEGER DEFAULT 0,
      total_bonus_points INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, content_type, content_id)
    );
  `;
  try {
    await supabaseAdmin.rpc('exec_sql', { sql }).single();
  } catch {
    // Table may already exist, or exec_sql may not be available
    // In Supabase, tables should be created via migrations
    console.info('content_learning table: ensure it exists via Supabase migration');
  }
}
