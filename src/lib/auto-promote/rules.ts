// 自动推送规则配置

export interface AutoPromoteRule {
  id: string;
  name: string;
  description: string;
  categoryFilter?: string[]; // 限定分类，空或undefined表示所有分类
  trigger: {
    type: 'likes_threshold' | 'comments_threshold' | 'favorites_threshold' | 'combined_threshold';
    thresholds: {
      likes?: number;
      comments?: number;
      favorites?: number;
      views?: number;
    };
    timeWindowMinutes?: number; // 时间窗口（分钟）
  };
  action: {
    type: 'promote_to_category' | 'add_featured' | 'notify_user';
    targetCategory?: string;
    targetSection?: string;
  };
  isActive: boolean;
  priority: number;
}

// 默认推送规则
export const DEFAULT_AUTO_PROMOTE_RULES: AutoPromoteRule[] = [
  {
    id: 'popular-tools',
    name: '热门工具帖',
    description: '24小时内点赞≥20且评论≥10的AI工具帖子推送到精选',
    categoryFilter: ['tools'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 20, comments: 10 },
      timeWindowMinutes: 1440, // 24小时
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 10,
  },
  {
    id: 'hot-discussion',
    name: '热门讨论',
    description: '点赞≥50且评论≥30的讨论帖子置顶',
    categoryFilter: ['discussion'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 50, comments: 30 },
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 8,
  },
  {
    id: 'quality-qa',
    name: '优质问答',
    description: '收藏≥10且评论≥5的问答帖子推送到精选',
    categoryFilter: ['qa'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { favorites: 10, comments: 5 },
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 6,
  },
  {
    id: 'viral-post',
    name: '病毒式传播',
    description: '浏览数≥1000的帖子自动置顶（所有分类）',
    trigger: {
      type: 'combined_threshold',
      thresholds: { views: 1000 },
    },
    action: {
      type: 'add_featured',
      targetSection: 'featured',
    },
    isActive: true,
    priority: 5,
  },
  // ====== 6个新板块的推送规则 ======
  {
    id: 'hot-academic',
    name: '热门学业讨论',
    description: '点赞≥15且评论≥8的学业问题帖子推送到精选',
    categoryFilter: ['academic'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 15, comments: 8 },
      timeWindowMinutes: 2880, // 48小时
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  {
    id: 'hot-life',
    name: '热门生活帖',
    description: '点赞≥15且评论≥8的日常生活帖子推送到精选',
    categoryFilter: ['life'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 15, comments: 8 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  {
    id: 'hot-visa',
    name: '热门签证帖',
    description: '收藏≥8且评论≥5的签证身份帖子推送到精选',
    categoryFilter: ['visa'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { favorites: 8, comments: 5 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  {
    id: 'hot-job',
    name: '热门求职帖',
    description: '点赞≥15且评论≥8的求职就业帖子推送到精选',
    categoryFilter: ['job'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 15, comments: 8 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  {
    id: 'hot-study-life',
    name: '热门学习生活帖',
    description: '点赞≥15且评论≥8的学习生活帖子推送到精选',
    categoryFilter: ['study_life'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 15, comments: 8 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  {
    id: 'hot-job-recruitment',
    name: '热门招聘帖',
    description: '收藏≥10且评论≥5的求职招聘帖子推送到精选',
    categoryFilter: ['job_recruitment'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { favorites: 10, comments: 5 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  // ====== 通用规则：所有分类都适用 ======
  {
    id: 'hot-payment',
    name: '热门支付帖',
    description: '收藏≥8且评论≥5的支付指南帖子推送到精选',
    categoryFilter: ['payment'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { favorites: 8, comments: 5 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  {
    id: 'hot-prompt',
    name: '热门Prompt帖',
    description: '点赞≥15且评论≥8的Prompt帖子推送到精选',
    categoryFilter: ['prompt'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 15, comments: 8 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  {
    id: 'hot-survival',
    name: '热门妙妙贴',
    description: '点赞≥15且评论≥8的妙妙贴帖子推送到精选',
    categoryFilter: ['survival'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 15, comments: 8 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
  {
    id: 'hot-policy',
    name: '热门政策帖',
    description: '收藏≥8且评论≥5的大学政策帖子推送到精选',
    categoryFilter: ['policy'],
    trigger: {
      type: 'combined_threshold',
      thresholds: { favorites: 8, comments: 5 },
      timeWindowMinutes: 2880,
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
];
