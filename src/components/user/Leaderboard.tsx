import React, { useState, useEffect, useCallback } from 'react';
import FollowButton from './FollowButton';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  totalEarned: number;
  updatedAt: string;
}

interface LeaderboardProps {
  locale?: 'zh' | 'en';
  type?: 'total' | 'weekly' | 'monthly';
  limit?: number;
  currentUserId?: string;
}

const translations = {
  zh: {
    title: '排行榜',
    total: '总榜',
    weekly: '周榜',
    monthly: '月榜',
    points: '积分',
    level: '等级',
    noData: '暂无数据',
  },
  en: {
    title: 'Leaderboard',
    total: 'Total',
    weekly: 'Weekly',
    monthly: 'Monthly',
    points: 'Points',
    level: 'Level',
    noData: 'No data yet',
  },
};

const levelColors = [
  'bg-gray-400',
  'bg-green-400',
  'bg-blue-400',
  'bg-purple-400',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-red-400',
  'bg-pink-400',
  'bg-indigo-400',
  'bg-yellow-300',
];

const levelGradients = [
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

// Calculate level from points (same formula as userProfile.ts)
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

export default function Leaderboard({
  locale = 'zh',
  type = 'total',
  limit = 10,
  currentUserId,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'total' | 'weekly' | 'monthly'>(type);
  const t = translations[locale];

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/leaderboard?limit=${limit}&period=${activeTab}`);
      const data = await res.json();
      if (data.success && data.data) {
        setLeaderboard(data.data);
      } else {
        setLeaderboard([]);
      }
    } catch (e) {
      console.error('[Leaderboard] Failed to load:', e);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-200 to-yellow-300 border-yellow-400';
    if (rank === 2) return 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-400';
    if (rank === 3) return 'bg-gradient-to-r from-orange-200 to-orange-300 border-orange-400';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-24" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['total', 'weekly', 'monthly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t.noData}
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry) => {
            const rank = entry.rank;
            const isCurrentUser = currentUserId === entry.userId;
            const level = getLevelFromPoints(entry.points);

            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isCurrentUser ? 'ring-2 ring-primary-500' : ''
                } ${getRankStyle(rank)}`}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  {rank <= 3 ? (
                    <span className="text-2xl">{getRankIcon(rank)}</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-500">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <a href={`/user/${entry.userId}`} onClick={(e) => e.stopPropagation()}>
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white hover:ring-2 hover:ring-primary-300 cursor-pointer transition-all"
                    title={`查看 ${entry.name} 的主页`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId}`;
                    }}
                  />
                </a>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-gray-900 truncate ${isCurrentUser ? 'text-primary-600' : ''}`}>
                      {entry.name}
                      {isCurrentUser && ' (你)'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${levelColors[level - 1]}`}>
                      Lv{level}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.points} {t.points}
                  </div>
                </div>

                {/* Follow Button (only show if not current user) */}
                {!isCurrentUser && currentUserId && (
                  <FollowButton
                    targetUserId={entry.userId}
                    locale={locale}
                    size="sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface UserRankCardProps {
  userId: string;
  locale?: 'zh' | 'en';
}

export function UserRankCard({ userId, locale = 'zh' }: UserRankCardProps) {
  const [rank, setRank] = useState<number | null>(null);
  const [stats, setStats] = useState<{ name: string; avatar: string; points: number; level: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[locale];

  useEffect(() => {
    async function load() {
      try {
        // Fetch user stats and leaderboard in parallel
        const [statsRes, leaderboardRes] = await Promise.all([
          fetch(`/api/community/user/${userId}/stats`),
          fetch('/api/community/leaderboard?limit=100'),
        ]);

        const statsData = await statsRes.json();
        const leaderboardData = await leaderboardRes.json();

        if (statsData.success && statsData.data) {
          const level = getLevelFromPoints(statsData.data.points);
          setStats({
            name: statsData.data.name,
            avatar: statsData.data.avatar,
            points: statsData.data.points,
            level,
          });
        }

        if (leaderboardData.success && leaderboardData.data) {
          const userRank = leaderboardData.data.findIndex(
            (e: LeaderboardEntry) => e.userId === userId
          );
          setRank(userRank >= 0 ? userRank + 1 : null);
        }
      } catch (e) {
        console.error('[UserRankCard] Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6">
      <h3 className="text-sm font-medium text-primary-600 mb-2">
        {locale === 'zh' ? '我的排名' : 'My Rank'}
      </h3>
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${levelGradients[stats.level - 1]} flex items-center justify-center text-white text-2xl font-bold`}>
          #{rank || '-'}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{stats.name}</div>
          <div className="text-gray-600">
            {stats.points} {t.points} · {t.level} {stats.level}
          </div>
        </div>
      </div>
    </div>
  );
}
