import React from 'react';
import type { SurvivalGuide } from '@/data/survivalGuides';
import { SURVIVAL_CATEGORIES } from '@/data/survivalGuides';
import { getLocaleHref } from '@/lib/i18n';

interface SurvivalCardProps {
  guide: SurvivalGuide;
  locale?: 'zh' | 'en';
  showDetails?: boolean;
}

const translations = {
  zh: {
    views: '浏览',
    verified: '已认证',
    hot: '热门',
    readMore: '阅读全文',
  },
  en: {
    views: 'views',
    verified: 'Verified',
    hot: 'Hot',
    readMore: 'Read More',
  },
};

const categoryColors = {
  scam: 'bg-red-100 text-red-700 border-red-200',
  culture: 'bg-purple-100 text-purple-700 border-purple-200',
  safety: 'bg-blue-100 text-blue-700 border-blue-200',
  legal: 'bg-amber-100 text-amber-700 border-amber-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function SurvivalCard({ guide, locale = 'zh', showDetails = false }: SurvivalCardProps) {
  const t = translations[locale];
  const category = SURVIVAL_CATEGORIES[guide.category];
  const categoryLabel = locale === 'zh' ? category.label : category.labelEn;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (showDetails) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryColors[guide.category]} bg-white/20 border-white/30`}>
              {category.icon} {categoryLabel}
            </span>
            {guide.isHot && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white">
                🔥 {t.hot}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {locale === 'zh' ? guide.titleZh : guide.title}
          </h1>
          <div className="flex items-center gap-4 text-primary-100 text-sm">
            <span>{guide.authorName}</span>
            <span>·</span>
            <span>{formatDate(guide.createdAt)}</span>
            <span>·</span>
            <span>{t.views}: {formatNumber(guide.viewCount)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {guide.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-2xl font-bold text-gray-900">{guide.rating.toFixed(1)}</span>
              <span className="text-gray-500">({guide.ratingCount} {locale === 'zh' ? '评分' : 'ratings'})</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xl ${star <= Math.round(guide.rating) ? 'text-amber-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div
              className="whitespace-pre-wrap text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: (locale === 'zh' ? guide.contentZh : guide.content)
                  .replace(/^## /gm, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">')
                  .replace(/^### /gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">')
                  .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                  .replace(/^- /gm, '<li class="ml-4">')
                  .replace(/^✅ /gm, '<li class="ml-4 text-green-600">✅ ')
                  .replace(/^❌ /gm, '<li class="ml-4 text-red-600">❌ ')
                  .replace(/^⚠️ /gm, '<li class="ml-4 text-amber-600">⚠️ ')
                  .replace(/^📞 /gm, '<li class="ml-4 text-blue-600">📞 ')
                  .replace(/^🏥 /gm, '<li class="ml-4 text-red-600">🏥 ')
                  .replace(/^🆘 /gm, '<li class="ml-4 text-red-600">🆘 ')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/\n/g, '<br/>')
              }}
            />
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between border-t pt-6 mt-6">
            <div className="flex items-center gap-3">
              <img
                src={guide.authorAvatar}
                alt={guide.authorName}
                className="w-12 h-12 rounded-full bg-gray-200"
              />
              <div>
                <p className="font-medium text-gray-900">{guide.authorName}</p>
                {guide.isVerified && (
                  <span className="text-sm text-primary-600">✓ {t.verified}</span>
                )}
              </div>
            </div>
            <div className="text-gray-500 text-sm">
              {locale === 'zh' ? '最后更新' : 'Last updated'}: {formatDate(guide.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact card view
  return (
    <a
      href={getLocaleHref(`/survival/${guide.id}`, locale)}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[guide.category]}`}>
            {categoryLabel}
          </span>
        </div>
        {guide.isHot && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
            🔥 {t.hot}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {locale === 'zh' ? guide.titleZh : guide.title}
      </h3>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {(locale === 'zh' ? guide.contentZh : guide.content).substring(0, 100)}...
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {guide.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
          <img
            src={guide.authorAvatar}
            alt={guide.authorName}
            className="w-6 h-6 rounded-full bg-gray-200"
          />
          <span className="text-xs text-gray-500">{guide.authorName}</span>
          {guide.isVerified && (
            <span className="text-primary-600 text-xs">✓</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            {formatNumber(guide.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            ⭐ {guide.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </a>
  );
}
