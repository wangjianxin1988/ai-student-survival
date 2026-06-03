import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser, onAuthStateChange, getAuthHeaders, type DemoUser } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

interface CommentSectionProps {
  targetType: string;
  targetId: string;
  locale?: 'zh' | 'en';
  showRating?: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  rating?: number;
  parentId?: string | null;
  createdAt: string;
  likes: number;
  likedByUser: boolean;
  replies: Comment[];
}

const translations = {
  zh: {
    title: '评论',
    submit: '发布',
    delete: '删除',
    like: '赞',
    reply: '回复',
    cancelReply: '取消回复',
    loginToComment: '登录后参与评论',
    noComments: '暂无评论，来抢先评论吧！',
    deleteConfirm: '确定删除这条评论吗？',
    placeholder: '分享你的看法...',
    viewReplies: '查看回复',
    hideReplies: '收起回复',
    loading: '加载评论中...',
    replyingTo: '回复',
  },
  en: {
    title: 'Comments',
    submit: 'Submit',
    delete: 'Delete',
    like: 'Like',
    reply: 'Reply',
    cancelReply: 'Cancel reply',
    loginToComment: 'Login to comment',
    noComments: 'No comments yet. Be the first to comment!',
    deleteConfirm: 'Are you sure you want to delete this comment?',
    placeholder: 'Share your thoughts...',
    viewReplies: 'View replies',
    hideReplies: 'Hide replies',
    loading: 'Loading comments...',
    replyingTo: 'Replying to',
  },
};

function timeAgo(dateString: string, locale: 'zh' | 'en'): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return locale === 'zh' ? '刚刚' : 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} ${locale === 'zh' ? '分钟前' : 'm ago'}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${locale === 'zh' ? '小时前' : 'h ago'}`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} ${locale === 'zh' ? '天前' : 'd ago'}`;
  return date.toLocaleDateString();
}

// Loading spinner component
function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-3" style={{ borderWidth: '3px' }} />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

