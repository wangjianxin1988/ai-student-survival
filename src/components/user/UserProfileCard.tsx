import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';
import {
  userStatsApi,
  getLevelProgress,
  getPointsForNextLevel,
  getBadgesWithStatus,
  type UserProfile,
} from '@/lib/userProfile';

interface UserProfileCardProps {
  locale?: 'zh' | 'en';
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const translations = {
  zh: {
    level: '等级',
    points: '积分',
    favorites: '收藏',
    ratings: '评分',
    reviews: '评论',
    followers: '粉丝',
    following: '关注',
    rank: '排名',
    nextLevel: '下一级',
    pointsNeeded: '积分',
    badges: '徽章',
    joinDate: '加入于',
  },
  en: {
    level: 'Level',
    points: 'Points',
    favorites: 'Favorites',
    ratings: 'Ratings',
    reviews: 'Reviews',
    followers: 'Followers',
    following: 'Following',
    rank: 'Rank',
    nextLevel: 'Next Level',
    pointsNeeded: 'points',
    badges: 'Badges',
    joinDate: 'Joined',
  },
};

const levelColors = [
  'from-gray-400 to-gray-500',   // Lv1
  'from-green-400 to-green-500', // Lv2
  'from-blue-400 to-blue-500',   // Lv3
  'from-purple-400 to-purple-500', // Lv4
  'from-yellow-400 to-yellow-500', // Lv5
  'from-orange-400 to-orange-500', // Lv6
  'from-red-400 to-red-500',      // Lv7
  'from-pink-400 to-pink-500',    // Lv8
  'from-indigo-400 to-indigo-500', // Lv9
  'from-yellow-300 to-yellow-500', // Lv10
];

const levelBgColors = [
  'bg-gray-100 text-gray-700',
  'bg-green-100 text-green-700',
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-yellow-50 text-yellow-600',
];

export default function UserProfileCard({ locale = 'zh', showStats = true, size = 'md' }: UserProfileCardProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[locale];

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const userProfile = userStatsApi.getOrCreateProfile(currentUser);
      setProfile(userProfile);
    }

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      if (newUser) {
        const userProfile = userStatsApi.getOrCreateProfile(newUser);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user || profile) {
      setLoading(false);
    }
  }, [user, profile]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const progress = getLevelProgress(profile.points);
  const nextLevelInfo = getPointsForNextLevel(profile.points);
  const badgesWithStatus = getBadgesWithStatus(profile);

  const sizeClasses = {
    sm: { avatar: 'w-10 h-10', title: 'text-lg', badge: 'w-6 h-6 text-xs' },
    md: { avatar: 'w-16 h-16', title: 'text-xl', badge: 'w-8 h-8 text-sm' },
    lg: { avatar: 'w-24 h-24', title: 'text-2xl', badge: 'w-10 h-10 text-base' },
  };

  const earnedBadges = badgesWithStatus.filter(b => b.earned);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={profile.avatar}
          alt={profile.name}
          className={`${sizeClasses[size].avatar} rounded-full bg-gray-100`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className={`${sizeClasses[size].title} font-bold text-gray-900 truncate`}>
              {profile.name}
            </h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBgColors[profile.level - 1]}`}>
              Lv{profile.level}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {t.joinDate}: {new Date(profile.joinDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{t.points}: {profile.points}</span>
          {nextLevelInfo ? (
            <span className="text-gray-500">
              {nextLevelInfo.pointsNeeded} {t.pointsNeeded} {t.nextLevel}
            </span>
          ) : (
            <span className="text-yellow-600 font-medium">MAX</span>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${levelColors[profile.level - 1]} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">{t.badges}</h3>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map(({ badge }) => (
              <div
                key={badge.id}
                className={`${sizeClasses[size].badge} rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center border-2 border-yellow-300`}
                title={`${locale === 'zh' ? badge.nameZh : badge.name}: ${locale === 'zh' ? badge.descriptionZh : badge.description}`}
              >
                {badge.icon}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{profile.favoritesCount}</div>
            <div className="text-xs text-gray-500">{t.favorites}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{profile.ratingsCount}</div>
            <div className="text-xs text-gray-500">{t.ratings}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{profile.followers.length}</div>
            <div className="text-xs text-gray-500">{t.followers}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{profile.followees.length}</div>
            <div className="text-xs text-gray-500">{t.following}</div>
          </div>
        </div>
      )}
    </div>
  );
}
