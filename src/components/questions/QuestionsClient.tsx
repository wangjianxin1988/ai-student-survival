import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PostCard } from '@/components/community';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import type { CommunityPost } from '@/lib/community/types';
import { QUESTION_CATEGORIES, type QuestionCategory } from '@/data/questions';
import { getAuthHeaders } from '@/lib/auth';

interface QuestionsClientProps {
  locale?: 'zh' | 'en';
}

const PAGE_SIZE = 10; // items per API fetch
const CARD_ESTIMATED_HEIGHT = 160; // fallback card height in px before measurement

const translations = {
  zh: {
    title: '留学生问答社区',
    subtitle: '有问题？来这里找答案或帮助其他同学',
    searchPlaceholder: '搜索问题...',
    allCategories: '全部分类',
    filters: '筛选',
    sortBy: '排序',
    newest: '最新',
    hottest: '最热',
    unresolved: '待解决',
    hotQuestions: '热门问题',
    unresolvedQuestions: '待解决问题',
    allQuestions: '全部问题',
    communityPosts: '社区动态',
    noResults: '没有找到相关问题',
    askQuestion: '提问',
    results: '显示 {count} 个问题',
    categories: {
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
    },
  },
  en: {
    title: 'Q&A Community',
    subtitle: 'Have questions? Find answers here or help other students',
    searchPlaceholder: 'Search questions...',
    allCategories: 'All Categories',
    filters: 'Filter',
    sortBy: 'Sort',
    newest: 'Newest',
    hottest: 'Hottest',
    unresolved: 'Unresolved',
    hotQuestions: 'Hot Questions',
    unresolvedQuestions: 'Unresolved Questions',
    allQuestions: 'All Questions',
    communityPosts: 'Community Posts',
    noResults: 'No questions found',
    askQuestion: 'Ask Question',
    results: 'Showing {count} questions',
    categories: {
      academic: 'Academic',
      life: 'Life',
      visa: 'Visa',
      job: 'Job',
      policy: 'Policy',
      payment: 'Payment',
      ai_tools: 'AI Tools',
      study_life: 'Study Life',
      job_recruitment: 'Job Recruitment',
      other: 'Other',
    },
  },
};

// Fetch user interactions (likes + favorites) for a list of posts
async function fetchMyInteractions(postIds: string[]): Promise<{ likes: Set<string>; favorites: Set<string> }> {
  if (postIds.length === 0) return { likes: new Set(), favorites: new Set() };
  try {
    const params = new URLSearchParams();
    postIds.forEach(id => params.append('postId', id));
    const res = await fetch(`/api/community/my-interactions?${params}`);
    const data = await res.json();
    if (data.success) {
      return {
        likes: new Set(data.data.likes || []),
        favorites: new Set(data.data.favorites || []),
      };
    }
  } catch (e) {
    console.error('[QuestionsClient] Failed to fetch interactions:', e);
  }
  return { likes: new Set(), favorites: new Set() };
}

