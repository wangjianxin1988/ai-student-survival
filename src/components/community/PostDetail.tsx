import React, { useState, useEffect } from "react";
import type { CommunityPost, PostComment } from "@/lib/community/types";
import { getAuthHeaders } from "@/lib/auth";
import { isDemoMode } from "@/lib/supabase";

interface PostDetailProps {
  postId: string;
  currentUserId?: string;
}

// Unified user detection: demo session + Supabase localStorage session
function getCurrentClientUser(): { id: string; email: string; name?: string; avatar?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    // Check demo session first
    const demoRaw = sessionStorage.getItem('demo_session');
    if (demoRaw) {
      const d = JSON.parse(demoRaw);
      if (d && d.id) return { id: d.id, email: d.email || '', name: d.name, avatar: d.avatar };
    }
    // Check Supabase localStorage sessions
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (!k.startsWith('sb-')) continue;
      if (k.indexOf('auth') === -1 && k.indexOf('token') === -1) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const p = JSON.parse(raw);
        const accessToken = p?.tokens?.access_token || p?.access_token;
        const refreshToken = p?.tokens?.refresh_token || p?.refresh_token;
        if (!accessToken || !refreshToken) continue;
        const parts = accessToken.split('.');
        if (parts.length !== 3) continue;
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        if (!['ES256', 'RS256'].includes(header.alg)) continue;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (!payload.sub || typeof payload.sub !== 'string') continue;
        const user = p?.user || (p?.tokens?.user);
        if (user) {
          return { id: user.id || payload.sub, email: user.email || '', name: user.user_metadata?.name || '', avatar: user.user_metadata?.avatar_url || '' };
        }
        return { id: payload.sub, email: '', name: '', avatar: '' };
      } catch { /* skip */ }
    }
  } catch {}
  return null;
}

const CATEGORY_LABELS: Record<string, string> = {
  tools: "AI工具",
  payment: "支付指南",
  policy: "政策",
  prompt: "Prompt",
  survival: "妙妙贴",
  discussion: "讨论",
  qa: "问答",
  academic: "学业问题",
  life: "日常生活",
  visa: "签证身份",
  job: "求职就业",
  study_life: "学习生活",
  job_recruitment: "求职招聘",
  other: "其他",
};

