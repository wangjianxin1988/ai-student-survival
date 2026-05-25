import React, { useState, useEffect } from "react";
import type { CommunityPost } from "@/lib/community/types";
import { PostCard } from "./PostCard";
import { CategoryFilter, type CommunityCategory } from "./CategoryFilter";
import { getCurrentLocale, getLocaleHref } from "@/lib/i18n";
import { getAccessToken } from "@/lib/auth";

const translations = {
  zh: {
    title: "社区动态",
    featured: "精选推荐",
    latest: "最新",
    popular: "热门",
    createPost: "发布帖子",
    loginToPost: "登录后可发帖",
    noPosts: "暂无帖子",
    beFirst: "成为第一个发布的人吧！",
    prevPage: "上一页",
    nextPage: "下一页",
    page: "第",
    pageOf: "/",
    pageEnd: "页",
  },
  en: {
    title: "Community",
    featured: "Featured",
    latest: "Latest",
    popular: "Popular",
    createPost: "Create Post",
    loginToPost: "Login to Post",
    noPosts: "No posts yet",
    beFirst: "Be the first to post!",
    prevPage: "Previous",
    nextPage: "Next",
    page: "Page",
    pageOf: "of",
    pageEnd: "",
  },
};

interface CommunityFeedProps {
  currentUserId?: string;
  locale?: "zh" | "en";
}

// Demo session key - same as in auth.ts and AuthProvider.tsx
const DEMO_SESSION_KEY = 'demo_session';

// Read demo user from sessionStorage (same logic as AuthProvider)
function getDemoUserFromSession(): { id: string; email: string; name?: string; avatar?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function CommunityFeed({ currentUserId: serverUserId, locale }: CommunityFeedProps) {
  const currentLocale = locale || getCurrentLocale();
  const t = translations[currentLocale];

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CommunityCategory>("all");
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [clientUserId, setClientUserId] = useState<string | undefined>(serverUserId);
  const limit = 20;

  // Poll sessionStorage for demo session changes (same tab doesn't fire storage event)
  useEffect(() => {
    const checkDemoSession = () => {
      const demoUser = getDemoUserFromSession();
      if (demoUser) {
        setClientUserId(prev => {
          if (!prev || prev !== demoUser.id) {
            return demoUser.id;
          }
          return prev;
        });
      }
    };

    // Check immediately
    checkDemoSession();

    // Poll every 500ms
    const interval = setInterval(checkDemoSession, 500);
    return () => clearInterval(interval);
  }, []);

  // Determine if user is logged in: prefer client-side session over server prop
  const currentUserId = clientUserId || serverUserId || undefined;
  const isLoggedIn = Boolean(currentUserId);

  useEffect(() => {
    fetchPosts();
  }, [category, sort, page]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/community?auto_promoted=true&limit=3&sort=popular');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setFeaturedPosts(data.data);
        }
      } catch {
        // ignore
      }
    };
    fetchFeatured();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort,
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });
      if (category !== "all") {
        params.set("category", category);
      }

      const response = await fetch(`/api/community?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;
    try {
      const accessToken = await getAccessToken();
      await fetch(`/api/community/${postId}/like`, {
        method: "POST",
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      });
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleFavorite = async (postId: string) => {
    if (!currentUserId) return;
    try {
      const accessToken = await getAccessToken();
      await fetch(`/api/community/${postId}/favorite`, {
        method: "POST",
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      });
    } catch (error) {
      console.error("Failed to favorite:", error);
    }
  };

  const handlePostClick = (postId: string) => {
    window.location.href = getLocaleHref(`/community/${postId}`, currentLocale);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex items-center gap-4">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "latest" | "popular")}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="latest">{t.latest}</option>
            <option value="popular">{t.popular}</option>
          </select>
          {isLoggedIn ? (
            <a
              href={getLocaleHref("/community/create", currentLocale)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {t.createPost}
            </a>
          ) : (
            <a
              href={getLocaleHref("/auth/login", currentLocale)}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              {t.loginToPost}
            </a>
          )}
        </div>
      </div>

      {featuredPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">{t.featured}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredPosts.map((post) => (
              <div
                key={post.id}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => handlePostClick(post.id)}
              >
                <span className="text-xs bg-yellow-400 text-white px-2 py-0.5 rounded">
                  精选
                </span>
                <h3 className="font-semibold mt-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>👍 {post.likesCount}</span>
                  <span>💬 {post.commentsCount}</span>
                  <span>⭐ {post.promoteScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CategoryFilter selected={category} onChange={setCategory} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">{t.noPosts}</p>
          <p className="text-sm">{t.beFirst}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onFavorite={handleFavorite}
                onClick={handlePostClick}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.prevPage}
              </button>
              <span className="text-sm text-gray-600">
                {t.page} {page + 1} {t.pageOf} {totalPages} {t.pageEnd}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.nextPage}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}