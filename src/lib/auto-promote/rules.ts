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
    description: '分享数≥100的帖子自动置顶',
    trigger: {
      type: 'combined_threshold',
      thresholds: { views: 1000 }, // 简化处理，实际应该追踪分享数
    },
    action: {
      type: 'add_featured',
      targetSection: 'featured',
    },
    isActive: true,
    priority: 5,
  },
];
