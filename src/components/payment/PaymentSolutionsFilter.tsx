import React, { useState, useMemo } from 'react';
import type { PaymentSolutionData } from '@/data/paymentSolutions';
import { getLocaleHref } from '@/lib/i18n';
import VirtualCardAd from '@/components/ads/VirtualCardAd';

interface Props {
  solutions: PaymentSolutionData[];
  locale?: 'zh' | 'en';
}

const categoryConfig = {
  virtual_card: { icon: '💳', labelZh: '虚拟卡', labelEn: 'Virtual Card', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  gift_card: { icon: '🎁', labelZh: '礼品卡', labelEn: 'Gift Card', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  regional_pricing: { icon: '🌍', labelZh: '地区定价', labelEn: 'Regional Pricing', color: 'bg-green-100 text-green-700 border-green-200' },
  troubleshooting: { icon: '❓', labelZh: '问题解答', labelEn: 'Troubleshooting', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

const difficultyConfig = {
  easy: { labelZh: '简单', labelEn: 'Easy', color: 'bg-green-100 text-green-700' },
  medium: { labelZh: '中等', labelEn: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  hard: { labelZh: '困难', labelEn: 'Hard', color: 'bg-red-100 text-red-700' },
};

const reliabilityConfig = {
  high: { labelZh: '高', labelEn: 'High', color: 'bg-blue-100 text-blue-700' },
  medium: { labelZh: '中', labelEn: 'Medium', color: 'bg-gray-100 text-gray-700' },
  low: { labelZh: '低', labelEn: 'Low', color: 'bg-orange-100 text-orange-700' },
};

// Simple fuzzy search function
function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Check if all query characters appear in order
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  if (queryIndex === lowerQuery.length) return true;

  // Also check if text includes the query as substring
  return lowerText.includes(lowerQuery);
}

export default function PaymentSolutionsFilter({ solutions, locale = 'zh' }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter solutions based on search and category
  const filteredSolutions = useMemo(() => {
    return solutions.filter(solution => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(solution.category)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const searchText = `${solution.title} ${solution.excerpt} ${solution.tags.join(' ')}`.toLowerCase();
        if (!fuzzyMatch(searchText, searchQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [solutions, searchQuery, selectedCategories]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(categoryConfig).forEach(cat => {
      counts[cat] = solutions.filter(s => s.category === cat).length;
    });
    return counts;
  }, [solutions]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  const getCategoryLabel = (cat: string) => {
    return locale === 'zh'
      ? categoryConfig[cat as keyof typeof categoryConfig]?.labelZh || cat
      : categoryConfig[cat as keyof typeof categoryConfig]?.labelEn || cat;
  };

  const getDifficultyLabel = (diff: string) => {
    return locale === 'zh'
      ? difficultyConfig[diff as keyof typeof difficultyConfig]?.labelZh || diff
      : difficultyConfig[diff as keyof typeof difficultyConfig]?.labelEn || diff;
  };

  const getReliabilityLabel = (rel: string) => {
    return locale === 'zh'
      ? reliabilityConfig[rel as keyof typeof reliabilityConfig]?.labelZh || rel
      : reliabilityConfig[rel as keyof typeof reliabilityConfig]?.labelEn || rel;
  };

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'zh' ? '搜索支付方案...' : 'Search payment solutions...'}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters || selectedCategories.length > 0
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{locale === 'zh' ? '筛选' : 'Filter'}</span>
            {selectedCategories.length > 0 && (
              <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {selectedCategories.length}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Clear Filters */}
          {(searchQuery || selectedCategories.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {locale === 'zh' ? '清除' : 'Clear'}
            </button>
          )}
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">
                {locale === 'zh' ? '按类别筛选' : 'Filter by Category'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const isSelected = selectedCategories.includes(key);
                const count = categoryCounts[key] || 0;
                return (
                  <button
                    key={key}
                    onClick={() => toggleCategory(key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isSelected
                        ? 'bg-primary-100 border-primary-300 text-primary-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span>{locale === 'zh' ? config.labelZh : config.labelEn}</span>
                    <span className={`text-xs ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {selectedCategories.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">
            {locale === 'zh' ? '已选择' : 'Active filters'}:
          </span>
          {selectedCategories.map(cat => (
            <span
              key={cat}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${categoryConfig[cat as keyof typeof categoryConfig]?.color}`}
            >
              {categoryConfig[cat as keyof typeof categoryConfig]?.icon}
              {getCategoryLabel(cat)}
              <button
                onClick={() => toggleCategory(cat)}
                className="ml-1 hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredSolutions.length} {locale === 'zh' ? '个结果' : 'results'}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Solutions List */}
      {filteredSolutions.length > 0 ? (
        <div className="space-y-4">
          {filteredSolutions.map((solution, index) => (
            <React.Fragment key={solution.id}>
              {index > 0 && index % 5 === 0 && (
                <VirtualCardAd
                  variant="auto"
                  index={index}
                  locale={locale}
                />
              )}
            <a
              href={getLocaleHref(`/payment/${solution.id}`, locale)}
              className="block bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Category Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                      categoryConfig[solution.category]?.color || 'bg-gray-100 text-gray-700'
                    }`}>
                      {categoryConfig[solution.category]?.icon}
                      {getCategoryLabel(solution.category)}
                    </span>

                    {/* Difficulty Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      difficultyConfig[solution.difficulty]?.color || 'bg-gray-100 text-gray-700'
                    }`}>
                      {getDifficultyLabel(solution.difficulty)}
                    </span>

                    {/* Reliability Badge */}
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                      {locale === 'zh' ? '可靠性' : 'Reliability'}: {getReliabilityLabel(solution.reliability)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                    {solution.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {solution.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{solution.rating}</span>
                      <span className="text-gray-400">({solution.ratingCount.toLocaleString()})</span>
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{solution.viewCount.toLocaleString()}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {solution.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="sm:w-32 flex sm:flex-col items-center sm:items-end justify-between gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(solution.updatedAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                  </span>
                  <span className="px-4 py-2 bg-primary-50 text-primary-600 text-sm font-medium rounded-lg group-hover:bg-primary-100 transition-colors">
                    {locale === 'zh' ? '查看详情' : 'View Details'}
                  </span>
                </div>
              </div>
            </a>
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 mb-4">
            {locale === 'zh' ? '没有找到匹配的支付方案' : 'No matching payment solutions found'}
          </p>
          <button
            onClick={clearAllFilters}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {locale === 'zh' ? '清除筛选条件' : 'Clear filters'}
          </button>
        </div>
      )}
    </div>
  );
}
