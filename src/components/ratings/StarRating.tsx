import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';
import { userStatsApi } from '@/lib/userProfile';

interface StarRatingProps {
  targetType: 'tool' | 'payment_solution' | 'policy' | 'prompt';
  targetId: string;
  locale?: 'zh' | 'en';
  size?: 'sm' | 'md' | 'lg';
}

const translations = {
  zh: {
    rating: '评分',
    ratingsCount: '个评分',
    loginToRate: '登录后评分',
  },
  en: {
    rating: 'Rating',
    ratingsCount: 'ratings',
    loginToRate: 'Login to rate',
  },
};

// Demo mode ratings storage
const RATINGS_KEY = 'demo_ratings';

interface RatingData {
  [key: string]: { [key: string]: number }; // userId -> {targetType_targetId: rating}
}

function getDemoRatings(): RatingData {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(RATINGS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveDemoRatings(ratings: RatingData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

export default function StarRating({ targetType, targetId, locale = 'zh', size = 'md' }: StarRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const justRatedRef = useRef(false);
  const t = translations[locale];

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  useEffect(() => {
    setUser(getCurrentUser());

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Initial load: fetch all ratings from demo storage
    // Don't overwrite userRating if user just rated (to prevent UI flicker)
    if (justRatedRef.current) {
      justRatedRef.current = false;
      setIsInitialized(true);
      return;
    }

    if (isInitialized) return;

    const ratings = getDemoRatings();
    const key = `${targetType}_${targetId}`;
    let totalRating = 0;
    let ratingCount = 0;
    let userR = 0;

    Object.entries(ratings).forEach(([userId, userRatings]) => {
      if (userRatings[key]) {
        totalRating += userRatings[key];
        ratingCount++;
        if (user && userId === user.id) {
          userR = userRatings[key];
        }
      }
    });

    if (ratingCount > 0) {
      setAverage(Math.round((totalRating / ratingCount) * 10) / 10);
      setCount(ratingCount);
    }
    setRating(userR);
    setUserRating(userR);
    setIsInitialized(true);
  }, [user, targetType, targetId, isInitialized]);

  const handleClick = async (value: number) => {
    // Use getCurrentUser() directly to avoid stale closure issue
    // where React state 'user' hasn't been set via useEffect yet
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = getAuthLoginHref();
      return;
    }

    const ratings = getDemoRatings();
    const key = `${targetType}_${targetId}`;
    const isNewRating = !ratings[currentUser.id]?.[key];

    if (!ratings[currentUser.id]) {
      ratings[currentUser.id] = {};
    }
    ratings[currentUser.id][key] = value;
    saveDemoRatings(ratings);

    // Record points for new ratings only
    if (isNewRating) {
      userStatsApi.recordRating(currentUser.id);
    }

    // Mark that user just rated to prevent useEffect from overwriting
    justRatedRef.current = true;
    setRating(value);
    setUserRating(value);

    // Recalculate average
    let totalRating = 0;
    let ratingCount = 0;
    Object.values(ratings).forEach((userRatings) => {
      if (userRatings[key]) {
        totalRating += userRatings[key];
        ratingCount++;
      }
    });

    if (ratingCount > 0) {
      setAverage(Math.round((totalRating / ratingCount) * 10) / 10);
      setCount(ratingCount);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value}星`}
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            className={`${sizeClasses[size]} text-gray-300 hover:text-yellow-400 transition-colors`}
          >
            <svg
              fill={(hoverRating || rating || userRating) >= value ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
      {count > 0 && (
        <span className="text-sm text-gray-500">
          {average} ({count}{t.ratingsCount})
        </span>
      )}
      {count === 0 && user && (
        <span className="text-sm text-gray-400">{t.loginToRate}</span>
      )}
    </div>
  );
}
