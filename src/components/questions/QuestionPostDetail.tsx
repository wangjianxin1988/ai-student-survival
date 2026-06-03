import React, { useState, useEffect, useCallback } from 'react';
import type { CommunityPost, PostComment } from '@/lib/community/types';
import { getAuthHeaders } from '@/lib/auth';
import { isDemoMode } from '@/lib/supabase';
import { MentionInput } from '@/components/ui/MentionInput';

interface QuestionPostDetailProps {
  postId: string;
  locale?: 'zh' | 'en';
}

// Unified user detection: demo session + Supabase localStorage session
function getCurrentClientUser(): { id: string; email: string; name?: string; avatar?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const demoRaw = sessionStorage.getItem('demo_session');
    if (demoRaw) {
      const d = JSON.parse(demoRaw);
      if (d && d.id) return { id: d.id, email: d.email || '', name: d.name, avatar: d.avatar };
    }
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
  academic: '学业问题',
  life: '日常生活',
  visa: '签证身份',
  job: '求职就业',
  policy: '政策问题',
  payment: '支付问题',
  ai_tools: 'AI工具',
  study_life: '学习生活',
  job_recruitment: '求职招聘',
  other: '其他',
  discussion: '讨论',
  qa: '问答',
};

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'bg-orange-100 text-orange-700',
  life: 'bg-green-100 text-green-700',
  visa: 'bg-blue-100 text-blue-700',
  job: 'bg-indigo-100 text-indigo-700',
  policy: 'bg-purple-100 text-purple-700',
  payment: 'bg-emerald-100 text-emerald-700',
  ai_tools: 'bg-cyan-100 text-cyan-700',
  study_life: 'bg-rose-100 text-rose-700',
  job_recruitment: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
  discussion: 'bg-gray-100 text-gray-700',
  qa: 'bg-orange-100 text-orange-700',
};

const translations = {
  zh: {
    backToQuestions: '返回问题列表',
    answers: '回答',
    noAnswers: '暂无回答',
    beFirstToAnswer: '成为第一个回答的人',
    writeAnswer: '撰写回答',
    submitAnswer: '提交回答',
    answerPlaceholder: '写下你的回答...',
    views: '浏览',
    resolved: '已解决',
    unresolved: '待解决',
    comment: '评论',
    noComments: '暂无评论',
    commentPlaceholder: '写下你的评论...',
    postComment: '发布评论',
    loginToComment: '登录后可发表评论',
    commentSubmitted: '评论已发布！',
  },
  en: {
    backToQuestions: 'Back to Questions',
    answers: 'Answers',
    noAnswers: 'No answers yet',
    beFirstToAnswer: 'Be the first to answer',
    writeAnswer: 'Write an answer',
    submitAnswer: 'Submit Answer',
    answerPlaceholder: 'Write your answer...',
    views: 'views',
    resolved: 'Resolved',
    unresolved: 'Unresolved',
    comment: 'Comment',
    noComments: 'No comments',
    commentPlaceholder: 'Write your comment...',
    postComment: 'Post Comment',
    loginToComment: 'Login to comment',
    commentSubmitted: 'Comment posted!',
  },
};

function calculateScore(post: CommunityPost): number {
  return (post.likesCount || 0) * 1 + (post.commentsCount || 0) * 2 + (post.favoritesCount || 0) * 3;
}

