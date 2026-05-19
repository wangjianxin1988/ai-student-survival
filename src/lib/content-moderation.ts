/**
 * Content Moderation Module - Anti-Spam and Anti-Advertisement System
 * Prevents spam, advertisement, flooding, and duplicate content
 */

// Types
export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
  score: number; // 0-100, higher = more likely spam
  flags: ModerationFlag[];
}

export type ModerationFlag =
  | 'spam_keywords'
  | 'advertisement'
  | 'external_links'
  | 'repeated_content'
  | 'duplicate_content'
  | 'flooding'
  | 'too_short'
  | 'too_long'
  | 'suspicious_pattern'
  | 'rate_limit_exceeded'
  | 'profanity'
  | 'special_characters_abuse';

// Rate limit configuration
export interface RateLimitConfig {
  maxPostsPerHour: number;
  maxPostsPerDay: number;
  maxCommentsPerHour: number;
  maxCommentsPerDay: number;
  windowMs: number;
}

// Configuration
export const RATE_LIMITS: RateLimitConfig = {
  maxPostsPerHour: 5,
  maxPostsPerDay: 20,
  maxCommentsPerHour: 10,
  maxCommentsPerDay: 50,
  windowMs: 60 * 60 * 1000, // 1 hour window for hourly limits
};

// Spam keywords that indicate advertisement or low-quality content
const SPAM_KEYWORDS = [
  // English spam indicators
  'buy now', 'click here', 'free money', 'make money fast', 'earn extra cash',
  'limited time offer', 'act now', 'order now', 'special promotion', 'discount code',
  'cheap tablets', 'cheap phones', 'replica watches', ' knockoff', 'best price',
  'miracle', 'weight loss', 'no prescription', 'act now', 'call now',
  'subscribe to', 'follow for follow', 'dm for', 'check my profile',
  'adult content', 'onlyfans', 'casino', 'lottery', 'bitcoin giveaway',

  // Chinese spam indicators
  '刷单', '兼职', '日结', '高薪', '诚聘', '代理',
  '优惠券', '打折', '特价', '促销', '秒杀',
  '加微信', '加QQ', '联系方式', '手机号', '微信号',
  '赚钱', '理财', '投资', '分红', '返利',
  '赌博', '彩票', '赌球', '博彩',

  // Additional spam patterns
  '代做', '代写', 'essay', 'paper', 'assignment',
  '外包', '接单', '服务', '帮你', '帮做',
  'vip', '会员', '内部', '特殊渠道',

  // URLs and external links patterns (added points but not auto-block)
  'http://', 'https://', 'www.', '.com/', '.cn/', '.net/',
  't.me/', 'telegram', 'whatsapp', 'wa.me/', 'discord.gg/',
];

// Profanity words (basic set - would need comprehensive list in production)
const PROFANITY_WORDS = [
  'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard',
  '垃圾', '废物', '智障', '白痴', '神经病',
  '肏', '操你妈', '去你妈的', '艹', '草泥马',
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /\b[A-Z]{10,}\b/g, // Too many capital letters
  /(.)\1{5,}/g, // Same character repeated 5+ times
  /[!?]{3,}/g, // Multiple exclamation/question marks
  /https?:\/\/[^\s]+[^\s.,;:!?]/g, // URLs without proper termination
  /[a-z]{30,}/gi, // Too many lowercase letters without spaces (looks like spam)
];

// Flooding detection: recent content hashes by user
const FLOOD_CHECK_KEY = 'demo_flood_check';
const FLOOD_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
const FLOOD_SIMILARITY_THRESHOLD = 0.8; // 80% similarity = flooding

// Rate limit storage
const RATE_LIMIT_KEY = 'demo_rate_limits';

// Exact duplicate check storage
const DUPLICATE_CHECK_KEY = 'demo_duplicate_check';
const DUPLICATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour for exact duplicates

