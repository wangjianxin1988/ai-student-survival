import React, { useState, useEffect } from "react";
import { getCurrentUser, onAuthStateChange, getAuthHeaders } from "@/lib/auth";
import { getAuthLoginHref } from "@/lib/i18n";
import { userStatsApi } from "@/lib/userProfile";
import { isDemoMode } from "@/lib/supabase";

interface FavoriteButtonProps {
  targetType: "tool" | "prompt" | "policy" | "payment_solution" | "question";
  targetId: string;
  locale?: "zh" | "en";
}

const translations = {
  zh: {
    addFavorite: "添加收藏",
    removeFavorite: "取消收藏",
    loginRequired: "请先登录",
  },
  en: {
    addFavorite: "Add to Favorites",
    removeFavorite: "Remove from Favorites",
    loginRequired: "Please login first",
  },
};

// Demo mode favorites storage
const FAVORITES_KEY = "demo_favorites";

function getDemoFavorites(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveDemoFavorites(favorites: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export default function FavoriteButton({
  targetType,
  targetId,
  locale = "zh",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string;
  } | null>(null);
  const t = translations[locale];

  useEffect(() => {
    // Get initial user from demoAuth
    setUser(getCurrentUser());

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Check if this item is favorited
    if (isDemoMode()) {
      const favorites = getDemoFavorites();
      const key = `${targetType}_${targetId}`;
      setIsFavorited(favorites[user?.id || "anonymous"]?.includes(key) || false);
    } else if (user) {
      // For real users, check via API
      getAuthHeaders().then(headers => {
        fetch(`/api/favorites?target_type=${targetType}&target_id=${targetId}`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data?.isFavorited) setIsFavorited(true);
          })
          .catch(() => {});
      });
    }
  }, [user, targetType, targetId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check current user directly, not just state (state might not be synced yet)
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = getAuthLoginHref();
      return;
    }

    setIsLoading(true);

    const demo = isDemoMode();

    if (demo) {
      // Demo mode: use localStorage
      const favorites = getDemoFavorites();
      const key = `${targetType}_${targetId}`;
      const userId = currentUser.id;

      if (isFavorited) {
        if (favorites[userId]) {
          favorites[userId] = favorites[userId].filter((k) => k !== key);
          if (favorites[userId].length === 0) delete favorites[userId];
        }
        saveDemoFavorites(favorites);
        userStatsApi.recordUnfavorite(userId);
        setIsFavorited(false);
      } else {
        if (!favorites[userId]) favorites[userId] = [];
        favorites[userId].push(key);
        saveDemoFavorites(favorites);
        userStatsApi.recordFavorite(userId);
        setIsFavorited(true);
      }
    } else {
      // Real mode: call API
      try {
        const headers = await getAuthHeaders();
        if (isFavorited) {
          // Remove favorite via DELETE
          const res = await fetch('/api/favorites', {
            method: 'DELETE',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_type: targetType, target_id: targetId }),
          });
          if (res.ok) setIsFavorited(false);
        } else {
          // Add favorite via POST
          const res = await fetch('/api/favorites', {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_type: targetType, target_id: targetId }),
          });
          if (res.ok) setIsFavorited(true);
        }
      } catch (e) {
        console.error('[FavoriteButton] API call failed:', e);
      }
    }

    setIsLoading(false);
  };

  const buttonText = isFavorited
    ? locale === "zh"
      ? "已收藏"
      : "Favorited"
    : locale === "zh"
      ? "收藏"
      : "Favorite";

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isFavorited ? t.removeFavorite : t.addFavorite}
      aria-pressed={isFavorited}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
        isFavorited
          ? "text-red-500 hover:text-red-600 bg-red-50"
          : "text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50"
      }`}
      title={isFavorited ? t.removeFavorite : t.addFavorite}
    >
      <svg
        className={`w-5 h-5 ${isLoading ? "opacity-50" : ""}`}
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="text-sm font-medium">{buttonText}</span>
    </button>
  );
}
