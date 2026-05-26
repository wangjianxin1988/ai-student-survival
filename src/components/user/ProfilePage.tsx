import React, { useState, useEffect, useCallback } from 'react';
import { initAuth, onAuthStateChange, type DemoUser } from '@/lib/auth';
import { getAuthHeaders } from '@/lib/auth';
import { getBadgesWithStatus, getLevelProgress } from '@/lib/userProfile';
import type { UserProfile } from '@/lib/userProfile';
import { getAuthLoginHref } from '@/lib/i18n';
import UserProfileCard from './UserProfileCard';
import { BadgeGrid } from './Badge';
import Leaderboard, { UserRankCard } from './Leaderboard';
import FavoritesList from './FavoritesList';
import OffersList from './OffersList';
import RatingsList from './RatingsList';
import EnhancedSettings from './EnhancedSettings';
import { FollowingListTab } from './FollowingListTab';

interface ProfilePageProps {
  locale?: 'zh' | 'en';
}

// Fetched from Supabase
interface SupabaseUserStats {
  userId: string;
  name: string;
  avatar: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
  postsCount: number;
  commentsCount: number;
}

const translations = {
  zh: {
    title: '个人中心',
    profile: '个人信息',
    badges: '徽章成就',
    stats: '数据统计',
    favorites: '收藏',
    ratings: '评分',
    reviews: '评论',
    followers: '粉丝',
    following: '关注',
    followingList: '关注列表',
    points: '积分',
    level: '等级',
    rank: '排名',
    leaderboard: '排行榜',
    pointsHistory: '积分历史',
    noData: '暂无数据',
    loginRequired: '请先登录',
    loginRedirect: '跳转中...',
    postsCount: '帖子',
    commentsCount: '评论',
  },
  en: {
    title: 'Profile',
    profile: 'Profile',
    badges: 'Badges',
    stats: 'Statistics',
    favorites: 'Favorites',
    ratings: 'Ratings',
    reviews: 'Reviews',
    followers: 'Followers',
    following: 'Following',
    followingList: 'Following List',
    points: 'Points',
    level: 'Level',
    rank: 'Rank',
    leaderboard: 'Leaderboard',
    pointsHistory: 'Points History',
    noData: 'No data',
    loginRequired: 'Please login first',
    loginRedirect: 'Redirecting...',
    postsCount: 'Posts',
    commentsCount: 'Comments',
  },
};

const levelColors = [
  'from-gray-400 to-gray-500',
  'from-green-400 to-green-500',
  'from-blue-400 to-blue-500',
  'from-purple-400 to-purple-500',
  'from-yellow-400 to-yellow-500',
  'from-orange-400 to-orange-500',
  'from-red-400 to-red-500',
  'from-pink-400 to-pink-500',
  'from-indigo-400 to-indigo-500',
  'from-yellow-300 to-yellow-500',
];

function getLevelFromPoints(points: number): number {
  if (points >= 10000) return 10;
  if (points >= 5000) return 9;
  if (points >= 2000) return 8;
  if (points >= 1000) return 7;
  if (points >= 500) return 6;
  if (points >= 200) return 5;
  if (points >= 100) return 4;
  if (points >= 50) return 3;
  if (points >= 20) return 2;
  return 1;
}

