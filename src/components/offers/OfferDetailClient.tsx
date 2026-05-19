import React, { useState, useEffect } from 'react';
import OfferCard from './OfferCard';
import { CommentList, CommentForm } from './OfferComment';
import ShareButton from '@/components/common/ShareButton';
import { sampleOffers, sampleComments, getCommentsByOfferId, type Offer, type OfferComment } from '@/data/offers';

const COMMENTS_KEY = 'demo_offer_comments';

interface OfferDetailClientProps {
  offerId: string | undefined;
  locale?: 'zh' | 'en';
}

// Generate locale-aware href
function getLocaleHref(path: string, locale: 'zh' | 'en'): string {
  if (locale === 'zh') {
    return path;
  }
  return `/${locale}${path}`;
}

const translations = {
  zh: {
    back: '返回',
    comments: '评论',
    noComments: '暂无评论',
    writeComment: '发表评论',
    commentPlaceholder: '写下你的评论...',
    submitComment: '提交',
    submitting: '提交中...',
    commentSuccess: '评论提交成功',
    notFound: '未找到该Offer',
    relatedOffers: '相关Offer',
    likes: '点赞',
    shareOffer: '分享Offer',
  },
  en: {
    back: 'Back',
    comments: 'Comments',
    noComments: 'No comments yet',
    writeComment: 'Write a comment',
    commentPlaceholder: 'Write your comment...',
    submitComment: 'Submit',
    submitting: 'Submitting...',
    commentSuccess: 'Comment submitted successfully',
    notFound: 'Offer not found',
    relatedOffers: 'Related Offers',
    likes: 'Likes',
    shareOffer: 'Share Offer',
  },
};

function getStoredComments(offerId: string): OfferComment[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(COMMENTS_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return parsed[offerId] || [];
  } catch {
    return [];
  }
}

function saveComment(offerId: string, comment: OfferComment): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(COMMENTS_KEY);
  const allComments = stored ? JSON.parse(stored) : {};

  if (!allComments[offerId]) {
    allComments[offerId] = [];
  }
  allComments[offerId].push(comment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
}

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
  } catch {
    // ignore
  }
  return null;
}

export default function OfferDetailClient({ offerId, locale = 'zh' }: OfferDetailClientProps) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [comments, setComments] = useState<OfferComment[]>([]);
  const [relatedOffers, setRelatedOffers] = useState<Offer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentSuccess, setShowCommentSuccess] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // Track the offerId that was loaded to prevent stale updates
  const loadedOfferIdRef = React.useRef<string | undefined>(undefined);

  const t = translations[locale];

  useEffect(() => {
    if (!offerId) {
      setIsLoading(false);
      loadedOfferIdRef.current = undefined;
      return;
    }

    // Mark loading start BEFORE any async work
    setIsLoading(true);
    setOffer(null);
    loadedOfferIdRef.current = offerId;

    // First check sample data
    let foundOffer: Offer | null | undefined = sampleOffers.find(o => o.id === offerId);

    // Then check user-submitted offers
    if (!foundOffer) {
      foundOffer = getUserOfferById(offerId);
    }

    // Abort if offerId changed during async operations
    if (loadedOfferIdRef.current !== offerId) {
      return;
    }

    if (foundOffer) {
      setOffer(foundOffer);
      setLikeCount(foundOffer.likes);

      // Get comments - combine sample and user comments
      const sampleOfferComments = getCommentsByOfferId(offerId);
      const userComments = getStoredComments(offerId);
      setComments([...sampleOfferComments, ...userComments]);

      // Get related offers (same country, exclude current)
      const related = sampleOffers
        .filter(o => o.universityCountry === foundOffer.universityCountry && o.id !== offerId)
        .slice(0, 3);
      setRelatedOffers(related);
    }

    // Final check before setting loading false
    if (loadedOfferIdRef.current === offerId) {
      setIsLoading(false);
    }
  }, [offerId]);

  const handleCommentSubmit = (content: string) => {
    if (!offerId || !offer) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newComment: OfferComment = {
        id: 'comment-' + Date.now(),
        offerId,
        userId: 'user-' + Date.now(),
        userName: 'Anonymous User',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous',
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      saveComment(offerId, newComment);
      setComments(prev => [...prev, newComment]);
      setIsSubmitting(false);
      setShowCommentSuccess(true);
      setTimeout(() => setShowCommentSuccess(false), 3000);
    }, 500);
  };

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <a
            href={getLocaleHref('/offers', locale)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
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

  // Not found state
  if (!offer) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <a
            href={getLocaleHref('/offers', locale)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
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
            <a
              href={getLocaleHref('/offers', locale)}
              className="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
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
        <a
          href={getLocaleHref('/offers', locale)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
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

            {/* Like Button and Share */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                  liked
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200'
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill={liked ? 'currentColor' : 'none'}
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
                <span className="font-medium">{likeCount} {t.likes}</span>
              </button>
              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={`${offer.universityName} - ${offer.programName}`}
                description={locale === 'zh' ? `${offer.admissionResult === 'admitted' ? '录取' : offer.admissionResult === 'rejected' ? '拒信' : '候补'} - ${offer.scholarship.type === 'full' ? '全奖' : offer.scholarship.type === 'partial' ? '半奖' : '无奖'}` : `${offer.admissionResult} - ${offer.scholarship.type} scholarship`}
                locale={locale}
                size="md"
              />
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t.comments} ({comments.length})</h3>

              {comments.length > 0 ? (
                <CommentList comments={comments} locale={locale} />
              ) : (
                <p className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  {t.noComments}
                </p>
              )}

              {/* Comment Form */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                {showCommentSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                    {t.commentSuccess}
                  </div>
                )}
                <CommentForm
                  locale={locale}
                  onSubmit={handleCommentSubmit}
                  isSubmitting={isSubmitting}
                  placeholder={t.commentPlaceholder}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Related Offers */}
          <div className="lg:col-span-1">
            {relatedOffers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.relatedOffers}</h3>
                <div className="space-y-4">
                  {relatedOffers.map(relatedOffer => (
                    <a
                      key={relatedOffer.id}
                      href={getLocaleHref(`/offers/${relatedOffer.id}`, locale)}
                      className="block group"
                    >
                      <div className="flex items-center gap-3">
                        {relatedOffer.universityLogo && (
                          <img
                            src={relatedOffer.universityLogo}
                            alt={relatedOffer.universityName}
                            className="w-10 h-10 bg-gray-100 rounded-lg p-1 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
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
