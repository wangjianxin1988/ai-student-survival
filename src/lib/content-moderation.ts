/**
 * Content Moderation Module - Anti-Spam and Anti-Advertisement System
 * Prevents spam, advertisement, flooding, and duplicate content
 *
 * Enhanced with:
 * - glin-profanity library for ML-powered profanity detection
 * - Leet speak detection (letter substitution)
 * - Homophonic word detection (谐音词)
 * - Keyboard mashing detection
 * - Semantic pattern analysis
 */

import { Filter, checkProfanity, isWordProfane } from 'glin-profanity';

// Initialize the glin-profanity filter with aggressive settings
const profanityFilter = new Filter({
  languages: ['english', 'chinese'],
  detectLeetspeak: true,
  leetspeakLevel: 'aggressive',
  normalizeUnicode: true,
  cacheResults: true,
  maxCacheSize: 1000,
});

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
  | 'special_characters_abuse'
  | 'gibberish_detected'
  | 'leet_speak'
  | 'homophonic_spam'
  | 'toxicity_detected';

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

// ============================================
// Leet Speak (字母替换) Detection
// ============================================
// Common substitutions: 0→o, 1→i/l, 3→e, 4→a, 5→s, 7→t, 8→b, @→a, $→s
const LEET_PATTERNS: [RegExp, string][] = [
  // VIP variants
  [/v[0@]p/gi, 'vip'],
  [/v1p/gi, 'vip'],
  [/v!p/gi, 'vip'],
  // BUY variants
  [/b[uy]/gi, 'buy'],
  [/b0y/gi, 'buy'],
  [/bOy/gi, 'buy'],
  // CLICK variants
  [/c1ick/gi, 'click'],
  [/cl1ck/gi, 'click'],
  [/c11ck/gi, 'click'],
  [/cl!ck/gi, 'click'],
  // CASINO variants
  [/c[@4]s[1!]n[o0]/gi, 'casino'],
  [/c[@4]s1n[o0]/gi, 'casino'],
  // WEBSITES
  [/w[e3][b4][s1][i1][t7][e3]/gi, 'website'],
  // CONTACT variants
  [/c[o0]nt[@4]ct/gi, 'contact'],
  [/c[o0]nt4ct/gi, 'contact'],
  // MONEY variants
  [/m[o0]n[e3]y/gi, 'money'],
  [/mooney/gi, 'money'],
  // FREE variants
  [/fr[e3][e3]/gi, 'free'],
  [/fr33/gi, 'free'],
  // ORDER variants
  [/[o0]rd[e3]r/gi, 'order'],
  [/0rder/gi, 'order'],
  // SUBSCRIBE variants
  [/su[bb][s5][c4][r][i1]b[e3]/gi, 'subscribe'],
  [/sub$cr1b3/gi, 'subscribe'],
  // FOLLOW variants
  [/f[o0]ll[o0]w/gi, 'follow'],
  [/f0llow/gi, 'follow'],
  // DM/me variants
  [/d[m][\s]/gi, 'dm'],
  // CHAT variants
  [/ch[@4]t/gi, 'chat'],
  [/c_h_a_t/gi, 'chat'],
  // SEX variants
  [/s[e3][x]/gi, 'sex'],
  [/s3x/gi, 'sex'],
  // Adult content
  [/p[@4]rn/gi, 'porn'],
  [/p0rn/gi, 'porn'],
  // WIN variants
  [/w[i1]n/gi, 'win'],
  [/w1n/gi, 'win'],
  // GET variants
  [/g[e3]t/gi, 'get'],
  [/g3t/gi, 'get'],
  // NOW variants
  [/n[o0]w/gi, 'now'],
  [/n0w/gi, 'now'],
  // CALL variants
  [/c[@4]ll/gi, 'call'],
  [/c4ll/gi, 'call'],
  // TEXT/TG variants
  [/t[e3]x[t7]/gi, 'text'],
  [/t[g9]/gi, 'tg'],
  [/t[e3]l[e3]/gi, 'tele'],
];

