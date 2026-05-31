// 积分服务
import * as storage from './storage';
import { POINTS_CONFIG } from './config';
import { sm2, calculateSM2Bonus, defaultSM2Data } from './sm2';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserPointsBalance, PointsTransaction } from './storage';

export interface EarnPointsOptions {
  amount: number;
  type: string;
  description: string;
  referenceId?: string;
}

// 获得积分
export async function earnPoints(
  supabase: SupabaseClient,
  userId: string,
  options: EarnPointsOptions,
  accessToken?: string
): Promise<{ success: boolean; transaction?: PointsTransaction; newBalance?: number }> {
  const { amount, type, description, referenceId } = options;

  // 确保用户有积分余额记录
  await storage.ensureUserBalance(userId, accessToken);

  // 记录积分变动
  const transaction = await storage.recordTransaction(userId, amount, type, description, referenceId);

  if (!transaction) {
    return { success: false };
  }

  // 获取最新的余额
  const balance = await storage.getUserBalance(userId);

  return {
    success: true,
    transaction,
    newBalance: balance.balance,
  };
}

// 消耗积分
export async function spendPoints(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  type: string,
  description: string,
  referenceId?: string
): Promise<{ success: boolean; transaction?: PointsTransaction; newBalance?: number; error?: string }> {
  // 检查余额是否足够
  const balance = await storage.getUserBalance(userId);

  if (balance.balance < amount) {
    return {
      success: false,
      error: 'Insufficient points balance',
    };
  }

  // 记录积分变动（使用负数）
  const transaction = await storage.recordTransaction(
    userId,
    -amount,
    type,
    description,
    referenceId
  );

  if (!transaction) {
    return { success: false, error: 'Failed to record transaction' };
  }

  // 获取最新的余额
  const newBalance = await storage.getUserBalance(userId);

  return {
    success: true,
    transaction,
    newBalance: newBalance.balance,
  };
}

// 获取用户积分余额
export async function getUserPoints(userId: string): Promise<UserPointsBalance> {
  return storage.getUserBalance(userId);
}

// 获取积分历史
export async function getPointsHistory(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: string;
  }
): Promise<{ transactions: PointsTransaction[]; total: number }> {
  return storage.getTransactionHistory(userId, options);
}

// 根据操作类型获取积分
export function getPointsByAction(action: keyof typeof POINTS_CONFIG.ACTIONS): number {
  return POINTS_CONFIG.ACTIONS[action] || 0;
}

// 获取等级信息
export function getLevelInfo(balance: number) {
  const levels = POINTS_CONFIG.LEVELS;

  let level = 1;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (balance >= levels[i]) {
      level = i + 1;
      break;
    }
  }

  const currentLevelPoints = levels[level - 1] || 0;
  const nextLevelPoints = levels[level] || levels[levels.length - 1];
  const progress = nextLevelPoints > currentLevelPoints
    ? ((balance - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
    : 100;

  return {
    level: Math.min(level, 10),
    currentLevelPoints,
    nextLevelPoints,
    progress: Math.min(progress, 100),
  };
}

// 获取积分商店套餐
export function getShopPackages() {
  return POINTS_CONFIG.SHOP_PACKAGES;
}

// ============ SM2 Spaced Repetition Bonus ============

/**
 * Calculate and award SM2 bonus points for content interaction
 * When a user's content receives interaction (like, comment, favorite),
 * use SM2 algorithm to determine bonus points
 *
 * @param userId - The content owner's user ID
 * @param contentType - Type of content interaction ('post_like', 'post_comment', 'post_favorite')
 * @param contentId - The content ID (post ID)
 * @param quality - Quality rating 0-5 (maps from interaction type)
 * @returns Bonus points awarded
 */
export async function awardSM2Bonus(
  userId: string,
  contentType: string,
  contentId: string,
  quality: number = 4 // Default: good quality for likes/comments
): Promise<number> {
  try {
    // Get existing SM2 record or create default
    const existing = await storage.getContentLearning(userId, contentType, contentId);
    const sm2Data = existing
      ? {
          easeFactor: existing.easeFactor,
          interval: existing.intervalDays,
          repetitions: existing.repetitions,
          nextReview: existing.nextReview ? new Date(existing.nextReview) : new Date(),
        }
      : defaultSM2Data();

    // Apply SM2 algorithm
    const result = sm2(sm2Data, quality);

    // Calculate bonus points
    const bonusPoints = calculateSM2Bonus(sm2Data);

    // Update content_learning record
    const totalBonus = (existing?.totalBonusPoints || 0) + bonusPoints;
    await storage.upsertContentLearning(
      userId,
      contentType,
      contentId,
      result,
      quality,
      totalBonus
    );

    // Award bonus points if > 0
    if (bonusPoints > 0) {
      await storage.recordTransaction(
        userId,
        bonusPoints,
        'sm2_bonus',
        `SM2间隔重复奖励 (${contentType})`,
        contentId
      );
    }

    return bonusPoints;
  } catch (err) {
    console.error('SM2 bonus calculation failed:', err);
    return 0;
  }
}
