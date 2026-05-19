import React, { useState } from 'react';
import type { CommunityPost } from '@/lib/community/types';

interface PostCardProps {
  post: CommunityPost;
  onLike?: (postId: string) => void;
  onFavorite?: (postId: string) => void;
  onClick?: (postId: string) => void;
  currentUserId?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  tools: 'AI工具',
  payment: '支付指南',
  policy: '政策',
  prompt: 'Prompt',
  survival: '妙妙贴',
  discussion: '讨论',
  qa: '问答',
};

const CATEGORY_COLORS: Record<string, string> = {
  tools: 'bg-blue-100 text-blue-700',
  payment: 'bg-green-100 text-green-700',
  policy: 'bg-purple-100 text-purple-700',
  prompt: 'bg-yellow-100 text-yellow-700',
  survival: 'bg-pink-100 text-pink-700',
  discussion: 'bg-gray-100 text-gray-700',
  qa: 'bg-orange-100 text-orange-700',
};

const PRICING_LABELS: Record<string, string> = {
  free: '免费',
  freemium: '免费+付费',
  paid: '付费',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const RELIABILITY_LABELS: Record<string, string> = {
  high: '高可靠性',
  medium: '中可靠性',
  low: '低可靠性',
};

const POLICY_LABELS: Record<string, string> = {
  allowed: '允许',
  restricted: '限制',
  prohibited: '禁止',
  case_by_case: '课程决定',
};

const SURVIVAL_CATEGORY_LABELS: Record<string, string> = {
  scam: '防骗',
  culture: '文化',
  safety: '安全',
  legal: '法律',
  other: '其他',
};

export function PostCard({ post, onLike, onFavorite, onClick, currentUserId }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [favorited, setFavorited] = useState(post.isFavorited || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [favoritesCount, setFavoritesCount] = useState(post.favoritesCount || 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;

    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onLike?.(post.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;

    setFavorited(!favorited);
    setFavoritesCount(favorited ? favoritesCount - 1 : favoritesCount + 1);
    onFavorite?.(post.id);
  };

  const handleClick = () => {
    onClick?.(post.id);
  };

  const renderMetaBadge = () => {
    if (!post.meta) return null;

    const meta = post.meta as unknown as Record<string, unknown>;

    switch (post.category) {
      case 'tools':
        const pricing = meta.pricing as string;
        return pricing ? (
          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
            {PRICING_LABELS[pricing] || pricing}
          </span>
        ) : null;

      case 'payment':
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
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                reliability === 'high' ? 'bg-green-50 text-green-600' :
                reliability === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                'bg-red-50 text-red-600'
              }`}>
                {RELIABILITY_LABELS[reliability] || reliability}
              </span>
            )}
          </>
        );

      case 'policy':
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
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                overallPolicy === 'allowed' ? 'bg-green-50 text-green-600' :
                overallPolicy === 'restricted' ? 'bg-yellow-50 text-yellow-600' :
                overallPolicy === 'prohibited' ? 'bg-red-50 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {POLICY_LABELS[overallPolicy] || overallPolicy}
              </span>
            )}
          </>
        );

      case 'survival':
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

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-700'}`}>
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

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {post.excerpt || post.content?.substring(0, 150)}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{post.userName || '匿名用户'}</span>
            <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.viewsCount || 0}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 ml-4">
          <button
            onClick={handleLike}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              liked ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-50'
            }`}
            disabled={!currentUserId}
          >
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs mt-1">{likesCount}</span>
          </button>

          <button
            onClick={handleFavorite}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              favorited ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'
            }`}
            disabled={!currentUserId}
          >
            <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-xs mt-1">{favoritesCount}</span>
          </button>

          <span className="flex flex-col items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs mt-1">{post.commentsCount || 0}</span>
          </span>
        </div>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