export default function ProfilePage({ locale = 'zh' }: ProfilePageProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  // Use Supabase data for points/level, localStorage for badges
  const [userStats, setUserStats] = useState<SupabaseUserStats | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'favorites' | 'offers' | 'ratings' | 'settings' | 'badges' | 'leaderboard' | 'history' | 'following'>('overview');
  const [pointsHistory, setPointsHistory] = useState<Array<{ id: string; amount: number; type: string; description: string; referenceId?: string; createdAt: string }>>([]);
  const t = translations[locale];

  // Build a merged profile for badge system
  const mergedProfile: UserProfile | null = localProfile && userStats
    ? { ...localProfile, points: userStats.points, level: getLevelFromPoints(userStats.points) }
    : localProfile;

  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user stats and points history from Supabase in parallel
      const [statsRes, historyRes, leaderboardRes] = await Promise.all([
        fetch(`/api/community/user/${user.id}/stats`),
        fetch('/api/community/points-history?limit=50', { headers: await getAuthHeaders() }),
        fetch('/api/community/leaderboard?limit=100'),
      ]);

      const statsData = await statsRes.json();
      if (statsData.success && statsData.data) {
        setUserStats(statsData.data);
      }

      const historyData = await historyRes.json();
      if (historyData.success && historyData.data) {
        setPointsHistory(historyData.data);
      }

      const leaderboardData = await leaderboardRes.json();
      if (leaderboardData.success && leaderboardData.data) {
        const rankIdx = leaderboardData.data.findIndex(
          (e: { userId: string }) => e.userId === user.id
        );
        setUserRank(rankIdx >= 0 ? rankIdx + 1 : null);
      }
    } catch (e) {
      console.error('[ProfilePage] Failed to load user data:', e);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const currentUser = await initAuth();
      if (cancelled) return;

      setUser(currentUser);

      if (currentUser) {
        // Load localStorage profile for badges and demo stats
        const { userStatsApi } = await import('@/lib/userProfile');
        const profile = userStatsApi.getOrCreateProfile(currentUser);
        if (!cancelled) {
          setLocalProfile(profile);
          await loadUserData();
        }
      }
    }

    loadUser();

    const unsubscribe = onAuthStateChange(async (newUser) => {
      if (cancelled) return;
      setUser(newUser);

      if (newUser) {
        const { userStatsApi } = await import('@/lib/userProfile');
        const profile = userStatsApi.getOrCreateProfile(newUser);
        if (!cancelled) {
          setLocalProfile(profile);
          await loadUserData();
        }
      } else {
        setLocalProfile(null);
        setUserStats(null);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [loadUserData]);

  useEffect(() => {
    if (user !== null || localProfile !== null) {
      setLoading(false);
    } else if (user === null) {
      setLoading(false);
    }
  }, [user, localProfile]);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getAuthLoginHref();
    }
  }, [loading, user]);

  if (loading || !user || !mergedProfile) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const badgesWithStatus = getBadgesWithStatus(mergedProfile);
  const earnedBadges = badgesWithStatus.filter(b => b.earned);
  const progress = getLevelProgress(mergedProfile.points);
  const level = getLevelFromPoints(mergedProfile.points);

  const tabs = [
    { id: 'overview', label: locale === 'zh' ? '概览' : 'Overview' },
    { id: 'favorites', label: t.favorites },
    { id: 'offers', label: locale === 'zh' ? 'Offer' : 'Offers' },
    { id: 'ratings', label: t.ratings },
    { id: 'following', label: locale === 'zh' ? '关注' : 'Following' },
    { id: 'settings', label: locale === 'zh' ? '设置' : 'Settings' },
    { id: 'badges', label: locale === 'zh' ? '徽章' : 'Badges' },
    { id: 'leaderboard', label: t.leaderboard },
    { id: 'history', label: t.pointsHistory },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${levelColors[level - 1]} text-white font-bold text-lg shadow-md`}>
            Lv{level}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'favorites' && (
          <FavoritesList locale={locale} />
        )}

        {activeTab === 'offers' && (
          <OffersList locale={locale} />
        )}

        {activeTab === 'ratings' && (
          <RatingsList locale={locale} />
        )}

        {activeTab === 'following' && (
          <FollowingListTab locale={locale} userId={user.id} />
        )}

        {activeTab === 'settings' && (
          <EnhancedSettings locale={locale} />
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="md:col-span-2">
              <UserProfileCard locale={locale} size="lg" />
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.stats}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.points}</span>
                    <span className="font-bold text-gray-900">
                      {userStats?.points ?? mergedProfile.points}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.level}</span>
                    <span className="font-bold text-gray-900">Lv{level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t.rank}</span>
                    <span className="font-bold text-primary-600">
                      {userRank !== null ? `#${userRank}` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.stats}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{mergedProfile.favoritesCount}</div>
                    <div className="text-sm text-gray-500">{t.favorites}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{mergedProfile.ratingsCount}</div>
                    <div className="text-sm text-gray-500">{t.ratings}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{mergedProfile.reviewsCount}</div>
                    <div className="text-sm text-gray-500">{t.reviews}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{earnedBadges.length}</div>
                    <div className="text-sm text-gray-500">{locale === 'zh' ? '徽章' : 'Badges'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {locale === 'zh' ? '我的徽章' : 'My Badges'} ({earnedBadges.length}/{badgesWithStatus.length})
            </h2>
            <BadgeGrid profile={mergedProfile} size="lg" locale={locale} showLocked={true} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <UserRankCard userId={user.id} locale={locale} />
            <Leaderboard locale={locale} currentUserId={user.id} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {t.pointsHistory}
            </h2>

            {/* Level Progress Card */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-primary-600 mb-1">{locale === 'zh' ? '当前等级' : 'Current Level'}</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold bg-gradient-to-r ${levelColors[level - 1]} bg-clip-text text-transparent`}>
                      Lv{level}
                    </span>
                    <span className="text-gray-500">{mergedProfile.points} {t.points}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">{locale === 'zh' ? '升级进度' : 'Progress'}</p>
                  <span className="text-2xl font-bold text-primary-600">{progress}%</span>
                </div>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${levelColors[level - 1]} transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Points History List */}
            {pointsHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {t.noData}
              </div>
            ) : (
              <div className="space-y-3">
                {pointsHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        entry.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