// ============================================
// Homophonic (谐音) Chinese Spam Patterns
// ============================================
const HOMOPHONIC_PATTERNS: [RegExp, string][] = [
  // 微信 variants
  // eslint-disable-next-line no-misleading-character-class
  [/微[信✉️威微]|we[i1]x[i1]n|wechat|v[x+][i1]|v[x+]/gi, '微信'],
  // eslint-disable-next-line no-misleading-character-class
  [/威信|微x[信?]|薇信|伈|xin$/gi, '微信'],
  // QQ variants
  [/扣扣|企鹅|群号|[Qq]{2}|[Qq][\s]*[Qq]|qiut?$/gi, 'QQ'],
  [/q群|扣[扣?q]|Q$/gi, 'QQ'],
  // 联系我 variants
  [/联繫|联系我|联係|连係|看我主页|点我头像|头像有/gi, '联系方式'],
  [/主页有|头像有|个人简介|简介有/gi, '联系方式'],
  // 手机号 variants
  [/手機|phone|m[o0]b[o0]|電?话|[话話]/gi, '手机号'],
  [/号[码馬?]|number/gi, '手机号'],
  // 微信号 variants
  // eslint-disable-next-line no-misleading-character-class
  [/微[信✉️]号|[wx]+[sx]+[hx]+/gi, '微信号'],
  // 赚钱 variants
  // eslint-disable-next-line no-misleading-character-class
  [/赚[钱💰米金]|挣[$钱]|赚$/gi, '赚钱'],
  [/月入|日入|日赚|周赚/gi, '赚钱'],
  // 菠菜 (博彩) variants
  [/菠菜|[博播]彩|赌[博?]/gi, '菠菜'],
  // 兼职 variants
  [/兼[职殖]|副业|外快|补贴/gi, '兼职'],
  // 色情 variants
  [/情色|[色塞]情|[se]x|[pパ]orn|成人片|黄片| AV|小电影/gi, '色情'],
  // VIP variants (Chinese context)
  [/ⅤⅠＰ|[V魏]IP|[V魏][^i]P$/gi, 'VIP'],
  [/会员|[灰辉辉灰]?会|内部|特殊/gi, '会员'],
  // 外围 variants
  [/外[围囲]|世界杯|nba|nfl|英超|五大联赛/gi, '外围赌球'],
  // 平台 variants
  [/平[台臺]|app|客户端|下载/gi, '平台'],
  // 代理 variants
  [/代[理理?]|代理|招商|诚聘/gi, '代理'],
  // 投资 variants
  [/投[t资]|理[财財]|理[才?]|理$/gi, '投资'],
  // 理财产品
  [/理[财產品]|理$|月化|年化|收益/gi, '理财'],
  // 优惠券
  [/优惠卷|[券卷绗]|打折|[折摺?]/gi, '优惠券'],
  // 色情服务
  [/服务|[服福]务|特殊服务|全套|半套|援助/gi, '色情服务'],
  // 赌博
  [/赌博|[赌][钱貝]|赌[球?]|博彩|体彩|福彩/gi, '赌博'],
  // 色情直播
  [/直播|[色?s]播|[色s]主|[色s]播|[lLi]ive|[Ll]ⅰve/gi, '色情直播'],
  [/主播|房间|破解版|永久版/gi, '色情直播'],
];

// ============================================
// Keyboard Mashing (乱码) Detection
// ============================================

// Chinese character keyboard adjacent detection
const CHINESE_KEYBOARD_ADJACENT: Record<string, string[]> = {
  'q': ['1', 'w', 'a'], 'w': ['q', 'e', 's', '2'], 'e': ['w', 'r', 'd', '3'],
  'r': ['e', 't', 'f', '4'], 't': ['r', 'y', 'g', '5'], 'y': ['t', 'u', 'h', '6'],
  'u': ['y', 'i', 'j', '7'], 'i': ['u', 'o', 'k', '8'], 'o': ['i', 'p', 'l', '9'],
  'p': ['o', '0', [';', 'l']],
  'a': ['q', 'w', 's', 'z'], 's': ['a', 'd', 'x', 'z', 'w', 'e'],
  'd': ['s', 'f', 'c', 'x', 'e', 'r'], 'f': ['d', 'g', 'v', 'c', 'r', 't'],
  'g': ['f', 'h', 'b', 'v', 't', 'y'], 'h': ['g', 'j', 'n', 'b', 'y', 'u'],
  'j': ['h', 'k', 'm', 'n', 'u', 'i'], 'k': ['j', 'l', 'm', 'i', 'o'],
  'l': ['k', 'o', 'p', [';', '[']],
  'z': ['a', 's', 'x'], 'x': ['z', 'c', 'd', 's'], 'c': ['x', 'v', 'f', 'd'],
  'v': ['c', 'b', 'g', 'f'], 'b': ['v', 'n', 'h', 'g'], 'n': ['b', 'm', 'j', 'h'],
  'm': ['n', 'j', 'k']
};

