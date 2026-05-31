// 社区帖子相关类型定义

export type CommunityCategory =
  | 'tools'      // AI工具
  | 'payment'    // 支付指南
  | 'policy'     // 大学政策
  | 'prompt'     // Prompt
  | 'survival'   // 妙妙贴
  | 'academic'   // 学业问题
  | 'life'      // 日常生活
  | 'visa'      // 签证身份
  | 'job'       // 求职就业
  | 'study_life' // 学习生活
  | 'job_recruitment' // 求职招聘
  | 'discussion' // 讨论
  | 'qa';        // 问答

// AI工具板块扩展字段
export interface ToolsPostMeta {
  name: string;
  slug: string;
  description: string;
  subcategory: string;
  pricing: 'free' | 'freemium' | 'paid';
  priceMonthly?: number;
  priceYearly?: number;
  url: string;
  features: string[];
  alternatives: string[];
  howToUse: Array<{ step: number; title: string; description: string }>;
  useCases: Array<{ title: string; description: string }>;
  tips: string[];
}

// 支付指南板块扩展字段
export interface PaymentPostMeta {
  paymentCategory: 'virtual_card' | 'gift_card' | 'regional_pricing' | 'troubleshooting';
  difficulty: 'easy' | 'medium' | 'hard';
  reliability: 'high' | 'medium' | 'low';
  toolIds: string[];
  content: string;
}

// 大学政策板块扩展字段
export interface PolicyPostMeta {
  universityName: string;
  universitySlug: string;
  country: string;
  overallPolicy: 'allowed' | 'restricted' | 'prohibited' | 'case_by_case';
  teachingPolicy: string;
  assignmentPolicy: string;
  groupProjectPolicy: string;
  examPolicy: string;
  thesisPolicy: string;
  researchPolicy: string;
  codingPolicy: string;
  allowedTools: string[];
  restrictedTools: string[];
  prohibitedTools: string[];
}

// Prompt板块扩展字段
export interface PromptPostMeta {
  promptCategory: 'application' | 'thesis' | 'job' | 'daily' | 'research';
  toolId?: string;
  content: string;
  howToUse?: string;
}

// 妙妙贴板块扩展字段
export interface SurvivalPostMeta {
  survivalCategory: 'scam' | 'culture' | 'safety' | 'legal' | 'other';
  country?: string;
  universityId?: string;
  content: string;
  contentZh?: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  excerpt?: string;
  category: CommunityCategory;
  tags: string[];
  images: string[];

  // 各板块扩展字段
  meta?: ToolsPostMeta | PaymentPostMeta | PolicyPostMeta | PromptPostMeta | SurvivalPostMeta;

  // 用户交互状态
  isLiked?: boolean;
  isFavorited?: boolean;

  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  favoritesCount: number;

  isPinned: boolean;
  isLocked: boolean;
  autoPromoted: boolean;
  autoPromoteReason?: string;
  directPublishRequested?: boolean;
  directPublishCost?: number;
  isHotBoost?: boolean;
  hotBoostExpiresAt?: string;
  promoteSource?: 'auto' | 'points';
  promoteScore?: number;
  promotedToCategory?: string;

  // AI摘要（仅已关闭帖子显示）
  aiSummary?: string;

  status: 'draft' | 'published' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface PostCommentAuthor {
  id?: string;
  name?: string;
  avatar?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  likedBy: string[];
  parentId?: string;
  replies?: PostComment[];
  createdAt: string;
  author?: PostCommentAuthor; // From API response
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface PostFavorite {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  category: CommunityCategory;
  tags?: string[];
  images?: string[];
  status?: 'draft' | 'published';
  // 各板块扩展字段
  meta?: ToolsPostMeta | PaymentPostMeta | PolicyPostMeta | PromptPostMeta | SurvivalPostMeta;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  category?: CommunityCategory;
  tags?: string[];
  images?: string[];
  status?: 'draft' | 'published' | 'deleted';
  meta?: ToolsPostMeta | PaymentPostMeta | PolicyPostMeta | PromptPostMeta | SurvivalPostMeta;
}

// 板块映射配置
export const CATEGORY_LABELS: Record<CommunityCategory, { zh: string; en: string }> = {
  tools: { zh: 'AI工具', en: 'AI Tools' },
  payment: { zh: '支付指南', en: 'Payment' },
  policy: { zh: '大学政策', en: 'Policies' },
  prompt: { zh: 'Prompt', en: 'Prompts' },
  survival: { zh: '妙妙贴', en: 'Survival' },
  academic: { zh: '学业问题', en: 'Academic' },
  life: { zh: '日常生活', en: 'Life' },
  visa: { zh: '签证身份', en: 'Visa' },
  job: { zh: '求职就业', en: 'Job' },
  study_life: { zh: '学习生活', en: 'Study Life' },
  job_recruitment: { zh: '求职招聘', en: 'Job Recruitment' },
  discussion: { zh: '讨论', en: 'Discussion' },
  qa: { zh: '问答', en: 'Q&A' },
};

export const CATEGORY_CONFIG: Record<CommunityCategory, {
  path: string;
  requireMeta: boolean;
  promotionThreshold: { likes: number; comments: number; favorites: number };
}> = {
  tools: { path: '/tools', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  payment: { path: '/payment', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  policy: { path: '/policies', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  prompt: { path: '/prompts', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  survival: { path: '/survival', requireMeta: true, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  academic: { path: '/questions', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  life: { path: '/questions', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  visa: { path: '/questions', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  job: { path: '/questions', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  study_life: { path: '/questions', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  job_recruitment: { path: '/questions', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  discussion: { path: '/community', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
  qa: { path: '/community', requireMeta: false, promotionThreshold: { likes: 5, comments: 3, favorites: 2 } },
};

// 板块对应的网站板块路径
export const CATEGORY_PATHS: Record<CommunityCategory, string> = {
  tools: '/tools',
  payment: '/payment',
  policy: '/policies',
  prompt: '/prompts',
  survival: '/survival',
  academic: '/questions',
  life: '/questions',
  visa: '/questions',
  job: '/questions',
  study_life: '/questions',
  job_recruitment: '/questions',
  discussion: '/community',
  qa: '/community',
};

export interface PromotionCheckResult {
  canPromote: boolean;
  score: number;
  threshold: number;
  details: {
    likes: number;
    comments: number;
    favorites: number;
    postAgeHours: number;
  };
}

export function calculatePromotionScore(post: CommunityPost): number {
  return post.likesCount * 1 + post.commentsCount * 2 + post.favoritesCount * 3;
}

export function checkPromotionEligibility(post: CommunityPost): PromotionCheckResult {
  const score = calculatePromotionScore(post);
  const threshold = 10;
  const postAgeHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);

  return {
    canPromote: score >= threshold && postAgeHours <= 72,
    score,
    threshold,
    details: {
      likes: post.likesCount,
      comments: post.commentsCount,
      favorites: post.favoritesCount,
      postAgeHours,
    },
  };
}