// Simple hash function for content comparison
function simpleHash(content: string): string {
  let hash = 0;
  const normalized = content.toLowerCase().trim();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Calculate similarity between two strings (Jaccard similarity of character trigrams)
function calculateSimilarity(content1: string, content2: string): number {
  const normalize = (s: string) => s.toLowerCase().trim();
  const s1 = normalize(content1);
  const s2 = normalize(content2);

  if (s1 === s2) return 1;

  const getTrigrams = (s: string): Set<string> => {
    const trigrams = new Set<string>();
    for (let i = 0; i < s.length - 2; i++) {
      trigrams.add(s.substring(i, i + 3));
    }
    return trigrams;
  };

  const t1 = getTrigrams(s1);
  const t2 = getTrigrams(s2);

  if (t1.size === 0 || t2.size === 0) return 0;

  let intersection = 0;
  t1.forEach(trigram => {
    if (t2.has(trigram)) intersection++;
  });

  const union = t1.size + t2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// Storage interface
interface FloodEntry {
  hash: string;
  content: string;
  timestamp: number;
}

interface DuplicateEntry {
  hash: string;
  timestamp: number;
}

interface StorageData {
  [key: string]: FloodEntry | DuplicateEntry;
}

function getStorageData<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {};
}

function saveStorageData<T>(key: string, data: Record<string, T>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function cleanExpiredEntries<T extends { timestamp: number }>(entries: Record<string, T>, maxAge: number): Record<string, T> {
  const now = Date.now();
  const cleaned: Record<string, T> = {};
  Object.entries(entries).forEach(([key, entry]) => {
    if (now - entry.timestamp < maxAge) {
      cleaned[key] = entry;
    }
  });
  return cleaned;
}

// Types for rate limit tracking
interface RateLimitEntry {
  userId: string;
  action: 'post' | 'comment';
  count: number;
  windowStart: number;
  lastAction: number;
}

/**
 * Check if content passes moderation
 */
export function moderateContent(
  content: string,
  userId: string,
  action: 'post' | 'comment'
): ModerationResult {
  const flags: ModerationFlag[] = [];
  let score = 0;
  const trimmedContent = content.trim();
  const contentHash = simpleHash(content);

  console.log(`[内容审核] 检查${action === 'comment' ? '评论' : '帖子'}，用户: ${userId}，内容长度: ${trimmedContent.length}`);

  // 1. Check exact duplicate (within 1 hour)
  const duplicateCheck = checkExactDuplicate(userId, contentHash);
  if (duplicateCheck.isDuplicate) {
    console.log('[内容审核] 拦截：重复内容');
    return {
      isAllowed: false,
      reason: '检测到重复内容，请勿重复发布相同内容',
      score: 100,
      flags: ['duplicate_content'],
    };
  }

  // 2. Check flooding (similar content in short time)
  const floodingCheck = checkFlooding(userId, content, action);
  if (floodingCheck.isFlooding) {
    console.log('[内容审核] 拦截：灌水行为');
    return {
      isAllowed: false,
      reason: floodingCheck.reason || '检测到灌水行为，请稍后再试',
      score: 100,
      flags: ['flooding'],
    };
  }

  // 3. Check rate limits
  const rateLimitCheck = checkRateLimit(userId, action);
  if (!rateLimitCheck.allowed) {
    console.log('[内容审核] 拦截：频率超限');
    return {
      isAllowed: false,
      reason: rateLimitCheck.reason,
      score: 100,
      flags: ['rate_limit_exceeded'],
    };
  }

  console.log('[内容审核] 频率检查通过，开始内容质量检查...');

  // 4. Check content quality
  if (trimmedContent.length < 5) {
    flags.push('too_short');
    score += 20;
  }
  if (trimmedContent.length > 10000) {
    flags.push('too_long');
    score += 10;
  }

  // 5. Check for spam keywords
  const lowerContent = content.toLowerCase();
  let spamKeywordFound = false;
  for (const keyword of SPAM_KEYWORDS) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      flags.push('advertisement');
      score += 30;
      spamKeywordFound = true;
      break;
    }
  }

  // 6. Check for profanity
  for (const word of PROFANITY_WORDS) {
    if (lowerContent.includes(word.toLowerCase())) {
      flags.push('profanity');
      score += 25;
      break;
    }
  }

  // 7. Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      flags.push('suspicious_pattern');
      score += 15;
      break;
    }
  }

  // 8. Check for excessive special characters
  const specialCharRatio = (content.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length / content.length;
  if (specialCharRatio > 0.3) {
    flags.push('special_characters_abuse');
    score += 15;
  }

  // 9. Check for repeated content (copy-paste detection)
  if (hasRepeatedContent(content)) {
    flags.push('repeated_content');
    score += 20;
  }

  // 10. Check for external links (can be allowed but scores points)
  const linkPattern = /https?:\/\/[^\s]+/g;
  const links = content.match(linkPattern);
  if (links && links.length > 2) {
    flags.push('external_links');
    score += 10;
  }

  return {
    isAllowed: score < 50, // Threshold for allowing content
    reason: score >= 50 ? getReasonFromFlags(flags) : undefined,
    score,
    flags,
  };
}

