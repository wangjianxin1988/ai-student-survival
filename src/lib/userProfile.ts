/**
 * User Profile Module - Points, Levels, Badges, and Social Features
 * Uses localStorage for demo mode persistence
 * Badge system supports real Supabase data with localStorage fallback
 */

import type { DemoUser } from './auth';

// Real user stats from Supabase
export interface RealUserStats {
  points: number;
  totalEarned: number;
  totalSpent: number;
  postsCount: number;
  commentsCount: number;
}

/**
 * Fetch real user stats from Supabase via API
 * Returns null on failure (caller should fall back to localStorage)
 */
export async function fetchUserStats(userId: string): Promise<RealUserStats | null> {
  try {
    const res = await fetch(`/api/community/user/${userId}/stats`);
    const data = await res.json();
    if (data.success && data.data) {
      return {
        points: data.data.points || 0,
        totalEarned: data.data.totalEarned || 0,
        totalSpent: data.data.totalSpent || 0,
        postsCount: data.data.postsCount || 0,
        commentsCount: data.data.commentsCount || 0,
      };
    }
  } catch (e) {
    console.error('[userProfile] Failed to fetch real user stats:', e);
  }
  return null;
}

// Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  badges: string[];
  favoritesCount: number;
  ratingsCount: number;
  reviewsCount: number;
  followees: string[];
  followers: string[];
  joinDate: string;
  lastActive: string;
}

export interface Badge {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  requirement: string;
  condition: (profile: UserProfile, realStats?: RealUserStats | null) => boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  targetType: 'tool' | 'payment_solution' | 'policy' | 'prompt' | 'user';
  targetId: string;
  content: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  likes: number;
  likedBy: string[];
  parentId?: string; // For reply support
  replies?: Comment[];
}

export interface PointsHistoryEntry {
  id: string;
  userId: string;
  action: string;
  points: number;
  createdAt: string;
  description: string;
}

export interface FollowRelation {
  followerId: string;
  followeeId: string;
  createdAt: string;
}

// Storage keys
const USER_PROFILES_KEY = 'demo_user_profiles';
const COMMENTS_KEY = 'demo_comments';
const FOLLOW_KEY = 'demo_follows';
const POINTS_HISTORY_KEY = 'demo_points_history';

// Points action descriptions
export const POINTS_ACTIONS = {
  REGISTER: { action: 'register', description: '注册账号' },
  FAVORITE: { action: 'favorite', description: '收藏内容' },
  RATING: { action: 'rating', description: '评分' },
  REVIEW: { action: 'review', description: '评论' },
  SHARE: { action: 'share', description: '分享' },
  FOLLOW: { action: 'follow', description: '关注用户' },
  RECEIVE_FOLLOW: { action: 'receive_follow', description: '被关注' },
  COMMENT: { action: 'comment', description: '发表评论' },
  RECEIVE_LIKE: { action: 'receive_like', description: '收到点赞' },
} as const;

// Points configuration
export const POINTS_CONFIG = {
  // Points earned from actions
  ACTIONS: {
    REGISTER: 10,
    FAVORITE: 5,
    RATING: 5,
    REVIEW: 10,
    SHARE: 10,
    FOLLOW: 5,
    RECEIVE_FOLLOW: 2,
    COMMENT: 5,
    RECEIVE_LIKE: 2,
  },
  // Level thresholds (cumulative points needed)
  LEVELS: [
    0,      // Lv1
    20,     // Lv2
    50,     // Lv3
    100,    // Lv4
    200,    // Lv5
    500,    // Lv6
    1000,   // Lv7
    2000,   // Lv8
    5000,   // Lv9
    10000,  // Lv10
  ] as const,
};

