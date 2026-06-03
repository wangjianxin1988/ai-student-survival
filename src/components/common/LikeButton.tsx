import React, { useState, useEffect } from "react";
import { getCurrentUser, onAuthStateChange, getAuthHeaders } from "@/lib/auth";
import { getAuthLoginHref } from "@/lib/i18n";
import { isDemoMode } from "@/lib/supabase";

interface LikeButtonProps {
  targetType: string;
  targetId: string;
  locale?: "zh" | "en";
}

const translations = {
  zh: { like: "点赞", liked: "已赞" },
  en: { like: "Like", liked: "Liked" },
};

export default function LikeButton({
  targetType,
  targetId,
  locale = "zh",
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const t = translations[locale];

  useEffect(() => {
    setUser(getCurrentUser());
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });
    return unsubscribe;
  }, []);

  // Fetch like status on mount
  useEffect(() => {
    if (isDemoMode()) return;
    fetch(`/api/content-likes?target_type=${targetType}&target_id=${targetId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) {
          setIsLiked(data.isLiked || false);
          setLikeCount(data.count || 0);
        }
      })
      .catch(() => {});
  }, [targetType, targetId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = getAuthLoginHref();
      return;
    }

    setIsLoading(true);

    // Optimistic update
    const wasLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/content-likes", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikeCount(data.count ?? (data.liked ? prevCount + 1 : prevCount - 1));
      } else {
        // Revert on error
        setIsLiked(wasLiked);
        setLikeCount(prevCount);
      }
    } catch {
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
        isLiked
          ? "text-red-500 hover:text-red-600 bg-red-50"
          : "text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50"
      }`}
      title={isLiked ? t.liked : t.like}
    >
      <svg
        className={`w-5 h-5 ${isLoading ? "opacity-50" : ""}`}
        fill={isLiked ? "currentColor" : "none"}
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
      <span className="text-sm font-medium">
        {isLiked ? t.liked : t.like}{likeCount > 0 ? ` (${likeCount})` : ""}
      </span>
    </button>
  );
}