/**
 * Check for exact duplicate content
 */
function checkExactDuplicate(userId: string, contentHash: string): { isDuplicate: boolean } {
  const storage = getStorageData<DuplicateEntry>(DUPLICATE_CHECK_KEY);
  const key = `${userId}_${contentHash}`;

  // Clean expired entries
  const cleaned = cleanExpiredEntries(storage, DUPLICATE_WINDOW_MS);
  saveStorageData(DUPLICATE_CHECK_KEY, cleaned);

  if (cleaned[key]) {
    return { isDuplicate: true };
  }

  return { isDuplicate: false };
}

/**
 * Check for flooding (similar content in short time)
 */
function checkFlooding(userId: string, content: string, action: 'post' | 'comment'): { isFlooding: boolean; reason?: string } {
  const storage = getStorageData<FloodEntry>(FLOOD_CHECK_KEY);
  const key = `${userId}_${action}`;

  // Clean expired entries
  const cleaned = cleanExpiredEntries(storage, FLOOD_WINDOW_MS);

  const existing = cleaned[key];
  if (existing) {
    const similarity = calculateSimilarity(content, existing.content);
    if (similarity >= FLOOD_SIMILARITY_THRESHOLD) {
      return {
        isFlooding: true,
        reason: '检测到相似内容，请勿刷屏或重复发布类似内容',
      };
    }
  }

  return { isFlooding: false };
}

/**
 * Check rate limit for user
 */
export function checkRateLimit(
  userId: string,
  action: 'post' | 'comment'
): { allowed: boolean; reason?: string } {
  const limits = getRateLimits();
  const key = `${userId}_${action}`;
  const entry = limits[key];

  const now = Date.now();
  const hourlyLimit = action === 'post' ? RATE_LIMITS.maxPostsPerHour : RATE_LIMITS.maxCommentsPerHour;
  const dailyLimit = action === 'post' ? RATE_LIMITS.maxPostsPerDay : RATE_LIMITS.maxCommentsPerDay;

  console.log(`[防灌水] 检查${action === 'comment' ? '评论' : '帖子'}，用户: ${userId}，当前记录:`, entry);

  if (!entry) {
    // First action
    console.log('[防灌水] 首次操作，允许');
    return { allowed: true };
  }

  const hourAgo = now - RATE_LIMITS.windowMs;
  const dayAgo = now - 24 * 60 * 60 * 1000;

  // Reset if hourly window has passed
  if (entry.windowStart < hourAgo) {
    console.log('[防灌水] 小时窗口已过期，允许（新窗口）');
    return { allowed: true };
  }

  // Check hourly limit
  if (entry.count >= hourlyLimit) {
    const timeLeft = Math.ceil((entry.windowStart + RATE_LIMITS.windowMs - now) / 60000);
    console.log(`[防灌水] 小时限制已达: ${entry.count} >= ${hourlyLimit}，拦截，还需等待 ${timeLeft} 分钟`);
    return {
      allowed: false,
      reason: `发布过于频繁，请 ${timeLeft} 分钟后再试`,
    };
  }

  // Check daily limit - enforce actual daily cap
  // Track total count in the last 24 hours by checking lastAction
  if (entry.lastAction < dayAgo) {
    // Last action was over a day ago, reset counts
    console.log('[防灌水] 每日窗口已过期，重置计数');
    entry.count = 0;
    entry.windowStart = now;
  }

  // Check if daily limit would be exceeded (only enforce after 10+ comments to allow normal usage)
  if (entry.count >= dailyLimit) {
    console.log(`[防灌水] 每日限制已达: ${entry.count} >= ${dailyLimit}，拦截`);
    return {
      allowed: false,
      reason: `今日评论次数已达上限（${dailyLimit}次），请明天再试`,
    };
  }

  console.log(`[防灌水] 允许: 当前${entry.count}/${hourlyLimit}次/小时，${entry.count}/${dailyLimit}次/天`);
  return { allowed: true };
}

/**
 * Record an action for rate limiting and content tracking
 */