// Badge definitions
// Conditions prefer real Supabase stats (realStats) when available,
// falling back to localStorage-based profile data for demo mode.
export const BADGES: Badge[] = [
  {
    id: 'newcomer',
    name: 'Newcomer',
    nameZh: '新人报到',
    description: 'Joined the community',
    descriptionZh: '加入社区',
    icon: '🎉',
    requirement: '注册账号',
    condition: (profile) => profile.joinDate !== '',
  },
  {
    id: 'first_favorite',
    name: 'First Favorite',
    nameZh: '初次收藏',
    description: 'Added your first favorite',
    descriptionZh: '添加第一个收藏',
    icon: '❤️',
    requirement: '收藏1个内容',
    condition: (profile) => profile.favoritesCount >= 1,
  },
  {
    id: 'collector',
    name: 'Collector',
    nameZh: '收藏达人',
    description: 'Added 10 favorites',
    descriptionZh: '收藏10个内容',
    icon: '🏆',
    requirement: '收藏10个内容',
    condition: (profile) => profile.favoritesCount >= 10,
  },
  {
    id: 'first_rating',
    name: 'First Rating',
    nameZh: '初次评分',
    description: 'Gave your first rating',
    descriptionZh: '给出第一个评分',
    icon: '⭐',
    requirement: '评分1次',
    condition: (profile) => profile.ratingsCount >= 1,
  },
  {
    id: 'critic',
    name: 'Critic',
    nameZh: '评论家',
    description: 'Gave 10 ratings',
    descriptionZh: '评分10次',
    icon: '🌟',
    requirement: '评分10次',
    condition: (profile) => profile.ratingsCount >= 10,
  },
  {
    id: 'first_review',
    name: 'First Review',
    nameZh: '初次评论',
    description: 'Wrote your first review',
    descriptionZh: '撰写第一条评论',
    icon: '✍️',
    requirement: '评论1次',
    condition: (profile, realStats) => {
      if (realStats) return realStats.commentsCount >= 1;
      return profile.reviewsCount >= 1;
    },
  },
  {
    id: 'first_post',
    name: 'First Post',
    nameZh: '初次发帖',
    description: 'Published your first post',
    descriptionZh: '发布第一篇帖子',
    icon: '📝',
    requirement: '发布1篇帖子',
    condition: (_profile, realStats) => {
      if (realStats) return realStats.postsCount >= 1;
      return false;
    },
  },
  {
    id: 'active_poster',
    name: 'Active Poster',
    nameZh: '活跃发帖',
    description: 'Published 10 posts',
    descriptionZh: '发布10篇帖子',
    icon: '📰',
    requirement: '发布10篇帖子',
    condition: (_profile, realStats) => {
      if (realStats) return realStats.postsCount >= 10;
      return false;
    },
  },
  {
    id: 'commentator',
    name: 'Commentator',
    nameZh: '活跃评论',
    description: 'Left 10 comments',
    descriptionZh: '发表10条评论',
    icon: '💬',
    requirement: '发表10条评论',
    condition: (profile, realStats) => {
      if (realStats) return realStats.commentsCount >= 10;
      return profile.reviewsCount >= 10;
    },
  },
  {
    id: 'influencer',
    name: 'Influencer',
    nameZh: '影响力',
    description: 'Got 10 followers',
    descriptionZh: '获得10个粉丝',
    icon: '🔥',
    requirement: '获得10个粉丝',
    condition: (profile) => profile.followers.length >= 10,
  },
  {
    id: 'social',
    name: 'Social Butterfly',
    nameZh: '社交达人',
    description: 'Followed 10 users',
    descriptionZh: '关注10个用户',
    icon: '🦋',
    requirement: '关注10个用户',
    condition: (profile) => profile.followees.length >= 10,
  },
  {
    id: 'points_100',
    name: 'Point Collector',
    nameZh: '积分收集者',
    description: 'Earned 100 points',
    descriptionZh: '获得100积分',
    icon: '💰',
    requirement: '获得100积分',
    condition: (profile, realStats) => {
      if (realStats) return realStats.points >= 100;
      return profile.points >= 100;
    },
  },
  {
    id: 'points_500',
    name: 'Point Master',
    nameZh: '积分大师',
    description: 'Earned 500 points',
    descriptionZh: '获得500积分',
    icon: '💎',
    requirement: '获得500积分',
    condition: (profile, realStats) => {
      if (realStats) return realStats.points >= 500;
      return profile.points >= 500;
    },
  },
  {
    id: 'Lv5',
    name: 'Level 5',
    nameZh: '5级用户',
    description: 'Reached Level 5',
    descriptionZh: '达到5级',
    icon: '🏅',
    requirement: '达到5级',
    condition: (profile) => profile.level >= 5,
  },
  {
    id: 'Lv10',
    name: 'Level 10',
    nameZh: '10级用户',
    description: 'Reached Level 10 (Max)',
    descriptionZh: '达到10级（满级）',
    icon: '👑',
    requirement: '达到10级',
    condition: (profile) => profile.level >= 10,
  },
];

