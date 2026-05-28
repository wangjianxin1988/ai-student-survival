import React, { useState, useEffect } from 'react';
import { initAuth, getCurrentUser, onAuthStateChange, getAuthHeaders, type DemoUser } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';

interface FollowButtonProps {
  targetUserId: string;
  locale?: 'zh' | 'en';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const translations = {
  zh: {
    follow: '关注',
    following: '已关注',
    unfollow: '取消关注',
    loginRequired: '登录后关注',
    followers: '粉丝',
    followees: '关注',
  },
  en: {
    follow: 'Follow',
    following: 'Following',
    unfollow: 'Unfollow',
    loginRequired: 'Login to follow',
    followers: 'Followers',
    followees: 'Following',
  },
};

export default function FollowButton({
  targetUserId,
  locale = 'zh',
  size = 'md',
  showCount = false,
}: FollowButtonProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const t = translations[locale];

  useEffect(() => {
    initAuth().then((currentUser) => {
      setUser(currentUser);
    });

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  // Check follow status via API
  useEffect(() => {
    if (user && user.id !== targetUserId) {
      checkFollowStatus();
    }
  }, [user, targetUserId]);

  const checkFollowStatus = async () => {
    if (!user) return;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/follows?type=following&user_id=${user.id}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIsFollowing(data.data.some((f: { following_id: string }) => f.following_id === targetUserId));
      }
    } catch {
      // Ignore errors
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = getAuthLoginHref();
      return;
    }

    if (user.id === targetUserId) {
      return; // Can't follow yourself
    }

    setLoading(true);

    try {
      const authHeaders = await getAuthHeaders();

      if (isFollowing) {
        // Unfollow
        const res = await fetch('/api/follows', {
          method: 'DELETE',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ following_id: targetUserId }),
        });
        const data = await res.json();
        if (data.success) {
          setIsFollowing(false);
        }
      } else {
        // Follow
        const res = await fetch('/api/follows', {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ following_id: targetUserId }),
        });
        const data = await res.json();
        if (data.success) {
          setIsFollowing(true);
        }
      }
    } catch (e) {
      console.error('[FollowButton] Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: {
      button: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
    },
    md: {
      button: 'px-4 py-2 text-sm',
      icon: 'w-5 h-5',
    },
    lg: {
      button: 'px-6 py-3 text-base',
      icon: 'w-6 h-6',
    },
  };

  // Don't show button for self
  if (user && user.id === targetUserId) {
    return null;
  }

  const getButtonContent = () => {
    if (loading) {
      return <span className="opacity-70">...</span>;
    }

    if (isFollowing) {
      return hovering ? t.unfollow : t.following;
    }

    return t.follow;
  };

  const getButtonStyle = () => {
    if (isFollowing) {
      return hovering
        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100';
    }

    return 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600';
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        disabled={loading || (user !== null && user.id === targetUserId)}
        className={`${sizeClasses[size].button} font-medium rounded-lg border transition-all duration-200 flex items-center gap-2 ${
          getButtonStyle()
        } ${(loading || (user !== null && user.id === targetUserId)) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isFollowing && !hovering && (
          <svg
            className={sizeClasses[size].icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {!isFollowing && (
          <svg
            className={sizeClasses[size].icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
        {getButtonContent()}
      </button>

      {showCount && followerCount > 0 && (
        <span className="text-sm text-gray-500">
          {followerCount}
        </span>
      )}
    </div>
  );
}

interface FollowStatsProps {
  userId: string;
  locale?: 'zh' | 'en';
}

export function FollowStats({ userId, locale = 'zh' }: FollowStatsProps) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [followersRes, followingRes] = await Promise.all([
          fetch(`/api/follows?type=followers&user_id=${userId}`),
          fetch(`/api/follows?type=following&user_id=${userId}`),
        ]);

        const followersData = await followersRes.json();
        const followingData = await followingRes.json();

        setFollowers(followersData.success ? (followersData.data?.length || 0) : 0);
        setFollowing(followingData.success ? (followingData.data?.length || 0) : 0);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex gap-4">
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const t = translations[locale];

  return (
    <div className="flex gap-4 text-sm">
      <div>
        <span className="font-semibold text-gray-900">{followers}</span>
        <span className="text-gray-500 ml-1">{t.followers}</span>
      </div>
      <div>
        <span className="font-semibold text-gray-900">{following}</span>
        <span className="text-gray-500 ml-1">{t.followees}</span>
      </div>
    </div>
  );
}
