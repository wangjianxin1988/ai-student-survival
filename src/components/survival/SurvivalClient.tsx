import React, { useState, useMemo } from 'react';
import VirtualCardAd from '@/components/ads/VirtualCardAd';
import SurvivalCard from './SurvivalCard';
import CategoryFilter from './CategoryFilter';
import {
  survivalGuidesData,
  SURVIVAL_CATEGORIES,
  type SurvivalGuide,
  type SurvivalCategory,
} from '@/data/survivalGuides';
import { getLocaleHref } from '@/lib/i18n';

interface SurvivalClientProps {
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    title: '防坑防骗指南',
    subtitle: '留学生生存必备知识分享',
    categories: '分类',
    hot: '热门指南',
    latest: '最新发布',
    allGuides: '全部指南',
    searchPlaceholder: '搜索指南...',
    noResults: '未找到匹配的指南',
    tryAdjust: '试试调整筛选条件',
    viewAll: '查看全部',
    showResults: '显示 {count} 条结果',
    view: '浏览',
  },
  en: {
    title: 'Survival Guides',
    subtitle: 'Essential knowledge for international students',
    categories: 'Categories',
    hot: 'Hot Guides',
    latest: 'Latest',
    allGuides: 'All Guides',
    searchPlaceholder: 'Search guides...',
    noResults: 'No matching guides found',
    tryAdjust: 'Try adjusting your filters',
    viewAll: 'View All',
    showResults: 'Showing {count} results',
    view: 'views',
  },
};

export default function SurvivalClient({ locale = 'zh' }: SurvivalClientProps) {
  const t = translations[locale];
  const [selectedCategory, setSelectedCategory] = useState<SurvivalCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'hot' | 'latest'>('hot');

  const filteredGuides = useMemo(() => {
    let guides = [...survivalGuidesData];

    // Filter by category
    if (selectedCategory !== 'all') {
      guides = guides.filter((g) => g.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      guides = guides.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.titleZh.includes(searchQuery) ||
          g.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortBy === 'hot') {
      guides.sort((a, b) => b.viewCount - a.viewCount);
    } else {
      guides.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return guides;
  }, [selectedCategory, searchQuery, sortBy]);

  const hotGuides = survivalGuidesData
    .filter((g) => g.isHot)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4);

  const latestGuides = [...survivalGuidesData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {t.title}
          </h1>
          <p className="text-primary-100 text-lg">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{locale === 'zh' ? '排序' : 'Sort'}:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'hot' | 'latest')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="hot">🔥 {t.hot}</option>
                    <option value="latest">🕐 {t.latest}</option>
                  </select>
                </div>
              </div>

              {/* Category Filter */}
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                locale={locale}
              />
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-500">
              {t.showResults.replace('{count}', filteredGuides.length.toString())}
            </div>

            {/* Guides Grid */}
            {filteredGuides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGuides.map((guide, index) => (
                <React.Fragment key={guide.id}>
                  {index > 0 && index % 5 === 0 && (
                    <div className="col-span-full">
                      <VirtualCardAd variant="auto" index={index} locale={locale} />
                    </div>
                  )}
                  <SurvivalCard guide={guide} locale={locale} />
                </React.Fragment>
              ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t.noResults}
                </h3>
                <p className="text-gray-500">{t.tryAdjust}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hot Guides */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🔥 {t.hot}
              </h3>
              <div className="space-y-3">
                {hotGuides.map((guide) => (
                  <a
                    key={guide.id}
                    href={getLocaleHref(`/survival/${guide.id}`, locale)}
                    className="block group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{(SURVIVAL_CATEGORIES as any)[guide.category]?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2">
                          {locale === 'zh' ? guide.titleZh : guide.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          ⭐ {guide.rating.toFixed(1)} · {guide.viewCount.toLocaleString()} {t.view}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Latest Guides */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🕐 {t.latest}
              </h3>
              <div className="space-y-3">
                {latestGuides.map((guide) => (
                  <a
                    key={guide.id}
                    href={getLocaleHref(`/survival/${guide.id}`, locale)}
                    className="block group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{(SURVIVAL_CATEGORIES as any)[guide.category]?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 line-clamp-2">
                          {locale === 'zh' ? guide.titleZh : guide.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(guide.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-sm p-4 text-white">
              <h3 className="text-lg font-semibold mb-4">
                {locale === 'zh' ? '数据统计' : 'Statistics'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">{survivalGuidesData.length}</p>
                  <p className="text-sm text-primary-100">{locale === 'zh' ? '指南总数' : 'Total Guides'}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {survivalGuidesData.filter((g) => g.isHot).length}
                  </p>
                  <p className="text-sm text-primary-100">{t.hot}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {survivalGuidesData.reduce((sum, g) => sum + g.viewCount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-primary-100">{locale === 'zh' ? '总浏览' : 'Total Views'}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {survivalGuidesData.reduce((sum, g) => sum + g.ratingCount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-primary-100">{locale === 'zh' ? '总评分' : 'Total Ratings'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
