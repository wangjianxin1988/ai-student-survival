import React, { useState, useMemo, useEffect, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import {
  questionsData,
  filterQuestions,
  sortQuestions,
  getHotQuestions,
  getUnansweredQuestions,
  type Question,
  type QuestionCategory,
  QUESTION_CATEGORIES,
} from '@/data/questions';
import { CommunityFeed, PostCard } from '@/components/community';
import type { CommunityPost } from '@/lib/community/types';
import { getCurrentLocale, getLocaleHref } from '@/lib/i18n';
import { getAuthHeaders } from '@/lib/auth';

interface QuestionsClientProps {
  locale?: 'zh' | 'en';
}

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

export default function QuestionsClient({ locale = 'zh' }: QuestionsClientProps) {
  const t = translations[locale];
  const currentLocale = locale || getCurrentLocale();
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'hottest' | 'unanswered'>('newest');
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'unanswered' | 'community'>('all');

  // Real-time community posts
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityPostsLoading, setCommunityPostsLoading] = useState(false);

  // Client-side user detection for PostCard interactions
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

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

  // Fetch real-time community posts
  const fetchCommunityPosts = useCallback(async () => {
    setCommunityPostsLoading(true);
    try {
      const params = new URLSearchParams({
        sort: sortBy === 'hottest' ? 'popular' : 'latest',
        limit: '20',
        offset: '0',
      });
      if (selectedCategory) {
        // Map static question categories to community categories
        const categoryMap: Record<string, string> = {
          academic: 'qa',
          life: 'discussion',
          visa: 'qa',
          job: 'qa',
          policy: 'policy',
          payment: 'payment',
          ai_tools: 'tools',
          study_life: 'discussion',
          job_recruitment: 'discussion',
          other: 'discussion',
        };
        const communityCat = categoryMap[selectedCategory];
        if (communityCat) {
          params.set('category', communityCat);
        }
      }
      const res = await fetch(`/api/community?${params}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCommunityPosts(data.data);
      } else {
        setCommunityPosts([]);
      }
    } catch {
      setCommunityPosts([]);
    } finally {
      setCommunityPostsLoading(false);
    }
  }, [sortBy, selectedCategory]);

  useEffect(() => {
    if (activeTab !== 'community') {
      fetchCommunityPosts();
    }
  }, [activeTab, fetchCommunityPosts]);

  // Determine if a community post maps to the selected category
  const categoryToCommunityCat: Record<string, string> = {
    academic: 'qa',
    life: 'discussion',
    visa: 'qa',
    job: 'qa',
    policy: 'policy',
    payment: 'payment',
    ai_tools: 'tools',
    study_life: 'discussion',
    job_recruitment: 'discussion',
    other: 'discussion',
  };

  const filteredCommunityPosts = useMemo(() => {
    if (activeTab === 'community') return [];
    if (activeTab === 'hot') {
      return communityPosts
        .filter(p => (p.likesCount + p.commentsCount * 2 + p.favoritesCount * 3) >= 5)
        .slice(0, 5);
    }
    if (activeTab === 'unanswered') {
      return communityPosts.filter(p => p.commentsCount === 0);
    }
    if (selectedCategory) {
      const cat = categoryToCommunityCat[selectedCategory];
      return communityPosts.filter(p => p.category === cat);
    }
    // Show latest 5 community posts at the top for 'all' tab
    return communityPosts.slice(0, 5);
  }, [communityPosts, activeTab, selectedCategory]);

  // Filter and sort static questions
  const filteredQuestions = useMemo(() => {
    if (activeTab === 'hot') {
      return getHotQuestions(5);
    }
    if (activeTab === 'unanswered') {
      return getUnansweredQuestions();
    }

    let questions = filterQuestions({
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
    });

    return sortQuestions(questions, sortBy);
  }, [selectedCategory, searchQuery, sortBy, activeTab]);

  // Merge static questions with real community posts for display
  const mergedQuestions = useMemo(() => {
    if (activeTab === 'community') return [];

    // Real posts as "virtual" questions
    const communityAsQuestions: (Question & { _isCommunityPost: true; _post: CommunityPost })[] =
      filteredCommunityPosts.map(post => ({
        id: `community-${post.id}`,
        title: post.title,
        titleZh: post.title,
        content: post.content,
        contentZh: post.content,
        category: 'other' as QuestionCategory,
        authorName: post.userName,
        authorAvatar: post.userAvatar,
        isAnonymous: false,
        viewCount: post.viewsCount,
        answerCount: post.commentsCount,
        isResolved: false,
        tags: post.tags,
        createdAt: post.createdAt,
        _isCommunityPost: true,
        _post: post,
      }));

    if (activeTab === 'all') {
      return [...communityAsQuestions, ...filteredQuestions];
    }
    // For hot/unanswered: interleave
    const result: (typeof communityAsQuestions[0] | Question)[] = [];
    const maxLen = Math.max(communityAsQuestions.length, filteredQuestions.length);
    for (let i = 0; i < maxLen; i++) {
      if (communityAsQuestions[i]) result.push(communityAsQuestions[i]);
      if (filteredQuestions[i]) result.push(filteredQuestions[i]);
    }
    return result;
  }, [activeTab, filteredQuestions, filteredCommunityPosts]);

  // Get hot and unanswered counts
  const hotQuestions = useMemo(() => getHotQuestions(5), []);
  const unresolvedQuestions = useMemo(() => getUnansweredQuestions(), []);

  const categories = Object.entries(QUESTION_CATEGORIES) as [QuestionCategory, typeof QUESTION_CATEGORIES[QuestionCategory]][];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          {/* Search bar — hidden in community tab */}
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
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {hotQuestions.length}
                  </span>
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
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {unresolvedQuestions.length}
                  </span>
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

            {/* Categories — hidden in community tab (CommunityFeed has its own filter) */}
            {activeTab !== 'community' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
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

          {/* Questions list */}
          <div className="flex-1">
            {/* Sort controls — only show for Q&A tabs */}
            {activeTab !== 'community' && activeTab === 'all' && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {t.results.replace('{count}', String(mergedQuestions.length))}
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

            {/* Questions or Community Feed */}
            <div className="space-y-4">
              {activeTab === 'community' ? (
                <CommunityFeed locale={locale} />
              ) : communityPostsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-500">加载社区帖子...</span>
                </div>
              ) : mergedQuestions.length > 0 ? (
                mergedQuestions.map((item) => {
                  if ('_isCommunityPost' in item && item._isCommunityPost) {
                    const post = item._post;
                    return (
                      <PostCard
                        key={item.id}
                        post={post}
                        currentUserId={currentUserId}
                        onClick={(postId) => {
                          window.location.href = `/community/${postId}`;
                        }}
                        onLike={async (postId) => {
                          if (!currentUserId) return;
                          // Optimistic update
                          setCommunityPosts(prev => prev.map(p => {
                            if (p.id !== postId) return p;
                            return { ...p, isLiked: !p.isLiked, likesCount: (p.likesCount || 0) + (p.isLiked ? -1 : 1) };
                          }));
                          try {
                            const headers = await getAuthHeaders();
                            await fetch(`/api/community/${postId}/like`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', ...headers },
                            });
                          } catch {}
                        }}
                        onFavorite={async (postId) => {
                          if (!currentUserId) return;
                          // Optimistic update
                          setCommunityPosts(prev => prev.map(p => {
                            if (p.id !== postId) return p;
                            return { ...p, isFavorited: !p.isFavorited, favoritesCount: (p.favoritesCount || 0) + (p.isFavorited ? -1 : 1) };
                          }));
                          try {
                            const headers = await getAuthHeaders();
                            await fetch(`/api/community/${postId}/favorite`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', ...headers },
                            });
                          } catch {}
                        }}
                      />
                    );
                  }
                  return (
                    <QuestionCard
                      key={item.id}
                      question={item}
                      locale={locale}
                    />
                  );
                })
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
