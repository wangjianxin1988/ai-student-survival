import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '@/lib/auth';
import FollowButton from './FollowButton';

interface FollowingUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
}

interface FollowingListTabProps {
  userId: string;
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    title: '我的关注',
    noFollowing: '还没有关注任何人',
    goExplore: '去排行榜看看',
    unfollow: '取消关注',
  },
  en: {
    title: 'My Following',
    noFollowing: 'Not following anyone yet',
    goExplore: 'Explore Leaderboard',
    unfollow: 'Unfollow',
  },
};

// Calculate level from points
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

export function FollowingListTab({ userId, locale = 'zh' }: FollowingListTabProps) {
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[locale];

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = async () => {
    setLoading(true);
    try {
      // Get following list from API
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/follows?type=following&user_id=${userId}`, {
        headers: authHeaders,
      });
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        const followingIds = data.data.map((f: { following_id: string }) => f.following_id);

        // Fetch profile info for each followed user
        const profiles = await Promise.all(
          followingIds.map(async (id: string) => {
            try {
              const statsRes = await fetch(`/api/community/user/${id}/stats`);
              const statsData = await statsRes.json();
              if (statsData.success && statsData.data) {
                return {
                  id,
                  name: statsData.data.name,
                  avatar: statsData.data.avatar,
                  points: statsData.data.points || 0,
                  level: getLevelFromPoints(statsData.data.points || 0),
                };
              }
            } catch {
              // Fallback
            }
            return {
              id,
              name: `用户${id.substring(0, 8)}`,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id.substring(0, 8)}`,
              points: 0,
              level: 1,
            };
          })
        );

        setFollowing(profiles);
      } else {
        setFollowing([]);
      }
    } catch (e) {
      console.error('[FollowingListTab] Failed to load following:', e);
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = (unfollowedId: string) => {
    setFollowing(prev => prev.filter(p => p.id !== unfollowedId));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noFollowing}</h3>
        <a
          href={`/${locale === 'en' ? 'en/' : ''}user`}
          className="inline-block mt-4 px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          {t.goExplore}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {following.map(profile => (
        <div
          key={profile.id}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-200 transition-colors"
        >
          <div className="flex items-center gap-4">
            <a href={`/user/${profile.id}`} className="flex-shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-14 h-14 rounded-full bg-gray-100 hover:ring-2 hover:ring-primary-300 cursor-pointer transition-all"
              />
            </a>

            <div className="flex-1 min-w-0">
              <a
                href={`/user/${profile.id}`}
                className="font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate block"
              >
                {profile.name}
              </a>
              <div className="text-sm text-gray-500 mt-0.5">
                Lv{profile.level} · {profile.points} {locale === 'zh' ? '积分' : 'pts'}
              </div>
            </div>

            <FollowButton
              targetUserId={profile.id}
              locale={locale}
              size="sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default FollowingListTab;