// Detect if a sequence of characters is likely keyboard mashing
function detectKeyboardMashing(text: string): { isGibberish: boolean; score: number } {
  // Only check text that's mostly letters
  const letterOnly = text.replace(/[^a-zA-Z]/g, '');
  if (letterOnly.length < 5) return { isGibberish: false, score: 0 };

  let gibberishScore = 0;
  const lower = text.toLowerCase();

  // Pattern 1: Consecutive same hand fingers (qwerty keyboard)
  const sameHandPatterns = [
    /asdf/g, /sdfg/g, /dfgh/g, /fghj/g, /ghjk/g,
    /qwer/g, /wert/g, /erty/g, /rtyu/g, /tyui/g,
    /zxcv/g, /xcvb/g, /cvbn/g,
    /poiuy/g, /oiuyt/g, /iuytr/g, /uytre/g, /ytrew/g,
    /1234/g, /2345/g, /3456/g, /4567/g, /5678/g, /6789/g, /7890/g,
    /qaz/g, /wsx/g, /edc/g, /rfv/g, /tgb/g, /yhn/g, /ujm/g,
    /1qaz/g, /2wsx/g, /3edc/g, /4rfv/g, /5tgb/g, /6yhn/g, /7ujm/g, /8ikl/g, /9ol/g, /0p;/
  ];

  for (const pattern of sameHandPatterns) {
    const matches = (lower.match(pattern) || []).length;
    if (matches > 0) {
      gibberishScore += matches * 15;
    }
  }

  // Pattern 2: Alternating hands (looks like typing without looking)
  const altHandPatterns = [
    /[qaz]/g, /[wsx]/g, /[edc]/g, // left hand only
    /[poi]/g, /[lki]/g, /[jhu]/g  // right hand only
  ];

  let consecutiveSameHand = 0;
  let consecutiveAltHand = 0;
  let maxConsecutiveSameHand = 0;
  let maxConsecutiveAltHand = 0;

  for (let i = 0; i < lower.length - 2; i++) {
    const c1 = lower[i];
    const c2 = lower[i + 1];

    if ('qazwsxedcrfvtgbyhnujmikolp'.includes(c1) && 'qazwsxedcrfvtgbyhnujmikolp'.includes(c2)) {
      const leftHand = 'qazwsxedcrfvtgbyhn'.split('');
      const isLeft1 = leftHand.includes(c1);
      const isLeft2 = leftHand.includes(c2);

      if (isLeft1 === isLeft2) {
        consecutiveSameHand++;
        consecutiveAltHand = 0;
        maxConsecutiveSameHand = Math.max(maxConsecutiveSameHand, consecutiveSameHand);
      } else {
        consecutiveAltHand++;
        consecutiveSameHand = 0;
        maxConsecutiveAltHand = Math.max(maxConsecutiveAltHand, consecutiveAltHand);
      }
    }
  }

  if (maxConsecutiveSameHand >= 4) {
    gibberishScore += maxConsecutiveSameHand * 10;
  }

  // Pattern 3: High ratio of improbable letter combinations
  const improbableCombos = /[jqxz]{2,}|[xzc]{3,}/gi;
  const improbableMatches = (lower.match(improbableCombos) || []).join('').length;
  if (improbableMatches > 0) {
    gibberishScore += improbableMatches * 5;
  }

  // Pattern 4: Random uppercase/lowercase alternation (like fHyUjKoL)
  const upperLowerAlt = text.match(/[a-z][A-Z][a-z][A-Z]/g);
  if (upperLowerAlt && upperLowerAlt.length >= 2) {
    gibberishScore += upperLowerAlt.length * 10;
  }

  // Pattern 5: Gibberish words (common mashing patterns)
  const gibberishWords = [
    'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl',
    'qwerty', 'werty', 'ertyu', 'ertyui', 'rtyui', 'tyuio', 'yuiop',
    'zxcv', 'xcvb', 'cvbn', 'vbnm', 'bnmk',
    'qazwsx', 'wsxedc', 'edcrfv', 'rfvtgb', 'tgbyhn', 'yhnuj', 'ujmik', 'mikol',
    '1234qwer', 'qwer1234', 'asdf1234', '1234asdf',
    'zxcvbn', 'mnbvcx', 'poiuyt', 'ytrewq',
    'fgthyj', 'hyujmk', 'jukmlo', 'plokmj',
    'nhybv', 'bgtfc', 'cxdzs', 'zasxd', 'esdxc'
  ];

  const lowerNoSpaces = lower.replace(/\s/g, '');
  for (const gib of gibberishWords) {
    if (lowerNoSpaces.includes(gib)) {
      gibberishScore += gib.length * 8;
    }
  }

  // Pattern 6: For Chinese - detect random pinyin-like combinations
  const pinyinLikeGibberish = /[aeiouy]{4,}[bcdfghjklmnpqrstvwxz]{4,}/gi;
  const pinyinMatches = (lower.match(pinyinLikeGibberish) || []).length;
  if (pinyinMatches > 0) {
    gibberishScore += pinyinMatches * 15;
  }

  // Threshold: if score is high relative to text length
  const normalizedScore = (gibberishScore / Math.max(letterOnly.length, 1)) * 100;

  return {
    isGibberish: normalizedScore > 50 || gibberishScore > 40,
    score: Math.min(100, gibberishScore)
  };
}

