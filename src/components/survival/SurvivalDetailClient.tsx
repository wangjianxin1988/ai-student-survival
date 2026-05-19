import React, { useState } from 'react';
import SurvivalCard from './SurvivalCard';
import CommentSection from '@/components/user/CommentSection';
import {
  getSurvivalGuideById,
  getRelatedSurvivalGuides,
  survivalGuidesData,
  SURVIVAL_CATEGORIES,
} from '@/data/survivalGuides';

// Generate locale-aware href
function getLocaleHref(path: string, locale: 'zh' | 'en'): string {
  if (locale === 'zh') {
    return path;
  }
  return `/${locale}${path}`;
}

interface SurvivalDetailClientProps {
  guideId: string;
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    notFound: '指南未找到',
    relatedGuides: '相关指南',
    backToList: '返回指南列表',
    home: '首页',
    survival: '防坑防骗指南',
    rating: '评分',
    ratingSuccess: '评分成功！',
    loginToRate: '登录后可评分',
    share: '分享',
    copied: '已复制链接',
  },
  en: {
    notFound: 'Guide not found',
    relatedGuides: 'Related Guides',
    backToList: 'Back to Guides',
    home: 'Home',
    survival: 'Survival Guides',
    rating: 'Rating',
    ratingSuccess: 'Rating submitted!',
    loginToRate: 'Login to rate',
    share: 'Share',
    copied: 'Link copied!',
  },
};

export default function SurvivalDetailClient({
  guideId,
  locale = 'zh',
}: SurvivalDetailClientProps) {
  const t = translations[locale];
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const guide = getSurvivalGuideById(guideId);

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.notFound}</h1>
          <a
            href={getLocaleHref('/survival', locale)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t.backToList}
          </a>
        </div>
      </div>
    );
  }

  const relatedGuides = getRelatedSurvivalGuides(guide, 3);

  const handleRating = (rating: number) => {
    setUserRating(rating);
    setHasRated(true);
    // In a real app, this would send to an API
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert(t.copied);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <a href={getLocaleHref('/', locale)} className="hover:text-primary-600">{t.home}</a>
            <span>/</span>
            <a href={getLocaleHref('/survival', locale)} className="hover:text-primary-600">{t.survival}</a>
            <span>/</span>
            <span className="text-gray-900">
              {(locale === 'zh' ? guide.titleZh : guide.title).substring(0, 30)}...
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="mb-8">
          <SurvivalCard guide={guide} locale={locale} showDetails />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Rating */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{t.rating}</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= userRating
                        ? 'text-amber-400'
                        : 'text-gray-300 hover:text-amber-300'
                    }`}
                    disabled={hasRated}
                  >
                    ★
                  </button>
                ))}
                {hasRated && (
                  <span className="ml-2 text-green-600 text-sm">✓ {t.ratingSuccess}</span>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                {t.share}
              </button>
            </div>
          </div>
        </div>

        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📚 {t.relatedGuides}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedGuides.map((relatedGuide) => (
                <SurvivalCard
                  key={relatedGuide.id}
                  guide={relatedGuide}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentSection targetType="survival" targetId={guide.id} locale={locale} />
      </div>
    </div>
  );
}