// Helper functions
function generateId(): string {
  return 'id-' + Math.random().toString(36).substring(2, 15);
}

function getDefaultProfile(user: DemoUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
    points: POINTS_CONFIG.ACTIONS.REGISTER,
    level: 1,
    badges: ['newcomer'],
    favoritesCount: 0,
    ratingsCount: 0,
    reviewsCount: 0,
    followees: [],
    followers: [],
    joinDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
}

// Profile storage functions
function getAllProfiles(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(USER_PROFILES_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveProfiles(profiles: Record<string, UserProfile>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
}

// Calculate level from points
export function calculateLevel(points: number): number {
  const levels = POINTS_CONFIG.LEVELS;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Get points needed for next level
export function getPointsForNextLevel(currentPoints: number): { pointsNeeded: number; nextLevelPoints: number } | null {
  const levels = POINTS_CONFIG.LEVELS;
  const currentLevel = calculateLevel(currentPoints);

  if (currentLevel >= levels.length) {
    return null; // Max level reached
  }

  const nextLevelPoints = levels[currentLevel];
  return {
    pointsNeeded: nextLevelPoints - currentPoints,
    nextLevelPoints,
  };
}

// Calculate progress to next level (0-100)
export function getLevelProgress(currentPoints: number): number {
  const levels = POINTS_CONFIG.LEVELS;
  const currentLevel = calculateLevel(currentPoints);

  if (currentLevel >= levels.length) {
    return 100; // Max level
  }

  const currentLevelPoints = levels[currentLevel - 1];
  const nextLevelPoints = levels[currentLevel];
  const pointsInLevel = currentPoints - currentLevelPoints;
  const pointsNeeded = nextLevelPoints - currentLevelPoints;

  return Math.round((pointsInLevel / pointsNeeded) * 100);
}

// Get or create user profile
export function getUserProfile(userId: string): UserProfile | null {
  const profiles = getAllProfiles();
  return profiles[userId] || null;
}

export function getOrCreateProfile(user: DemoUser): UserProfile {
  const profiles = getAllProfiles();

  if (profiles[user.id]) {
    // Sync avatar from auth user if user has a real avatar (not DiceBear default)
    // This ensures uploaded avatars are reflected in the profile
    if (user.avatar && !profiles[user.id].avatar.startsWith('data:') &&
        profiles[user.id].avatar.includes('dicebear.com')) {
      profiles[user.id].avatar = user.avatar;
    }
    // Update name if changed
    if (user.name && user.name !== profiles[user.id].name) {
      profiles[user.id].name = user.name;
    }
    // Update last active
    profiles[user.id].lastActive = new Date().toISOString();
    saveProfiles(profiles);
    return profiles[user.id];
  }

  // Create new profile
  const newProfile = getDefaultProfile(user);
  profiles[user.id] = newProfile;
  saveProfiles(profiles);
  return newProfile;
}

export function updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
  const profiles = getAllProfiles();

  if (!profiles[userId]) {
    return null;
  }

  profiles[userId] = {
    ...profiles[userId],
    ...updates,
    lastActive: new Date().toISOString(),
  };

  // Recalculate level
  profiles[userId].level = calculateLevel(profiles[userId].points);

  // Update badges
  profiles[userId].badges = BADGES.filter(badge => badge.condition(profiles[userId])).map(b => b.id);

  saveProfiles(profiles);
  return profiles[userId];
}

// Add points to user
export function addPoints(userId: string, points: number, actionType?: string, description?: string): UserProfile | null {
  const profiles = getAllProfiles();

  if (!profiles[userId]) {
    return null;
  }

  profiles[userId].points += points;
  profiles[userId].lastActive = new Date().toISOString();
  profiles[userId].level = calculateLevel(profiles[userId].points);
  profiles[userId].badges = BADGES.filter(badge => badge.condition(profiles[userId])).map(b => b.id);

  saveProfiles(profiles);

  // Record points history
  if (actionType && description) {
    addPointsHistory(userId, points, actionType, description);
  }

  return profiles[userId];
}

// Points history functions
function getAllPointsHistory(): PointsHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(POINTS_HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

function savePointsHistory(history: PointsHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify(history));
}

export function addPointsHistory(userId: string, points: number, action: string, description: string): void {
  const history = getAllPointsHistory();
  const entry: PointsHistoryEntry = {
    id: generateId(),
    userId,
    action,
    points,
    createdAt: new Date().toISOString(),
    description,
  };
  history.unshift(entry); // Add to beginning (most recent first)
  // Keep only last 100 entries
  if (history.length > 100) {
    history.pop();
  }
  savePointsHistory(history);
}

export function getPointsHistory(userId: string, limit = 20): PointsHistoryEntry[] {
  const history = getAllPointsHistory();
  return history
    .filter(h => h.userId === userId)
    .slice(0, limit);
}

// Comment functions
function getAllComments(): Comment[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(COMMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveComments(comments: Comment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getComments(targetType: string, targetId: string): Comment[] {
  const comments = getAllComments();
  const filtered = comments.filter(c => c.targetType === targetType && c.targetId === targetId);

  // Organize comments - top level and replies
  const topLevel = filtered.filter(c => !c.parentId);
  const replies = filtered.filter(c => c.parentId);

  // Attach replies to their parent comments
  topLevel.forEach(comment => {
    comment.replies = replies.filter(r => r.parentId === comment.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  return topLevel.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addComment(
  user: DemoUser,
  targetType: Comment['targetType'],
  targetId: string,
  content: string,
  rating?: number,
  parentId?: string
): Comment {
  const comments = getAllComments();

  const newComment: Comment = {
    id: generateId(),
    userId: user.id,
    userName: user.name,
    userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
    targetType,
    targetId,
    content,
    rating,
    parentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    replies: [],
  };

  comments.push(newComment);
  saveComments(comments);

  // Update user stats (only for top-level comments)
  if (!parentId) {
    const profile = getUserProfile(user.id);
    if (profile) {
      updateProfile(user.id, {
        reviewsCount: profile.reviewsCount + 1,
      });
      addPoints(user.id, POINTS_CONFIG.ACTIONS.REVIEW, 'review', '评论');
    }
  }

  return newComment;
}

export function deleteComment(commentId: string, userId: string): boolean {
  const comments = getAllComments();
  const comment = comments.find(c => c.id === commentId);

  if (!comment || comment.userId !== userId) {
    return false;
  }

  const filtered = comments.filter(c => c.id !== commentId);
  saveComments(filtered);

  // Update user stats
  const profile = getUserProfile(userId);
  if (profile) {
    updateProfile(userId, {
      reviewsCount: Math.max(0, profile.reviewsCount - 1),
    });
  }

  return true;
}

export function likeComment(commentId: string, userId: string): boolean {
  const comments = getAllComments();
  const comment = comments.find(c => c.id === commentId);

  if (!comment) {
    return false;
  }

  if (comment.likedBy.includes(userId)) {
    // Unlike
    comment.likedBy = comment.likedBy.filter(id => id !== userId);
    comment.likes = Math.max(0, comment.likes - 1);
  } else {
    // Like
    comment.likedBy.push(userId);
    comment.likes += 1;

    // Give points to comment author
    if (comment.userId !== userId) {
      addPoints(comment.userId, POINTS_CONFIG.ACTIONS.RECEIVE_LIKE, 'receive_like', '收到点赞');
    }
  }

  comment.updatedAt = new Date().toISOString();
  saveComments(comments);

  return true;
}

// Follow functions
function getAllFollows(): FollowRelation[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(FOLLOW_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveFollows(follows: FollowRelation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(follows));
}

export function isFollowing(followerId: string, followeeId: string): boolean {
  const follows = getAllFollows();
  return follows.some(f => f.followerId === followerId && f.followeeId === followeeId);
}

export function followUser(followerId: string, followeeId: string): boolean {
  if (followerId === followeeId) {
    return false;
  }

  const follows = getAllFollows();

  if (isFollowing(followerId, followeeId)) {
    return false;
  }

  const newFollow: FollowRelation = {
    followerId,
    followeeId,
    createdAt: new Date().toISOString(),
  };

  follows.push(newFollow);
  saveFollows(follows);

  // Update both profiles
  addPoints(followerId, POINTS_CONFIG.ACTIONS.FOLLOW, 'follow', '关注用户');
  addPoints(followeeId, POINTS_CONFIG.ACTIONS.RECEIVE_FOLLOW, 'receive_follow', '被关注');

  // Update followee's followers count in profile
  const followeeProfile = getUserProfile(followeeId);
  if (followeeProfile) {
    updateProfile(followeeId, {
      followers: [...followeeProfile.followers, followerId],
    });
  }

  // Update follower's following count in profile
  const followerProfile = getUserProfile(followerId);
  if (followerProfile) {
    updateProfile(followerId, {
      followees: [...followerProfile.followees, followeeId],
    });
  }

  return true;
}

export function unfollowUser(followerId: string, followeeId: string): boolean {
  const follows = getAllFollows();
  const filtered = follows.filter(f => !(f.followerId === followerId && f.followeeId === followeeId));

  if (filtered.length === follows.length) {
    return false;
  }

  saveFollows(filtered);

  // Update profiles
  const followeeProfile = getUserProfile(followeeId);
  if (followeeProfile) {
    updateProfile(followeeId, {
      followers: followeeProfile.followers.filter(id => id !== followerId),
    });
  }

  const followerProfile = getUserProfile(followerId);
  if (followerProfile) {
    updateProfile(followerId, {
      followees: followerProfile.followees.filter(id => id !== followeeId),
    });
  }

  return true;
}

export function getFollowers(userId: string): string[] {
  const follows = getAllFollows();
  return follows.filter(f => f.followeeId === userId).map(f => f.followerId);
}

export function getFollowing(userId: string): string[] {
  const follows = getAllFollows();
  return follows.filter(f => f.followerId === userId).map(f => f.followeeId);
}

// Leaderboard functions
export function getLeaderboard(type: 'total' | 'weekly' | 'monthly' = 'total', limit = 10): UserProfile[] {
  const profiles = getAllProfiles();
  const profileList = Object.values(profiles);

  // Sort by points
  profileList.sort((a, b) => b.points - a.points);

  // For weekly/monthly, we would need to track historical data
  // For now, just return top by total points
  return profileList.slice(0, limit);
}

// Get user's rank
export function getUserRank(userId: string): number {
  const profiles = getAllProfiles();
  const profileList = Object.values(profiles);

  profileList.sort((a, b) => b.points - a.points);

  const index = profileList.findIndex(p => p.id === userId);
  return index >= 0 ? index + 1 : -1;
}

// Record favorite action
export function recordFavorite(userId: string): void {
  const profile = getUserProfile(userId);
  if (profile) {
    updateProfile(userId, {
      favoritesCount: profile.favoritesCount + 1,
    });
    addPoints(userId, POINTS_CONFIG.ACTIONS.FAVORITE, 'favorite', '收藏内容');
  }
}

export function recordUnfavorite(userId: string): void {
  const profile = getUserProfile(userId);
  if (profile) {
    updateProfile(userId, {
      favoritesCount: Math.max(0, profile.favoritesCount - 1),
    });
  }
}

// Record rating action
export function recordRating(userId: string): void {
  const profile = getUserProfile(userId);
  if (profile) {
    updateProfile(userId, {
      ratingsCount: profile.ratingsCount + 1,
    });
    addPoints(userId, POINTS_CONFIG.ACTIONS.RATING, 'rating', '评分');
  }
}

// Get badge by ID
export function getBadgeById(badgeId: string): Badge | undefined {
  return BADGES.find(b => b.id === badgeId);
}

// Get all badges with earned status (supports real Supabase stats)
export function getBadgesWithStatus(profile: UserProfile, realStats?: RealUserStats | null): { badge: Badge; earned: boolean }[] {
  return BADGES.map(badge => ({
    badge,
    earned: badge.condition(profile, realStats),
  }));
}

// User API for favorites/ratings tracking
export const userStatsApi = {
  recordFavorite(userId: string) {
    recordFavorite(userId);
  },

  recordUnfavorite(userId: string) {
    recordUnfavorite(userId);
  },

  recordRating(userId: string) {
    recordRating(userId);
  },

  getProfile(userId: string): UserProfile | null {
    return getUserProfile(userId);
  },

  getOrCreateProfile(user: DemoUser): UserProfile {
    return getOrCreateProfile(user);
  },

  getComments(targetType: string, targetId: string): Comment[] {
    return getComments(targetType, targetId);
  },

  deleteComment(commentId: string, userId: string): boolean {
    return deleteComment(commentId, userId);
  },

  likeComment(commentId: string, userId: string): boolean {
    return likeComment(commentId, userId);
  },

  isFollowing(followerId: string, followeeId: string): boolean {
    return isFollowing(followerId, followeeId);
  },

  followUser(followerId: string, followeeId: string): boolean {
    return followUser(followerId, followeeId);
  },

  unfollowUser(followerId: string, followeeId: string): boolean {
    return unfollowUser(followerId, followeeId);
  },

  getFollowers(userId: string): string[] {
    return getFollowers(userId);
  },

  getFollowing(userId: string): string[] {
    return getFollowing(userId);
  },

  getLeaderboard(type?: 'total' | 'weekly' | 'monthly', limit?: number): UserProfile[] {
    return getLeaderboard(type, limit);
  },

  getUserRank(userId: string): number {
    return getUserRank(userId);
  },

  calculateLevel(points: number): number {
    return calculateLevel(points);
  },

  getLevelProgress(points: number): number {
    return getLevelProgress(points);
  },

  getPointsForNextLevel(currentPoints: number): { pointsNeeded: number; nextLevelPoints: number } | null {
    return getPointsForNextLevel(currentPoints);
  },

  getBadgeById(badgeId: string): Badge | undefined {
    return getBadgeById(badgeId);
  },

  getBadgesWithStatus(profile: UserProfile, realStats?: RealUserStats | null): { badge: Badge; earned: boolean }[] {
    return getBadgesWithStatus(profile, realStats);
  },

  getPointsHistory(userId: string, limit?: number): PointsHistoryEntry[] {
    return getPointsHistory(userId, limit);
  },

  addComment(user: DemoUser, targetType: Comment['targetType'], targetId: string, content: string, rating?: number, parentId?: string): Comment {
    return addComment(user, targetType, targetId, content, rating, parentId);
  },
};

export default userStatsApi;
