import React from "react";
import type { CommunityPost } from "@/lib/community/types";

interface PostCardProps {
  post: CommunityPost;
  onLike?: (postId: string) => void;
  onFavorite?: (postId: string) => void;
  onClick?: (postId: string) => void;
  currentUserId?: string;
  compact?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  tools: "AI工具",
  payment: "支付指南",
  policy: "大学政策",
  prompt: "Prompt",
  survival: "妙妙贴",
  academic: "学业问题",
  life: "日常生活",
  visa: "签证身份",
  job: "求职就业",
  study_life: "学习生活",
  job_recruitment: "求职招聘",
  discussion: "讨论",
  qa: "问答",
  other: "其他",
};

const CATEGORY_COLORS: Record<string, string> = {
  tools: "bg-blue-100 text-blue-700",
  payment: "bg-green-100 text-green-700",
  policy: "bg-purple-100 text-purple-700",
  prompt: "bg-yellow-100 text-yellow-700",
  survival: "bg-pink-100 text-pink-700",
  academic: "bg-orange-100 text-orange-700",
  life: "bg-lime-100 text-lime-700",
  visa: "bg-sky-100 text-sky-700",
  job: "bg-indigo-100 text-indigo-700",
  study_life: "bg-rose-100 text-rose-700",
  job_recruitment: "bg-amber-100 text-amber-700",
  discussion: "bg-gray-100 text-gray-700",
  qa: "bg-orange-100 text-orange-700",
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
  allowed: "允许",
  restricted: "限制",
  prohibited: "禁止",
  case_by_case: "课程决定",
};

const SURVIVAL_CATEGORY_LABELS: Record<string, string> = {
  scam: "防骗",
  culture: "文化",
  safety: "安全",
  legal: "法律",
  other: "其他",
};

export function PostCard({
  post,
  onLike,
  onFavorite,
  onClick,
  currentUserId,
  compact = false,
}: PostCardProps) {
  const liked = post.isLiked || false;
  const favorited = post.isFavorited || false;
  const likesCount = post.likesCount || 0;
  const favoritesCount = post.favoritesCount || 0;
  const commentsCount = post.commentsCount || 0;
  const viewsCount = post.viewsCount || 0;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    onLike?.(post.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    onFavorite?.(post.id);
  };

  const handleClick = () => {
    onClick?.(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/community/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.excerpt || post.content?.substring(0, 100), url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const renderMetaBadge = () => {
    if (!post.meta) return null;

    const meta = post.meta as unknown as Record<string, unknown>;

    switch (post.category) {
      case "tools": {
        const pricing = meta.pricing as string;
        return pricing ? (
          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
            {PRICING_LABELS[pricing] || pricing}
          </span>
        ) : null;
      }

      case "payment": {
        const difficulty = meta.difficulty as string;
        const reliability = meta.reliability as string;
        return (
          <>
            {difficulty && (
              <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-600 font-medium">
                {DIFFICULTY_LABELS[difficulty] || difficulty}
              </span>
            )}
            {reliability && (
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  reliability === "high"
                    ? "bg-green-50 text-green-600"
                    : reliability === "medium"
                      ? "bg-yellow-50 text-yellow-600"
                      : "bg-red-50 text-red-600"
                }`}
              >
                {RELIABILITY_LABELS[reliability] || reliability}
              </span>
            )}
          </>
        );
      }

      case "policy": {
        const overallPolicy = meta.overallPolicy as string;
        const universityName = meta.universityName as string;
        return (
          <>
            {universityName && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-600 font-medium">
                {universityName}
              </span>
            )}
            {overallPolicy && (
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  overallPolicy === "allowed"
                    ? "bg-green-50 text-green-600"
                    : overallPolicy === "restricted"
                      ? "bg-yellow-50 text-yellow-600"
                      : overallPolicy === "prohibited"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-600"
                }`}
              >
                {POLICY_LABELS[overallPolicy] || overallPolicy}
              </span>
            )}
          </>
        );
      }

      case "survival": {
        const survivalCategory = meta.survivalCategory as string;
        const country = meta.country as string;
        return (
          <>
            {survivalCategory && (
              <span className="text-xs px-2 py-0.5 rounded bg-pink-50 text-pink-600 font-medium">
                {SURVIVAL_CATEGORY_LABELS[survivalCategory] || survivalCategory}
              </span>
            )}
            {country && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                {country}
              </span>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${compact ? 'p-3' : 'p-4'}`}
      onClick={handleClick}
    >
      {/* Category badges row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700"}`}
        >
          {CATEGORY_LABELS[post.category] || post.category}
        </span>
        {renderMetaBadge()}
        {post.isPinned && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
            置顶
          </span>
        )}
        {post.autoPromoted && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
            自动推送
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {post.excerpt || post.content?.substring(0, 150)}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row: author info + horizontal actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {/* Author + date + views */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{post.userName || "匿名用户"}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {viewsCount}
          </span>
        </div>

        {/* Horizontal actions: like, favorite, comment, share */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
              liked
                ? "text-red-500 hover:bg-red-50"
                : "text-gray-400 hover:bg-gray-50"
            }`}
            disabled={!currentUserId}
          >
            <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleFavorite}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
              favorited
                ? "text-yellow-500 hover:bg-yellow-50"
                : "text-gray-400 hover:bg-gray-50"
            }`}
            disabled={!currentUserId}
          >
            <svg className="w-4 h-4" fill={favorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>{favoritesCount}</span>
          </button>

          <span className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{commentsCount}</span>
          </span>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