const PRICING_LABELS: Record<string, string> = {
  free: "免费",
  freemium: "免费+付费",
  paid: "付费",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

const RELIABILITY_LABELS: Record<string, string> = {
  high: "高可靠性",
  medium: "中可靠性",
  low: "低可靠性",
};

const POLICY_LABELS: Record<string, string> = {
  allowed: "允许使用AI",
  restricted: "限制使用AI",
  prohibited: "禁止使用AI",
  case_by_case: "由课程决定",
};

const SURVIVAL_CATEGORY_LABELS: Record<string, string> = {
  scam: "防骗指南",
  culture: "文化禁忌",
  safety: "安全提醒",
  legal: "法律须知",
  other: "其他",
};

function renderToolsMeta(meta: Record<string, unknown>) {
  return (
    <div className="space-y-3">
      {!!meta.name && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">工具:</span>
          <span className="font-medium">{String(meta.name)}</span>
        </div>
      )}
      {!!meta.pricing && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">定价:</span>
          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm">
            {PRICING_LABELS[String(meta.pricing)] || String(meta.pricing)}
          </span>
        </div>
      )}
      {!!meta.url && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">官网:</span>
          <a
            href={String(meta.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {String(meta.url)}
          </a>
        </div>
      )}
      {!!(
        meta.features &&
        Array.isArray(meta.features) &&
        meta.features.length > 0
      ) && (
        <div>
          <span className="text-sm text-gray-500">主要功能:</span>
          <ul className="mt-1 list-disc list-inside text-sm">
            {(meta.features as string[]).slice(0, 5).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function renderPaymentMeta(meta: Record<string, unknown>) {
  return (
    <div className="space-y-3">
      {!!meta.paymentCategory && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">类型:</span>
          <span className="font-medium">{String(meta.paymentCategory)}</span>
        </div>
      )}
      {!!meta.difficulty && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">难度:</span>
          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-sm">
            {DIFFICULTY_LABELS[String(meta.difficulty)] ||
              String(meta.difficulty)}
          </span>
        </div>
      )}
      {!!meta.reliability && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">可靠性:</span>
          <span
            className={`inline-block px-2 py-0.5 rounded text-sm ${
              String(meta.reliability) === "high"
                ? "bg-green-100 text-green-700"
                : String(meta.reliability) === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {RELIABILITY_LABELS[String(meta.reliability)] ||
              String(meta.reliability)}
          </span>
        </div>
      )}
    </div>
  );
}

function renderPolicyMeta(meta: Record<string, unknown>) {
  return (
    <div className="space-y-3">
      {!!meta.universityName && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">大学:</span>
          <span className="font-medium">{String(meta.universityName)}</span>
        </div>
      )}
      {!!meta.country && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">国家:</span>
          <span>{String(meta.country)}</span>
        </div>
      )}
      {!!meta.overallPolicy && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">总体政策:</span>
          <span
            className={`inline-block px-2 py-0.5 rounded text-sm ${
              String(meta.overallPolicy) === "allowed"
                ? "bg-green-100 text-green-700"
                : String(meta.overallPolicy) === "restricted"
                  ? "bg-yellow-100 text-yellow-700"
                  : String(meta.overallPolicy) === "prohibited"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
            }`}
          >
            {POLICY_LABELS[String(meta.overallPolicy)] ||
              String(meta.overallPolicy)}
          </span>
        </div>
      )}
      {!!(
        meta.allowedTools &&
        Array.isArray(meta.allowedTools) &&
        meta.allowedTools.length > 0
      ) && (
        <div>
          <span className="text-sm text-gray-500">允许使用的AI工具:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {(meta.allowedTools as string[]).map((tool, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderPromptMeta(meta: Record<string, unknown>) {
  return (
    <div className="space-y-3">
      {!!meta.promptCategory && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">分类:</span>
          <span className="font-medium">{String(meta.promptCategory)}</span>
        </div>
      )}
      {!!meta.toolId && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">适用工具:</span>
          <span>{String(meta.toolId)}</span>
        </div>
      )}
      {!!meta.howToUse && (
        <div>
          <span className="text-sm text-gray-500">使用说明:</span>
          <p className="mt-1 text-sm">{String(meta.howToUse)}</p>
        </div>
      )}
    </div>
  );
}

function renderSurvivalMeta(meta: Record<string, unknown>) {
  return (
    <div className="space-y-3">
      {!!meta.survivalCategory && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">分类:</span>
          <span className="inline-block px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-sm">
            {SURVIVAL_CATEGORY_LABELS[String(meta.survivalCategory)] ||
              String(meta.survivalCategory)}
          </span>
        </div>
      )}
      {!!meta.country && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">国家:</span>
          <span>{String(meta.country)}</span>
        </div>
      )}
    </div>
  );
}

function renderMeta(post: CommunityPost) {
  if (!post.meta) return null;
  const meta = post.meta as unknown as Record<string, unknown>;

  switch (post.category) {
    case "tools":
      return renderToolsMeta(meta);
    case "payment":
      return renderPaymentMeta(meta);
    case "policy":
      return renderPolicyMeta(meta);
    case "prompt":
      return renderPromptMeta(meta);
    case "survival":
      return renderSurvivalMeta(meta);
    default:
      return null;
  }
}

function calculateScore(post: CommunityPost): number {
  return (
    (post.likesCount || 0) * 1 +
    (post.commentsCount || 0) * 2 +
    (post.favoritesCount || 0) * 3
  );
}

export function PostDetail({ postId, currentUserId: serverUserId }: PostDetailProps) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [commentContent, setCommentContent] = useState("");
  // Client-side user detection: starts with server prop, updates on client
  const [clientUserId, setClientUserId] = useState<string | undefined>(serverUserId);

  // Poll for session changes (same tab won't fire storage event)
  useEffect(() => {
    const checkSession = () => {
      const user = getCurrentClientUser();
      if (user) {
        setClientUserId(prev => { if (!prev || prev !== user.id) return user.id; return prev; });
      } else {
        setClientUserId(prev => { if (prev !== undefined) return undefined; return prev; });
      }
    };
    checkSession();
    const interval = setInterval(checkSession, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/community/${postId}`);
      const data = await response.json();
      if (data.success) {
        setPost(data.data);
        setLiked(data.data.isLiked || false);
        setFavorited(data.data.isFavorited || false);
        setLikesCount(data.data.likesCount || 0);
        setFavoritesCount(data.data.favoritesCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/community/${postId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleLike = async () => {
    if (!clientUserId) return;

    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    // In demo mode, skip API
    if (isDemoMode()) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/community/${postId}/like`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      const data = await response.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikesCount(data.data.likesCount ?? likesCount);
      }
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleFavorite = async () => {
    if (!clientUserId) return;

    // Optimistic update
    setFavorited(!favorited);
    setFavoritesCount(favorited ? favoritesCount - 1 : favoritesCount + 1);

    // In demo mode, skip API
    if (isDemoMode()) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/community/${postId}/favorite`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      const data = await response.json();
      if (data.success) {
        setFavorited(data.data.favorited);
        setFavoritesCount(data.data.favoritesCount ?? favoritesCount);
      }
    } catch (error) {
      console.error("Failed to favorite:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientUserId || !commentContent.trim()) return;

    const newComment = {
      id: 'temp-' + Date.now(),
      content: commentContent,
      userId: clientUserId,
      userName: '匿名用户',
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setComments([...comments, newComment]);
    setCommentContent("");

    // In demo mode, skip API
    if (isDemoMode()) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/community/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ content: commentContent }),
      });
      const data = await response.json();
      if (data.success) {
        // Replace temp comment with real one
        setComments(prev => [...prev.slice(0, -1), data.data]);
        // Update comments count
        if (post) {
          setPost({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
        }
      }
    } catch (error) {
      console.error("Failed to comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>帖子不存在或已被删除</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
          {post.isPinned && (
            <span className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              置顶
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
          <span className="font-medium text-gray-700">
            {post.userName || "匿名用户"}
          </span>
          <span>{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
          <span>阅读 {post.viewsCount || 0}</span>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Meta information for structured categories */}
        {post.meta && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {renderMeta(post)}
          </div>
        )}

        {/* Promotion status for promoted posts */}
        {(post.autoPromoted || post.directPublishRequested) && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm">
                <p className="text-green-800 font-medium">
                  {post.promoteSource === "points" ? "直达" : "已推送"}{" "}
                  {CATEGORY_LABELS[post.category] || post.category} 热门
                </p>
                {post.promoteScore !== undefined && (
                  <p className="text-green-600 mt-1">
                    热度评分: {post.promoteScore} | 推送时间:{" "}
                    {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Heat progress for non-promoted posts in target categories */}
        {!post.autoPromoted &&
          post.category !== "discussion" &&
          post.category !== "qa" && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">热度进度</span>
                <span className="text-sm font-medium text-gray-900">
                  {calculateScore(post)} / 10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (calculateScore(post) / 10) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                点赞×1 + 评论×2 + 收藏×3 = 热度评分，≥10分自动推送
              </p>
            </div>
          )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 pt-6 border-t border-gray-100">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
          <button
            onClick={handleLike}
            disabled={!clientUserId}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              liked
                ? "bg-red-50 text-red-500"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg
              className="w-5 h-5"
              fill={liked ? "currentColor" : "none"}
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
            {likesCount} 点赞
          </button>

          <button
            onClick={handleFavorite}
            disabled={!clientUserId}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              favorited
                ? "bg-yellow-50 text-yellow-500"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg
              className="w-5 h-5"
              fill={favorited ? "currentColor" : "none"}
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
            {favoritesCount} 收藏
          </button>

          <button
            onClick={() => {
              const url = `${window.location.origin}/community/${postId}`;
              if (navigator.share) {
                navigator.share({ title: post.title, url });
              } else {
                navigator.clipboard.writeText(url);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            分享
          </button>
        </div>
      </article>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          评论 ({comments.length})
        </h3>

        {clientUserId ? (
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下你的评论..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                发布评论
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center text-gray-600 text-sm">
            登录后可发表评论
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">
                  {comment.author?.name ||
                    comment.userName ||
                    "匿名用户"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-4">暂无评论</p>
          )}
        </div>
      </section>
    </div>
  );
}