export default function CommentSection({ targetType, targetId, locale = 'zh', showRating = false }: CommentSectionProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [likingComment, setLikingComment] = useState<string | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const t = translations[locale];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewComment((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    const unsubscribe = onAuthStateChange((newUser) => setUser(newUser));
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadComments();
  }, [targetType, targetId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/content-comments?target_type=${targetType}&target_id=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.comments) {
          // Build comment tree: separate top-level and replies
          const allComments = data.comments.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            userName: c.user_name || 'Anonymous',
            userAvatar: c.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_id}`,
            content: c.content,
            rating: c.rating,
            parentId: c.parent_id,
            createdAt: c.created_at,
            likes: c.likes || 0,
            likedByUser: false,
            replies: [] as Comment[],
          }));

          // Check which comments the current user has liked
          const currentUser = getCurrentUser();
          if (currentUser) {
            try {
              const headers = await getAuthHeaders();
              const likeRes = await fetch(`/api/comment-likes?user_id=${currentUser.id}`, { headers });
              if (likeRes.ok) {
                const likeData = await likeRes.json();
                const likedIds = new Set(likeData.liked_comment_ids || []);
                allComments.forEach((c: Comment) => {
                  c.likedByUser = likedIds.has(c.id);
                });
              }
            } catch {}
          }

          // Build tree
          const topLevel: Comment[] = [];
          const replyMap = new Map<string, Comment[]>();
          for (const c of allComments) {
            if (c.parentId) {
              if (!replyMap.has(c.parentId)) replyMap.set(c.parentId, []);
              replyMap.get(c.parentId)!.push(c);
            } else {
              topLevel.push(c);
            }
          }
          // Attach replies to parent
          for (const c of topLevel) {
            c.replies = replyMap.get(c.id) || [];
          }

          setComments(topLevel);
        }
      }
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newComment.trim() && (!showRating || rating === 0))) return;

    setSubmitting(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/content-comments', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          content: newComment.trim(),
          rating: showRating && rating > 0 ? rating : undefined,
          parent_id: replyTo?.id,
        }),
      });

      if (res.ok) {
        setNewComment('');
        setRating(0);
        setReplyTo(null);
        await loadComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    if (!user) {
      window.location.href = getAuthLoginHref();
      return;
    }
    setReplyTo({ id: commentId, name: userName });
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      const headers = await getAuthHeaders();
      await fetch('/api/content-comments', {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId }),
      });
      await loadComments();
    } catch {}
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      window.location.href = getAuthLoginHref();
      return;
    }
    if (likingComment) return; // Prevent double-click
    setLikingComment(commentId);
    try {
      const headers = await getAuthHeaders();
      await fetch('/api/comment-likes', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId }),
      });
      await loadComments();
    } catch {}
    setLikingComment(null);
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) newExpanded.delete(commentId);
    else newExpanded.add(commentId);
    setExpandedReplies(newExpanded);
  };

  const renderStars = (interactive: boolean, currentRating: number = 0) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => interactive && setRating(value)}
          onMouseEnter={() => interactive && setHoverRating(value)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          className={`w-5 h-5 ${interactive ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'} transition-colors`}
        >
          <svg
            fill={(hoverRating || currentRating) >= value ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            className={interactive ? 'text-gray-300' : (hoverRating || currentRating) >= value ? 'text-yellow-400' : 'text-gray-300'}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  );

  // Find parent comment name for reply display
  const findParentName = (parentId: string | null | undefined): string => {
    if (!parentId) return '';
    for (const c of comments) {
      if (c.id === parentId) return c.userName;
      for (const r of c.replies) {
        if (r.id === parentId) return r.userName;
      }
    }
    return '';
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 pl-4 border-l-2 border-gray-100' : ''} bg-white rounded-xl border border-gray-200 p-4 mb-3`}>
      <div className="flex items-start gap-3">
        <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full bg-gray-100" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 text-sm">{comment.userName}</span>
            <span className="text-xs text-gray-400">{timeAgo(comment.createdAt, locale)}</span>
          </div>

          {/* Show reply indicator */}
          {comment.parentId && (
            <div className="text-xs text-gray-400 mt-0.5">
              {t.replyingTo} @{findParentName(comment.parentId) || '...'}
            </div>
          )}

          {comment.rating && comment.rating > 0 && (
            <div className="mt-1">{renderStars(false, comment.rating)}</div>
          )}

          <p className="mt-2 text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>

          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => handleLikeComment(comment.id)}
              disabled={likingComment === comment.id}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.likedByUser ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill={comment.likedByUser ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {!isReply && (
              <button
                onClick={() => handleReply(comment.id, comment.userName)}
                className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
              >
                {t.reply}
              </button>
            )}

            {user && user.id === comment.userId && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                {t.delete}
              </button>
            )}
          </div>

          {/* Replies */}
          {!isReply && comment.replies.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => toggleReplies(comment.id)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {expandedReplies.has(comment.id)
                  ? t.hideReplies
                  : `${t.viewReplies} (${comment.replies.length})`}
              </button>
              {expandedReplies.has(comment.id) && (
                <div className="mt-2 space-y-2">
                  {comment.replies.map((reply) => renderComment(reply, true))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {t.title} ({comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)})
      </h2>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} id="comment-form" className="mb-8 bg-gray-50 rounded-xl p-4">
          {replyTo && (
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-200">
              <span>{t.replyingTo} @{replyTo.name}</span>
              <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t.placeholder}
              rows={3}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 bottom-3 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute right-0 bottom-14 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} searchDisabled skinTonesDisabled previewConfig={{ showPreview: false }} />
              </div>
            )}
          </div>
          {showRating && (
            <div className="mt-3 flex items-center gap-4">
              <span className="text-sm text-gray-600">评分:</span>
              {renderStars(true, rating)}
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting || (!newComment.trim() && (!showRating || rating === 0))}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '...' : t.submit}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 bg-gray-50 rounded-xl p-6 text-center">
          <a href="/auth/login" className="text-primary-500 hover:underline">{t.loginToComment}</a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <LoadingSpinner text={t.loading} />
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t.noComments}</div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