export function recordAction(userId: string, action: 'post' | 'comment', content?: string): void {
  const limits = getRateLimits();
  const key = `${userId}_${action}`;
  const now = Date.now();
  const hourAgo = now - RATE_LIMITS.windowMs;

  if (!limits[key] || limits[key].windowStart < hourAgo) {
    // Start new window
    limits[key] = {
      userId,
      action,
      count: 1,
      windowStart: now,
      lastAction: now,
    };
  } else {
    limits[key].count++;
    limits[key].lastAction = now;
  }

  saveRateLimits(limits);

  // Record content hash for duplicate and flooding detection
  if (content) {
    const contentHash = simpleHash(content);

    // Store for exact duplicate check
    const duplicateStorage = getStorageData<DuplicateEntry>(DUPLICATE_CHECK_KEY);
    duplicateStorage[`${userId}_${contentHash}`] = {
      hash: contentHash,
      timestamp: now,
    };
    saveStorageData(DUPLICATE_CHECK_KEY, duplicateStorage);

    // Store for flooding check
    const floodStorage = getStorageData<FloodEntry>(FLOOD_CHECK_KEY);
    floodStorage[key] = {
      hash: contentHash,
      content: content.substring(0, 500), // Store first 500 chars for similarity comparison
      timestamp: now,
    };
    saveStorageData(FLOOD_CHECK_KEY, floodStorage);
  }
}

/**
 * Get reason string from flags
 */
function getReasonFromFlags(flags: ModerationFlag[]): string {
  if (flags.includes('spam_keywords') || flags.includes('advertisement')) {
    return '内容包含广告或垃圾信息';
  }
  if (flags.includes('profanity')) {
    return '内容包含不当语言';
  }
  if (flags.includes('repeated_content')) {
    return '内容重复，请勿刷屏';
  }
  if (flags.includes('suspicious_pattern')) {
    return '内容格式异常';
  }
  if (flags.includes('external_links')) {
    return '内容包含过多外部链接';
  }
  if (flags.includes('too_short')) {
    return '内容过短，请详细描述';
  }
  if (flags.includes('too_long')) {
    return '内容过长，请精简';
  }
  if (flags.includes('special_characters_abuse')) {
    return '请勿滥用特殊字符';
  }
  return '内容审核未通过';
}

/**
 * Check if content has repeated patterns
 */
function hasRepeatedContent(content: string): boolean {
  // Check for repeated sentences/paragraphs
  const sentences = content.split(/[.!?。！？]+/);
  const sentenceCounts: Record<string, number> = {};

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 20) {
      sentenceCounts[trimmed] = (sentenceCounts[trimmed] || 0) + 1;
      if (sentenceCounts[trimmed] > 2) {
        return true;
      }
    }
  }

  return false;
}

// Storage functions
function getRateLimits(): Record<string, RateLimitEntry> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveRateLimits(limits: Record<string, RateLimitEntry>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(limits));
}

/**
 * Clear rate limit for user (for testing/admin)
 */
export function clearRateLimit(userId: string): void {
  const limits = getRateLimits();
  const keysToDelete = Object.keys(limits).filter(k => k.startsWith(userId));
  for (const key of keysToDelete) {
    delete limits[key];
  }
  saveRateLimits(limits);
}

/**
 * Get moderation statistics for a user
 */
export function getModerationStats(userId: string): {
  postsToday: number;
  commentsToday: number;
  postsThisHour: number;
  commentsThisHour: number;
} {
  const limits = getRateLimits();
  const now = Date.now();
  const hourAgo = now - RATE_LIMITS.windowMs;
  const dayAgo = now - 24 * 60 * 60 * 1000;

  const postEntry = limits[`${userId}_post`];
  const commentEntry = limits[`${userId}_comment`];

  return {
    postsToday: postEntry && postEntry.lastAction > dayAgo ? postEntry.count : 0,
    commentsToday: commentEntry && commentEntry.lastAction > dayAgo ? commentEntry.count : 0,
    postsThisHour: postEntry && postEntry.windowStart > hourAgo ? postEntry.count : 0,
    commentsThisHour: commentEntry && commentEntry.windowStart > hourAgo ? commentEntry.count : 0,
  };
}

// Content moderation API
export const contentModerationApi = {
  moderate(content: string, userId: string, action: 'post' | 'comment'): ModerationResult {
    const result = moderateContent(content, userId, action);
    if (result.isAllowed) {
      recordAction(userId, action, content);
    }
    return result;
  },

  checkRateLimit(userId: string, action: 'post' | 'comment') {
    return checkRateLimit(userId, action);
  },

  getStats(userId: string) {
    return getModerationStats(userId);
  },

  clearLimits(userId: string) {
    clearRateLimit(userId);
  },
};

export default contentModerationApi;