// ============================================
// Spam keywords that indicate advertisement or low-quality content
// ============================================
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
  '色情', '约炮', '援交', '上门服务', '特殊服务',

  // Additional spam patterns
  '代做', '代写', 'essay', 'paper', 'assignment',
  '外包', '接单', '服务', '帮你', '帮做',
  'vip', '会员', '内部', '特殊渠道',

  // More patterns that indicate low-quality or spam content
  '点击此处', '立即购买', '限时优惠', '全场包邮',
  '联系我', '加我', '私聊', '私信', '企鹅', 'q群',

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
  /^[a-zA-Z]{20,}$/g, // Single long word without spaces (like "asdfghjklqwertyuiop")
  /(.+)\1{3,}/g, // Repeated substrings (like "testtesttest")
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
 * Normalize leet speak to detect substitutions
 */
function normalizeLeetSpeak(text: string): string {
  let normalized = text.toLowerCase();
  // Common leet substitutions
  normalized = normalized
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i');
  return normalized;
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
  const lowerContent = content.toLowerCase();

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

  // 5. Use glin-profanity library for ML-powered profanity detection
  try {
    const glinResult = profanityFilter.checkProfanity(content);
    if (glinResult.containsProfanity) {
      console.log('[内容审核] glin-profanity检测到脏话:', glinResult.profaneWords);
      flags.push('profanity');
      score += 40;
    }
  } catch (err) {
    console.log('[内容审核] glin-profanity检测出错:', err);
  }

  // 6. Check for Leet Speak (字母替换)
  let leetDetected = false;
  for (const [pattern, _] of LEET_PATTERNS) {
    if (pattern.test(content)) {
      console.log('[内容审核] 检测到Leet speak替换:', pattern);
      flags.push('leet_speak');
      score += 35;
      leetDetected = true;
      break;
    }
  }

  // 7. Check normalized leet speak
  if (!leetDetected) {
    const normalized = normalizeLeetSpeak(content);
    for (const [pattern, keyword] of LEET_PATTERNS) {
      const normalizedPattern = new RegExp(pattern.source, 'gi');
      if (normalizedPattern.test(normalized)) {
        console.log('[内容审核] 检测到替换后匹配关键词:', keyword);
        flags.push('leet_speak');
        score += 30;
        leetDetected = true;
        break;
      }
    }
  }

  // 8. Check for Homophonic spam (谐音词)
  let homophonicDetected = false;
  for (const [pattern, keyword] of HOMOPHONIC_PATTERNS) {
    if (pattern.test(content)) {
      console.log('[内容审核] 检测到谐音词替换:', keyword, '匹配:', pattern);
      flags.push('homophonic_spam');
      score += 40;
      homophonicDetected = true;
      break;
    }
  }

  // 9. Check for keyboard mashing / gibberish (乱码)
  const gibberishResult = detectKeyboardMashing(content);
  if (gibberishResult.isGibberish) {
    console.log('[内容审核] 检测到键盘乱码，score:', gibberishResult.score);
    flags.push('gibberish_detected');
    score += Math.min(50, gibberishResult.score);
  }

  // 10. Check for spam keywords (skip if leet or homophonic already detected)
  if (!leetDetected && !homophonicDetected) {
    for (const keyword of SPAM_KEYWORDS) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        console.log('[内容审核] 检测到spam关键词:', keyword);
        flags.push('advertisement');
        score += 30;
        break;
      }
    }
  }

  // 11. Check for profanity
  for (const word of PROFANITY_WORDS) {
    if (lowerContent.includes(word.toLowerCase())) {
      flags.push('profanity');
      score += 25;
      break;
    }
  }

  // 12. Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      flags.push('suspicious_pattern');
      score += 15;
      break;
    }
  }

  // 13. Check for excessive special characters
  // eslint-disable-next-line no-useless-escape
  const specialCharRatio = (content.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length / content.length;
  if (specialCharRatio > 0.3) {
    flags.push('special_characters_abuse');
    score += 15;
  }

  // 14. Check for repeated content (copy-paste detection)
  if (hasRepeatedContent(content)) {
    flags.push('repeated_content');
    score += 20;
  }

  // 15. Check for external links (can be allowed but scores points)
  const linkPattern = /https?:\/\/[^\s]+/g;
  const links = content.match(linkPattern);
  if (links && links.length > 2) {
    flags.push('external_links');
    score += 10;
  }

  console.log('[内容审核] 最终评分 - score:', score, 'flags:', flags);

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
  if (flags.includes('gibberish_detected')) {
    return '检测到乱码或键盘乱敲，请输入有意义的文字';
  }
  if (flags.includes('leet_speak') || flags.includes('homophonic_spam')) {
    return '检测到特殊字符替换的垃圾内容，请勿发布广告或垃圾信息';
  }
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