export default function QuestionPostDetail({ postId, locale = 'zh' }: QuestionPostDetailProps) {
  const t = translations[locale];
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [commentSort, setCommentSort] = useState<'latest' | 'popular'>('latest');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [commentLikesCount, setCommentLikesCount] = useState<Record<string, number>>({});
  const [clientUserId, setClientUserId] = useState<string | undefined>(undefined);

  // Poll for session changes
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

  const fetchPost = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (clientUserId) params.set('userId', clientUserId);
      const url = `/api/questions/${postId}${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPost(data.data);
        setLiked(data.data.isLiked || false);
        setFavorited(data.data.isFavorited || false);
        setLikesCount(data.data.likesCount || 0);
        setFavoritesCount(data.data.favoritesCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, clientUserId]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/questions/${postId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleLike = async () => {
    if (!clientUserId) return;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    if (isDemoMode()) return;
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/questions/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      const data = await response.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikesCount(data.data.likesCount ?? likesCount);
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleFavorite = async () => {
    if (!clientUserId) return;
    setFavorited(!favorited);
    setFavoritesCount(favorited ? favoritesCount - 1 : favoritesCount + 1);
    if (isDemoMode()) return;
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/questions/${postId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      const data = await response.json();
      if (data.success) {
        setFavorited(data.data.favorited);
        setFavoritesCount(data.data.favoritesCount ?? favoritesCount);
      }
    } catch (error) {
      console.error('Failed to favorite:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientUserId || !commentContent.trim()) return;
    setSubmitting(true);

    const currentUser = getCurrentClientUser();
    const tempComment: PostComment = {
      id: 'temp-' + Date.now(),
      postId,
      userId: clientUserId,
      userName: currentUser?.name || '你',
      userAvatar: '',
      content: commentContent,
      likes: 0,
      likesCount: 0,
      parentId: replyTo?.id || null,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, tempComment]);
    setCommentContent('');
    setReplyTo(null);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);

    if (isDemoMode()) {
      setSubmitting(false);
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/questions/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ content: commentContent, parentId: replyTo?.id || null }),
      });
      const data = await response.json();
      if (data.success) {
        setComments(prev => [...prev.slice(0, -1), data.data]);
        if (post) {
          setPost({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
        }
      }
    } catch (error) {
      console.error('Failed to comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!clientUserId) return;
    const wasLiked = commentLikes[commentId] || false;
    const prevCount = commentLikesCount[commentId] || 0;
    setCommentLikes(prev => ({ ...prev, [commentId]: !wasLiked }));
    setCommentLikesCount(prev => ({ ...prev, [commentId]: wasLiked ? prevCount - 1 : prevCount + 1 }));
    if (isDemoMode()) return;
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/community/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      const data = await response.json();
      if (data.success) {
        setCommentLikes(prev => ({ ...prev, [commentId]: data.data.liked }));
        setCommentLikesCount(prev => ({ ...prev, [commentId]: data.data.likesCount ?? prevCount }));
      }
    } catch {
      setCommentLikes(prev => ({ ...prev, [commentId]: wasLiked }));
      setCommentLikesCount(prev => ({ ...prev, [commentId]: prevCount }));
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/questions/${postId}`;
    const platform = navigator.share ? 'native' : 'copy_link';

    const showToast = (msg: string) => {
      const toast = document.createElement('div');
      toast.textContent = msg;
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 16px;border-radius:8px;font-size:14px;z-index:9999;pointer-events:none;opacity:1;transition:opacity 0.3s;';
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
    };

    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title, text: post?.content?.substring(0, 100), url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('链接已复制到剪贴板');
      }

      // Record share via API (fire-and-forget)
      if (!isDemoMode() && clientUserId) {
        getAuthHeaders().then(headers => {
          fetch('/api/content-shares', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({
              target_type: 'question',
              target_id: postId,
              platform,
            }),
          }).catch(() => {});
        });
      }
    } catch {
      // User cancelled or error
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">问题未找到</h1>
          <a href="/questions" className="text-primary-600 hover:text-primary-700">返回问题列表</a>
        </div>
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[post.category] || CATEGORY_COLORS.other;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/questions" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToQuestions}
          </a>

          <div className="flex items-start gap-4">
            {/* Stats sidebar */}
            <div className="flex flex-col items-center gap-2 min-w-[80px] text-center">
              <div className="text-2xl font-bold text-gray-600">{comments.length}</div>
              <div className="text-sm text-gray-500">{t.answers}</div>
            </div>

            <div className="flex-1">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${categoryColor} text-xs font-medium`}>
                  {CATEGORY_LABELS[post.category] || post.category}
                </span>
                <span className="text-gray-500">{post.viewsCount} {t.views}</span>
                <div className="flex items-center gap-2">
                  {post.userAvatar && (
                    <img src={post.userAvatar} alt={post.userName} className="w-5 h-5 rounded-full" />
                  )}
                  <a href={`/user/${post.userId || ''}`} className="text-gray-700 hover:text-primary-600 transition-colors">
                    {post.userName || '匿名用户'}
                  </a>
                </div>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{formatDate(post.createdAt)}</span>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Question content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{post.content}</p>
          </div>
        </div>

        {/* AI Summary for closed/locked posts */}
        {post.isLocked && (
          <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                  AI 摘要
                  <span className="text-xs font-normal text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">
                    自动生成
                  </span>
                </h4>
                {post.aiSummary ? (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {post.aiSummary}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    AI摘要生成中...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons: like, favorite, share */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={handleLike}
            disabled={!clientUserId}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              liked
                ? 'bg-red-50 text-red-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likesCount} 点赞
          </button>

          <button
            onClick={handleFavorite}
            disabled={!clientUserId}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              favorited
                ? 'bg-yellow-50 text-yellow-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {favoritesCount} 收藏
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享
          </button>
        </div>

        {/* Heat progress */}
        {post.category !== 'discussion' && post.category !== 'qa' && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">热度进度</span>
              <span className="text-sm font-medium text-gray-900">
                {calculateScore(post)} / 10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (calculateScore(post) / 10) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              点赞×1 + 评论×2 + 收藏×3 = 热度评分，≥10分自动推送
            </p>
          </div>
        )}

        {/* Answers/Comments section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t.answers} ({comments.length})
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setCommentSort('latest')} className={`px-3 py-1 rounded-full transition-colors ${commentSort === 'latest' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>最新</button>
              <button onClick={() => setCommentSort('popular')} className={`px-3 py-1 rounded-full transition-colors ${commentSort === 'popular' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>最热</button>
            </div>
          </div>

          {/* Organize: top-level + replies */}
          {(() => {
            const topLevel = comments.filter(c => !(c as any).parentId);
            const repliesMap: Record<string, PostComment[]> = {};
            comments.forEach(c => {
              const pid = (c as any).parentId;
              if (pid) {
                if (!repliesMap[pid]) repliesMap[pid] = [];
                repliesMap[pid].push(c);
              }
            });
            const sorted = [...topLevel].sort((a, b) => {
              if (commentSort === 'popular') {
                return (commentLikesCount[b.id] ?? (b as any).likesCount ?? 0) - (commentLikesCount[a.id] ?? (a as any).likesCount ?? 0);
              }
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            return sorted.length > 0 ? (
              <div className="space-y-4 mb-8">
                {sorted.map((comment) => {
                  const cLikes = commentLikesCount[comment.id] ?? (comment as any).likesCount ?? 0;
                  const cLiked = commentLikes[comment.id] || false;
                  const replies = repliesMap[comment.id] || [];
                  const authorName = comment.userName || '匿名用户';
                  const authorId = comment.userId;
                  return (
                    <div key={comment.id} className="space-y-2">
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {comment.userAvatar && (
                            <img src={comment.userAvatar} alt={authorName} className="w-5 h-5 rounded-full" />
                          )}
                          <a href={`/user/${authorId}`} className="font-medium text-gray-900 text-sm hover:text-primary-600 transition-colors">
                            {authorName}
                          </a>
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button onClick={() => handleCommentLike(comment.id)} disabled={!clientUserId} className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${cLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                            <svg className="w-4 h-4" fill={cLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {cLikes > 0 ? cLikes : '赞'}
                          </button>
                          <button onClick={() => { if (!clientUserId) return; setReplyTo({ id: comment.id, name: authorName }); setCommentContent(''); }} disabled={!clientUserId} className="text-gray-500 hover:text-blue-500 transition-colors disabled:opacity-50">回复</button>
                        </div>
                      </div>
                      {replies.length > 0 && (
                        <div className="ml-8 space-y-2">
                          {replies.map((reply) => {
                            const rLikes = commentLikesCount[reply.id] ?? (reply as any).likesCount ?? 0;
                            const rLiked = commentLikes[reply.id] || false;
                            const replyAuthorName = reply.userName || '匿名用户';
                            const replyAuthorId = reply.userId;
                            return (
                              <div key={reply.id} className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <a href={`/user/${replyAuthorId}`} className="font-medium text-gray-900 text-sm hover:text-primary-600 transition-colors">
                                    {replyAuthorName}
                                  </a>
                                  <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                                <button onClick={() => handleCommentLike(reply.id)} disabled={!clientUserId} className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${rLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                                  <svg className="w-3.5 h-3.5" fill={rLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {rLikes > 0 ? rLikes : '赞'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mb-8">
                <p className="text-gray-600 mb-2">{t.noAnswers}</p>
                <p className="text-gray-500 text-sm">{t.beFirstToAnswer}</p>
              </div>
            );
          })()}

          {/* Comment form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                {t.commentSubmitted}
              </div>
            )}

            {clientUserId ? (
              <form onSubmit={handleComment}>
                {replyTo && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-blue-600">
                    <span>回复 @{replyTo.name}</span>
                    <button type="button" onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{replyTo ? '回复' : t.writeAnswer}</h3>
                <MentionInput
                  value={commentContent}
                  onChange={(val) => setCommentContent(val)}
                  placeholder={replyTo ? `回复 @${replyTo.name}...` : t.answerPlaceholder + '（输入 @ 可提及用户）'}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={submitting || !commentContent.trim()}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? '提交中...' : (replyTo ? '回复' : t.submitAnswer)}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600 text-sm">
                {t.loginToComment}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
