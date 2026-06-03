import React, { useState, useEffect } from 'react';
import OfferCard from './OfferCard';
import CommentSection from '@/components/user/CommentSection';
import LikeButton from '@/components/common/LikeButton';
import FavoriteButton from '@/components/favorites/FavoriteButton';
import ShareButton from '@/components/common/ShareButton';
import { sampleOffers, type Offer } from '@/data/offers';

interface OfferDetailClientProps {
  offerId: string | undefined;
  locale?: 'zh' | 'en';
}

function getLocaleHref(path: string, locale: 'zh' | 'en'): string {
  if (locale === 'zh') return path;
  return `/${locale}${path}`;
}

const translations = {
  zh: {
    back: '返回',
    comments: '评论',
    notFound: '未找到该Offer',
    relatedOffers: '相关Offer',
    likes: '点赞',
  },
  en: {
    back: 'Back',
    comments: 'Comments',
    notFound: 'Offer not found',
    relatedOffers: 'Related Offers',
    likes: 'Likes',
  },
};

function getUserOfferById(offerId: string): Offer | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('demo_offers');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    for (const userOffers of Object.values(parsed)) {
      const offers = userOffers as Offer[];
      const found = offers.find(o => o.id === offerId);
      if (found) return found;
    }
  } catch {}
  return null;
}

export default function OfferDetailClient({ offerId, locale = 'zh' }: OfferDetailClientProps) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [relatedOffers, setRelatedOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadedOfferIdRef = React.useRef<string | undefined>(undefined);

  const t = translations[locale];

  useEffect(() => {
    if (!offerId) {
      setIsLoading(false);
      loadedOfferIdRef.current = undefined;
      return;
    }

    setIsLoading(true);
    setOffer(null);
    loadedOfferIdRef.current = offerId;

    let foundOffer: Offer | null | undefined = sampleOffers.find(o => o.id === offerId);
    if (!foundOffer) {
      foundOffer = getUserOfferById(offerId);
    }

    if (loadedOfferIdRef.current !== offerId) return;

    if (foundOffer) {
      setOffer(foundOffer);
      const related = sampleOffers
        .filter(o => o.universityCountry === foundOffer!.universityCountry && o.id !== offerId)
        .slice(0, 3);
      setRelatedOffers(related);
    }

    if (loadedOfferIdRef.current === offerId) {
      setIsLoading(false);
    }
  }, [offerId]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <a href={getLocaleHref('/offers', locale)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.back}
          </a>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <a href={getLocaleHref('/offers', locale)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.back}
          </a>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{t.notFound}</h2>
            <a href={getLocaleHref('/offers', locale)} className="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              {locale === 'zh' ? '返回列表' : 'Back to List'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <a href={getLocaleHref('/offers', locale)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.back}
        </a>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Offer Detail */}
          <div className="lg:col-span-2">
            <OfferCard offer={offer} locale={locale} showDetails={true} />

            {/* Like / Favorite / Share Buttons */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <LikeButton targetType="offer" targetId={offer.id} locale={locale} />
              <FavoriteButton targetType="offer" targetId={offer.id} locale={locale} />
              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={`${offer.universityName} - ${offer.programName}`}
                description={locale === 'zh' ? `${offer.admissionResult === 'admitted' ? '录取' : offer.admissionResult === 'rejected' ? '拒信' : '候补'} - ${offer.scholarship.type === 'full' ? '全奖' : offer.scholarship.type === 'partial' ? '半奖' : '无奖'}` : `${offer.admissionResult} - ${offer.scholarship.type} scholarship`}
                locale={locale}
                size="md"
                targetType="offer"
                targetId={offer.id}
              />
            </div>

            {/* Comments Section - Using API-backed CommentSection */}
            <div className="mt-8">
              <CommentSection targetType="offer" targetId={offer.id} locale={locale} />
            </div>
          </div>

          {/* Sidebar - Related Offers */}
          <div className="lg:col-span-1">
            {relatedOffers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.relatedOffers}</h3>
                <div className="space-y-4">
                  {relatedOffers.map(relatedOffer => (
                    <a key={relatedOffer.id} href={getLocaleHref(`/offers/${relatedOffer.id}`, locale)} className="block group">
                      <div className="flex items-center gap-3">
                        {relatedOffer.universityLogo && (
                          <img
                            src={relatedOffer.universityLogo}
                            alt={relatedOffer.universityName}
                            className="w-10 h-10 bg-gray-100 rounded-lg p-1 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 group-hover:text-primary-600 truncate">
                            {relatedOffer.universityName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {relatedOffer.programName}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
