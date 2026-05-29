// 自动推送规则配置

export interface AutoPromoteRule {
  id: string;
  name: string;
  description: string;
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
    description: '24小时内点赞≥20且评论≥10的帖子推送到AI工具板块',
    trigger: {
      type: 'combined_threshold',
      thresholds: { likes: 20, comments: 10 },
      timeWindowMinutes: 1440, // 24小时
    },
    action: {
      type: 'promote_to_category',
      targetCategory: 'tools',
    },
    isActive: true,
    priority: 10,
  },
  {
    id: 'hot-discussion',
    name: '热门讨论',
    description: '点赞≥50且评论≥30的帖子推送到讨论区精选',
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
    description: '收藏≥10且评论≥5的帖子推送到问答板块',
    trigger: {
      type: 'combined_threshold',
      thresholds: { favorites: 10, comments: 5 },
    },
    action: {
      type: 'promote_to_category',
      targetCategory: 'qa',
    },
    isActive: true,
    priority: 6,
  },
  {
    id: 'viral-post',
    name: '病毒式传播',
    description: '浏览数≥1000的帖子自动置顶',
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
  // ====== 新增：6个新板块的推送规则 ======
  {
    id: 'hot-academic',
    name: '热门学业讨论',
    description: '点赞≥15且评论≥8的学业问题帖子推送到学业问题板块精选',
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
    description: '点赞≥15且评论≥8的日常生活帖子推送到日常生活板块精选',
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
    id: 'hot-visa',
    name: '热门签证帖',
    description: '收藏≥8且评论≥5的签证身份帖子推送到签证身份板块精选',
    trigger: {
      type: 'combined_threshold',
      thresholds: { favorites: 8, comments: 5 },
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
    id: 'hot-job',
    name: '热门求职帖',
    description: '点赞≥15且评论≥8的求职就业帖子推送到求职就业板块精选',
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
    id: 'hot-study-life',
    name: '热门学习生活帖',
    description: '点赞≥15且评论≥8的学习生活帖子推送到学习生活板块精选',
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
    id: 'hot-job-recruitment',
    name: '热门招聘帖',
    description: '收藏≥10且评论≥5的求职招聘帖子推送到求职招聘板块精选',
    trigger: {
      type: 'combined_threshold',
      thresholds: { favorites: 10, comments: 5 },
      timeWindowMinutes: 2880, // 48小时
    },
    action: {
      type: 'add_featured',
      targetSection: 'hot-topics',
    },
    isActive: true,
    priority: 7,
  },
];
