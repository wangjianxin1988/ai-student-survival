import React, { useState, useRef, useEffect } from 'react';
import type { OfferComment as OfferCommentType } from '@/data/offers';
import { getCurrentUser } from '@/lib/auth';
import { contentModerationApi } from '@/lib/content-moderation';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

interface OfferCommentProps {
  comment: OfferCommentType;
  locale?: 'zh' | 'en';
  onLike?: (commentId: string) => void;
}

const translations = {
  zh: {
    like: '赞',
    reply: '回复',
  },
  en: {
    like: 'Like',
    reply: 'Reply',
  },
};

export default function OfferComment({ comment, locale = 'zh', onLike }: OfferCommentProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const t = translations[locale];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return locale === 'zh' ? '刚刚' : 'Just now';
    if (diffMins < 60) return locale === 'zh' ? `${diffMins}分钟前` : `${diffMins}m ago`;
    if (diffHours < 24) return locale === 'zh' ? `${diffHours}小时前` : `${diffHours}h ago`;
    if (diffDays < 7) return locale === 'zh' ? `${diffDays}天前` : `${diffDays}d ago`;

    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
    onLike?.(comment.id);
  };

  return (
    <div className="flex gap-3 p-4 bg-white rounded-lg border border-gray-100">
      <img
        src={comment.userAvatar}
        alt={comment.userName}
        className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">{comment.userName}</span>
          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm transition-colors ${
              liked ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={liked ? 'currentColor' : 'none'}
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
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface CommentListProps {
  comments: OfferCommentType[];
  locale?: 'zh' | 'en';
  onLike?: (commentId: string) => void;
}

export function CommentList({ comments, locale = 'zh', onLike }: CommentListProps) {
  const t = translations[locale];

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {locale === 'zh' ? '暂无评论' : 'No comments yet'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <OfferComment
          key={comment.id}
          comment={comment}
          locale={locale}
          onLike={onLike}
        />
      ))}
    </div>
  );
}

interface CommentFormProps {
  locale?: 'zh' | 'en';
  onSubmit: (content: string) => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

const commentFormTranslations = {
  zh: {
    placeholder: '写下你的评论...',
    submit: '发表评论',
    submitting: '提交中...',
  },
  en: {
    placeholder: 'Write your comment...',
    submit: 'Post Comment',
    submitting: 'Submitting...',
  },
};

export function CommentForm({ locale = 'zh', onSubmit, isSubmitting, placeholder }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Honeypot field
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const t = commentFormTranslations[locale];
  const user = typeof window !== 'undefined' ? getCurrentUser() : null;

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Silently do nothing to fool bots
      return;
    }

    if (!content.trim()) return;

    // Content moderation check
    if (user) {
      const modResult = contentModerationApi.moderate(content.trim(), user.id, 'comment');
      if (!modResult.isAllowed) {
        alert(modResult.reason || '内容审核未通过，请修改后重试');
        return;
      }
    }

    onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || t.placeholder}
          rows={3}
          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none text-sm"
        />
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute right-3 bottom-3 text-gray-400 hover:text-primary-500 transition-colors"
          title="Emoji"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute right-0 bottom-14 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={300}
              height={400}
              searchDisabled
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>
      {/* Honeypot field - hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          type="text"
          name="comment_url"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  );
}
