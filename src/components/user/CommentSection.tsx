import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';
import { userStatsApi, type Comment } from '@/lib/userProfile';
import { contentModerationApi } from '@/lib/content-moderation';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

interface CommentSectionProps {
  targetType: 'tool' | 'payment_solution' | 'policy' | 'prompt' | 'survival' | 'user';
  targetId: string;
  locale?: 'zh' | 'en';
  showRating?: boolean;
}

const translations = {
  zh: {
    title: '评论',
    writeComment: '写评论...',
    submit: '发布',
    delete: '删除',
    like: '赞',
    reply: '回复',
    cancelReply: '取消回复',
    loginToComment: '登录后参与评论',
    noComments: '暂无评论，来抢先评论吧！',
    deleteConfirm: '确定删除这条评论吗？',
    placeholder: '分享你的看法...',
    replies: '回复',
    viewReplies: '查看回复',
    hideReplies: '收起回复',
  },
  en: {
    title: 'Comments',
    writeComment: 'Write a comment...',
    submit: 'Submit',
    delete: 'Delete',
    like: 'Like',
    reply: 'Reply',
    cancelReply: 'Cancel reply',
    loginToComment: 'Login to comment',
    noComments: 'No comments yet. Be the first to comment!',
    deleteConfirm: 'Are you sure you want to delete this comment?',
    placeholder: 'Share your thoughts...',
    replies: 'Replies',
    viewReplies: 'View replies',
    hideReplies: 'Hide replies',
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
  const [honeypot, setHoneypot] = useState(''); // Honeypot field
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const t = translations[locale];

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
    setNewComment((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    loadComments();
  }, [targetType, targetId]);

  const loadComments = () => {
    const loadedComments = userStatsApi.getComments(targetType, targetId);
    setComments(loadedComments);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[评论组件] 提交评论，蜜罐:', honeypot ? '已填写(机器人!)' : '为空');

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Silently do nothing to fool bots
      console.log('[评论组件] 机器人检测到(蜜罐)，静默拒绝');
      return;
    }

    if (!user || (!newComment.trim() && (!showRating || rating === 0))) {
      console.log('[评论组件] 缺少用户或内容为空');
      return;
    }

    // Content moderation check
    console.log('[评论组件] 调用内容审核，评论内容:', newComment.trim().substring(0, 100));
    const modResult = contentModerationApi.moderate(newComment.trim(), user.id, 'comment');
    console.log('[评论组件] 审核结果 - isAllowed:', modResult.isAllowed, 'score:', modResult.score, 'flags:', modResult.flags);

    if (!modResult.isAllowed) {
      console.log('[评论组件] 被拦截，原因:', modResult.reason);
      alert(modResult.reason || '内容审核未通过，请修改后重试');
      return;
    }

    console.log('[评论组件] 内容审核通过(score:', modResult.score, ')，提交中...');
    setSubmitting(true);

    try {
      userStatsApi.addComment(
        user,
        targetType,
        targetId,
        newComment.trim(),
        showRating && rating > 0 ? rating : undefined,
        replyTo?.id
      );

      setNewComment('');
      setRating(0);
      setReplyTo(null);
      loadComments();
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
    // Scroll to comment form
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const handleDelete = (commentId: string) => {
    if (!user) return;

    if (window.confirm(t.deleteConfirm)) {
      userStatsApi.deleteComment(commentId, user.id);
      loadComments();
    }
  };

  const handleLike = (commentId: string) => {
    if (!user) {
      window.location.href = getAuthLoginHref();
      return;
    }

    userStatsApi.likeComment(commentId, user.id);
    loadComments();
  };

  const renderStars = (interactive: boolean, currentRating: number = 0) => {
    const size = 'w-5 h-5';
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => interactive && setRating(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            disabled={!interactive}
            className={`${size} ${interactive ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'} transition-colors`}
          >
            <svg
              fill={(hoverRating || currentRating) >= value ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              className={interactive ? 'text-gray-300' : (hoverRating || currentRating) >= value ? 'text-yellow-400' : 'text-gray-300'}
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
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-24" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {t.title} ({comments.length})
      </h2>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} id="comment-form" className="mb-8 bg-gray-50 rounded-xl p-4">
          {replyTo && (
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-200">
              <span>{locale === 'zh' ? '回复 @' : 'Reply to @'}{replyTo.name}</span>
              <button
                type="button"
                onClick={handleCancelReply}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
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
          <p className="text-gray-600">
            <a href="/auth/login" className="text-primary-500 hover:underline">
              {t.loginToComment}
            </a>
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t.noComments}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl border border-gray-200 p-4">
              {/* Comment Header */}
              <div className="flex items-start gap-3">
                <img
                  src={comment.userAvatar}
                  alt={comment.userName}
                  className="w-10 h-10 rounded-full bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{comment.userName}</span>
                    <span className="text-sm text-gray-500">
                      {timeAgo(comment.createdAt, locale)}
                    </span>
                  </div>

                  {comment.rating && comment.rating > 0 && (
                    <div className="mt-1">
                      {renderStars(false, comment.rating)}
                    </div>
                  )}

                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.content}</p>

                  {/* Comment Actions */}
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        user && comment.likedBy.includes(user.id)
                          ? 'text-red-500'
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={user && comment.likedBy.includes(user.id) ? 'currentColor' : 'none'}
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
                      <span>{comment.likes}</span>
                    </button>

                    <button
                      onClick={() => handleReply(comment.id, comment.userName)}
                      className="text-sm text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      {t.reply}
                    </button>

                    {user && user.id === comment.userId && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                      >
                        {t.delete}
                      </button>
                    )}
                  </div>

                  {/* Replies Section */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-100">
                      {/* Toggle Replies Button */}
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {expandedReplies.has(comment.id)
                          ? t.hideReplies
                          : `${t.viewReplies} (${comment.replies.length})`}
                      </button>

                      {/* Replies */}
                      {expandedReplies.has(comment.id) && (
                        <div className="mt-3 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                              <img
                                src={reply.userAvatar}
                                alt={reply.userName}
                                className="w-8 h-8 rounded-full bg-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900 text-sm">{reply.userName}</span>
                                  <span className="text-xs text-gray-500">
                                    {timeAgo(reply.createdAt, locale)}
                                  </span>
                                </div>
                                <p className="mt-1 text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                                <div className="mt-2 flex items-center gap-3">
                                  <button
                                    onClick={() => handleLike(reply.id)}
                                    className={`flex items-center gap-1 text-xs transition-colors ${
                                      user && reply.likedBy.includes(user.id)
                                        ? 'text-red-500'
                                        : 'text-gray-500 hover:text-red-500'
                                    }`}
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill={user && reply.likedBy.includes(user.id) ? 'currentColor' : 'none'}
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
                                    <span>{reply.likes}</span>
                                  </button>
                                  {user && user.id === reply.userId && (
                                    <button
                                      onClick={() => handleDelete(reply.id)}
                                      className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                      {t.delete}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