export default function QuestionsClient({ locale = 'zh' }: QuestionsClientProps) {
  const t = translations[locale];
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'hottest' | 'unanswered'>('newest');
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'unanswered' | 'community'>('all');

  // Viewport-aware pagination state
  const [qaAllPosts, setQaAllPosts] = useState<CommunityPost[]>([]);
  const [commAllPosts, setCommAllPosts] = useState<CommunityPost[]>([]);
  const [qaOffset, setQaOffset] = useState(0);
  const [commOffset, setCommOffset] = useState(0);
  const [qaTotal, setQaTotal] = useState(0);
  const [commTotal, setCommTotal] = useState(0);
  const [hasMoreQa, setHasMoreQa] = useState(true);
  const [hasMoreComm, setHasMoreComm] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const measuredRef = useRef(false);
  const viewportCountRef = useRef(PAGE_SIZE);

  // Client-side user detection
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // Session detection
  useEffect(() => {
    const checkSession = () => {
      if (typeof window === 'undefined') return;
      try {
        const demoRaw = sessionStorage.getItem('demo_session');
        if (demoRaw) {
          const d = JSON.parse(demoRaw);
          if (d && d.id) { setCurrentUserId(d.id); return; }
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
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload.sub) { setCurrentUserId(payload.sub); return; }
          } catch { /* skip */ }
        }
      } catch {}
      setCurrentUserId(undefined);
    };
    checkSession();
    const interval = setInterval(checkSession, 500);
    return () => clearInterval(interval);
  }, []);

  // Measure viewport to compute how many cards to show
  const measureViewport = useCallback(() => {
    if (measuredRef.current || typeof window === 'undefined') return;
    measuredRef.current = true;
    const card = document.querySelector('[data-post-card]');
    if (card) {
      const cardHeight = card.getBoundingClientRect().height;
      const gap = 16; // space-y-4 = 16px
      const viewportH = window.innerHeight;
      const count = Math.max(1, Math.floor((viewportH * 0.6) / (cardHeight + gap)));
      viewportCountRef.current = Math.max(PAGE_SIZE, count);
    }
  }, []);

  // Fetch one page of Q&A posts
  const fetchQaPage = useCallback(async (offset: number, limit: number, reset = false) => {
    const params = new URLSearchParams({
      sort: sortBy === 'hottest' ? 'popular' : 'latest',
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (selectedCategory) params.set('category', selectedCategory);
    if (currentUserId) params.set('userId', currentUserId);
    const res = await fetch(`/api/questions?${params}`);
    const data = await res.json();
    if (data.success) {
      let posts = data.data as CommunityPost[];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        posts = posts.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      const newTotal = data.meta?.total || 0;
      if (reset) {
        setQaAllPosts(posts);
      } else {
        setQaAllPosts(prev => [...prev, ...posts]);
      }
      setQaTotal(newTotal);
      setHasMoreQa(offset + posts.length < newTotal);
    }
    return data;
  }, [sortBy, selectedCategory, currentUserId, searchQuery]);

  // Fetch one page of community posts (non-Q&A categories)
  const fetchCommPage = useCallback(async (offset: number, limit: number, reset = false) => {
    const params = new URLSearchParams({
      sort: sortBy === 'hottest' ? 'popular' : 'latest',
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (selectedCategory) {
      const categoryMap: Record<string, string> = {
        academic: 'qa', life: 'discussion', visa: 'qa', job: 'qa',
        policy: 'policy', payment: 'payment', ai_tools: 'tools',
        study_life: 'discussion', job_recruitment: 'discussion', other: 'discussion',
      };
      const communityCat = categoryMap[selectedCategory];
      if (communityCat) params.set('category', communityCat);
    }
    const res = await fetch(`/api/community?${params}`);
    const data = await res.json();
    if (data.success) {
      const QNA_CATS = new Set(['academic', 'life', 'visa', 'job', 'study_life', 'job_recruitment', 'policy', 'payment', 'other']);
      const nonQnaPosts = (data.data as CommunityPost[]).filter(p => !QNA_CATS.has(p.category));
      const postIds = nonQnaPosts.map(p => p.id);
      const { likes, favorites } = await fetchMyInteractions(postIds);
      const postsWithState = nonQnaPosts.map(p => ({
        ...p,
        isLiked: likes.has(p.id),
        isFavorited: favorites.has(p.id),
      }));
      const newTotal = data.meta?.total || 0;
      if (reset) {
        setCommAllPosts(postsWithState);
      } else {
        setCommAllPosts(prev => [...prev, ...postsWithState]);
      }
      setCommTotal(newTotal);
      setHasMoreComm(offset + postsWithState.length < newTotal);
    }
    return data;
  }, [sortBy, selectedCategory]);

  // Initial load + reset on filter change
  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    measuredRef.current = false;
    viewportCountRef.current = PAGE_SIZE;
    setQaOffset(0);
    setCommOffset(0);
    await Promise.all([
      fetchQaPage(0, PAGE_SIZE, true),
      fetchCommPage(0, PAGE_SIZE, true),
    ]);
    setInitialLoading(false);
    // Measure after render
    setTimeout(measureViewport, 100);
  }, [fetchQaPage, fetchCommPage, measureViewport]);

  useEffect(() => {
    if (activeTab === 'community') return;
    loadInitial();
  }, [activeTab, loadInitial]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (activeTab === 'community') return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          const qaCanLoad = hasMoreQa && (activeTab === 'all' || activeTab === 'hot' || activeTab === 'unanswered');
          const commCanLoad = hasMoreComm && activeTab === 'all';
          if (!qaCanLoad && !commCanLoad) return;
          setLoadingMore(true);
          Promise.all([
            qaCanLoad ? fetchQaPage(qaOffset, PAGE_SIZE) : Promise.resolve(),
            commCanLoad ? fetchCommPage(commOffset, PAGE_SIZE) : Promise.resolve(),
          ]).then(([qaRes, commRes]) => {
            if (qaRes?.success) setQaOffset(prev => prev + PAGE_SIZE);
            if (commRes?.success) setCommOffset(prev => prev + PAGE_SIZE);
            setLoadingMore(false);
          });
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [activeTab, hasMoreQa, hasMoreComm, loadingMore, qaOffset, commOffset, fetchQaPage, fetchCommPage]);

  // Update offsets after load
  useEffect(() => {
    setQaOffset(qaAllPosts.length);
  }, [qaAllPosts]);
  useEffect(() => {
    setCommOffset(commAllPosts.length);
  }, [commAllPosts]);

  // Filtered Q&A posts by tab
  const filteredQaPosts = useMemo(() => {
    if (activeTab === 'community') return [];
    if (activeTab === 'hot') {
      return qaAllPosts
        .filter(p => (p.likesCount + p.commentsCount * 2 + p.favoritesCount * 3) >= 5)
        .slice(0, 10);
    }
    if (activeTab === 'unanswered') {
      return qaAllPosts.filter(p => p.commentsCount === 0);
    }
    return qaAllPosts;
  }, [qaAllPosts, activeTab]);

  // Merged list for "all" tab: interleave Q&A + community posts
  const mergedPosts = useMemo(() => {
    if (activeTab === 'community') return [];
    if (activeTab !== 'all') return filteredQaPosts;
    const result: CommunityPost[] = [];
    const maxLen = Math.max(filteredQaPosts.length, commAllPosts.length);
    for (let i = 0; i < maxLen; i++) {
      if (filteredQaPosts[i]) result.push(filteredQaPosts[i]);
      if (commAllPosts[i]) result.push(commAllPosts[i]);
    }
    return result;
  }, [activeTab, filteredQaPosts, commAllPosts]);

  const hotCount = useMemo(() =>
    qaAllPosts.filter(p => (p.likesCount + p.commentsCount * 2 + p.favoritesCount * 3) >= 5).length,
    [qaAllPosts]);
  const unansweredCount = useMemo(() =>
    qaAllPosts.filter(p => p.commentsCount === 0).length,
    [qaAllPosts]);

  const categories = Object.entries(QUESTION_CATEGORIES) as [QuestionCategory, typeof QUESTION_CATEGORIES[QuestionCategory]][];

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;
    // Optimistic update on both lists
    const toggleLike = (p: CommunityPost) =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likesCount: (p.likesCount || 0) + (p.isLiked ? -1 : 1) }
        : p;
    setQaAllPosts(prev => prev.map(toggleLike));
    setCommAllPosts(prev => prev.map(toggleLike));
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/questions/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      const data = await res.json();
      if (!data.success) {
        const revert = (p: CommunityPost) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likesCount: (p.likesCount || 0) + (p.isLiked ? -1 : 1) }
            : p;
        setQaAllPosts(prev => prev.map(revert));
        setCommAllPosts(prev => prev.map(revert));
      }
    } catch {}
  };

  const handleFavorite = async (postId: string) => {
    if (!currentUserId) return;
    const toggleFav = (p: CommunityPost) =>
      p.id === postId
        ? { ...p, isFavorited: !p.isFavorited, favoritesCount: (p.favoritesCount || 0) + (p.isFavorited ? -1 : 1) }
        : p;
    setQaAllPosts(prev => prev.map(toggleFav));
    setCommAllPosts(prev => prev.map(toggleFav));
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/questions/${postId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      const data = await res.json();
      if (!data.success) {
        const revert = (p: CommunityPost) =>
          p.id === postId
            ? { ...p, isFavorited: !p.isFavorited, favoritesCount: (p.favoritesCount || 0) + (p.isFavorited ? -1 : 1) }
            : p;
        setQaAllPosts(prev => prev.map(revert));
        setCommAllPosts(prev => prev.map(revert));
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          {/* Search bar */}
          {activeTab !== 'community' && (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Ask button */}
          <div className="flex justify-center">
            <a
              href="/questions/ask"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.askQuestion}
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t.allQuestions}
                </button>
                <button
                  onClick={() => setActiveTab('hot')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    activeTab === 'hot'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{t.hotQuestions}</span>
                  {hotCount > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {hotCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('unanswered')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    activeTab === 'unanswered'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{t.unresolvedQuestions}</span>
                  {unansweredCount > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {unansweredCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'community'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t.communityPosts}
                </button>
              </nav>
            </div>

            {/* Categories */}
            {activeTab !== 'community' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.filters}</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === null
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t.allCategories}
                  </button>
                  {categories.map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        selectedCategory === key
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{locale === 'zh' ? cat.label : cat.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Browse More Links */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">浏览更多</h3>
              <div className="space-y-1">
                <a href="/tools" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                  <span>🤖</span>
                  <span>AI工具库</span>
                </a>
                <a href="/survival" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                  <span>⚠️</span>
                  <span>防坑指南</span>
                </a>
                <a href="/policies" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                  <span>📋</span>
                  <span>大学政策</span>
                </a>
                <a href="/offers" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                  <span>🎓</span>
                  <span>留学生Offers</span>
                </a>
                <a href="/prompts" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                  <span>💡</span>
                  <span>Prompt模板</span>
                </a>
              </div>
            </div>
          </div>

          {/* Posts list */}
          <div className="flex-1">
            {/* Sort controls */}
            {activeTab !== 'community' && activeTab === 'all' && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {t.results.replace('{count}', String(mergedPosts.length))}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{t.sortBy}:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="newest">{t.newest}</option>
                    <option value="hottest">{t.hottest}</option>
                    <option value="unanswered">{t.unresolved}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Posts or Community Feed */}
            <div className="space-y-4">
              {activeTab === 'community' ? (
                <CommunityFeed locale={locale} />
              ) : initialLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-500">加载中...</span>
                </div>
              ) : mergedPosts.length > 0 ? (
                <>
                  {mergedPosts.map((post) => (
                    <div key={post.id} data-post-card>
                      <PostCard
                        post={post}
                        currentUserId={currentUserId}
                        onLike={handleLike}
                        onFavorite={handleFavorite}
                      />
                    </div>
                  ))}
                  {/* Sentinel for IntersectionObserver */}
                  <div ref={sentinelRef} className="h-4" />
                  {loadingMore && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                  {!hasMoreQa && !hasMoreComm && mergedPosts.length > 0 && (
                    <p className="text-center text-sm text-gray-400 py-4">— 已加载全部 {mergedPosts.length} 条内容 —</p>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-600">{t.noResults}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
