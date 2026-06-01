// 积分配置

export const POINTS_SHOP_PACKAGES = [
  {
    id: 'pkg_basic',
    name: '基础版',
    pointsAmount: 1200,
    priceAmount: 100,
    bonusPoints: 0,
    label: '1,200积分',
    description: '适合偶尔使用',
  },
  {
    id: 'pkg_standard',
    name: '标准版',
    pointsAmount: 6500,
    priceAmount: 500,
    bonusPoints: 500,
    label: '6,000+500积分',
    description: '推荐大多数用户',
  },
  {
    id: 'pkg_premium',
    name: '高级版',
    pointsAmount: 15000,
    priceAmount: 1000,
    bonusPoints: 3000,
    label: '12,000+3,000积分',
    description: '适合重度用户',
  },
];

export const POINTS_CONFIG = {
  // 积分动作配置
  ACTIONS: {
    // 获得积分
    REGISTER: 10,              // 注册
    FAVORITE: 5,              // 收藏
    RATING: 5,                // 评分
    REVIEW: 10,                // 评论
    SHARE: 10,                 // 分享
    FOLLOW: 5,                 // 关注
    RECEIVE_FOLLOW: 2,        // 被关注
    COMMENT: 5,                // 发表评论
    RECEIVE_LIKE: 2,          // 被点赞

    // 新增：社区内容发布
    POST_PUBLISHED: 15,       // 发布帖子
    RECEIVE_FAVORITE: 3,      // 被收藏
    RECEIVE_COMMENT: 3,       // 被评论
    RECEIVE_SHARE: 2,         // 被分享
    SPONSOR_100: 1200,        // 赞助100元获得1200积分（1:12）
    SPONSOR_500: 6500,        // 赞助500元获得6500积分（1:13）
    SPONSOR_1000: 15000,      // 赞助1000元获得15000积分（1:15）

    // 消耗积分
    POST_PINNED: -50,          // 帖子置顶
    DIRECT_PUBLISH: -50,       // 直接发布到目标板块
    HOT_BOOST: -20,            // 24小时热门加速
    GIFT_SENT: -10,           // 发送礼物
  },

  // 等级配置 (积分阈值)
  LEVELS: [0, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],

  // 积分商店套餐
  SHOP_PACKAGES: [
    {
      id: 'pkg_basic',
      name: '基础版',
      pointsAmount: 1200,
      priceAmount: 100,
      bonusPoints: 0,
      label: '1,200积分',
      description: '适合偶尔使用',
    },
    {
      id: 'pkg_standard',
      name: '标准版',
      pointsAmount: 6500,
      priceAmount: 500,
      bonusPoints: 500,
      label: '6,000+500积分',
      description: '推荐大多数用户',
    },
    {
      id: 'pkg_premium',
      name: '高级版',
      pointsAmount: 15000,
      priceAmount: 1000,
      bonusPoints: 3000,
      label: '12,000+3,000积分',
      description: '适合重度用户',
    },
  ],
} as const;

// 积分类型
export type PointsActionType =
  | 'register'
  | 'favorite'
  | 'rating'
  | 'review'
  | 'share'
  | 'follow'
  | 'receive_follow'
  | 'comment'
  | 'receive_like'
  | 'earn_post'
  | 'receive_favorite'
  | 'receive_comment'
  | 'receive_share'
  | 'sponsor'
  | 'spend_exchange'
  | 'spend_featured'
  | 'spend_gift';

// 获取等级信息
export function getLevelInfo(balance: number): {
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progress: number;
} {
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