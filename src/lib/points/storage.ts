// 积分存储操作
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
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

// 获取用户积分余额
export async function getUserBalance(userId: string): Promise<UserPointsBalance> {
  const { data, error } = await supabase
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

// 获取积分变动历史
export async function getTransactionHistory(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: string;
  }
): Promise<{ transactions: PointsTransaction[]; total: number }> {
  const { limit = 20, offset = 0, type } = options || {};

  let query = supabase
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

// 记录积分变动（不处理余额，由数据库触发器自动更新）
export async function recordTransaction(
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string
): Promise<PointsTransaction | null> {
  const { data, error } = await supabase
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

// 确保用户有积分余额记录
export async function ensureUserBalance(userId: string, accessToken?: string): Promise<void> {
  // Create a client with the user's access token so RLS allows the upsert.
  // The users table INSERT policy requires auth.uid() = id.
  let client = supabase;
  if (accessToken) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  // Ensure the user has a row in public.users (needed for FK constraints on points_transactions)
  await client.from('users').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

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
