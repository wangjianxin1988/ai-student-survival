import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';
import { userStatsApi, getBadgesWithStatus, type UserProfile } from '@/lib/userProfile';
import { sampleOffers, type Offer } from '@/data/offers';
import FollowButton from './FollowButton';
import { BadgeGrid } from './Badge';
import { getLocaleHref } from '@/lib/i18n';

interface UserPublicProfileProps {
  userId: string | undefined;
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    profile: '个人主页',
    favorites: '收藏',
    ratings: '评分',
    reviews: '评论',
    offers: 'Offer',
    followers: '粉丝',
    following: '关注',
    points: '积分',
    level: '等级',
    joined: '加入于',
    noPublicContent: '暂无公开内容',
    offersLabel: 'Offers',
    loginRequired: '请先登录',
    loginRedirect: '跳转中...',
    notFound: '用户不存在',
    goBack: '返回',
    admission: '录取',
    rejected: '拒信',
    waitlisted: '候补',
    scholarship: '奖学金',
  },
  en: {
    profile: 'Profile',
    favorites: 'Favorites',
    ratings: 'Ratings',
    reviews: 'Reviews',
    offers: 'Offers',
    followers: 'Followers',
    following: 'Following',
    points: 'Points',
    level: 'Level',
    joined: 'Joined',
    noPublicContent: 'No public content',
    offersLabel: 'Offers',
    loginRequired: 'Please login first',
    loginRedirect: 'Redirecting...',
    notFound: 'User not found',
    goBack: 'Go Back',
    admission: 'Admitted',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    scholarship: 'Scholarship',
  },
};

const levelColors = [
  'from-gray-400 to-gray-500',
  'from-green-400 to-green-500',
  'from-blue-400 to-blue-500',
  'from-purple-400 to-purple-500',
  'from-yellow-400 to-yellow-500',
  'from-orange-400 to-orange-500',
  'from-red-400 to-red-500',
  'from-pink-400 to-pink-500',
  'from-indigo-400 to-indigo-500',
  'from-yellow-300 to-yellow-500',
];

export default function UserPublicProfile({ userId, locale = 'zh' }: UserPublicProfileProps) {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offers' | 'favorites' | 'ratings'>('offers');
  const [userOffers, setUserOffers] = useState<Offer[]>([]);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const t = translations[locale];

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (userId) {
      const userProfile = userStatsApi.getProfile(userId);
      setProfile(userProfile);

      // Load user's offers
      if (typeof window !== 'undefined') {
        const storedOffers = localStorage.getItem('demo_offers');
        if (storedOffers) {
          try {
            const parsed = JSON.parse(storedOffers);
            const offers: Offer[] = [];
            Object.values(parsed).forEach((userOfferList: any) => {
              if (Array.isArray(userOfferList)) {
                const filtered = userOfferList.filter((o: Offer) => o.userId === userId);
                offers.push(...filtered);
              }
            });
            setUserOffers(offers);
          } catch (e) {
            console.error('Failed to parse offers:', e);
          }
        }

        // Load user's favorites
        const storedFavorites = localStorage.getItem('demo_favorites');
        if (storedFavorites) {
          try {
            const parsed = JSON.parse(storedFavorites);
            const userFavs = parsed[userId] || [];
            setUserFavorites(userFavs);
          } catch (e) {
            console.error('Failed to parse favorites:', e);
          }
        }

        // Load user's ratings
        const storedRatings = localStorage.getItem('demo_ratings');
        if (storedRatings) {
          try {
            const parsed = JSON.parse(storedRatings);
            const userRatingsList = parsed[userId] || [];
            setUserRatings(userRatingsList);
          } catch (e) {
            console.error('Failed to parse ratings:', e);
          }
        }
      }
    }

    setLoading(false);

    const unsubscribe = onAuthStateChange((newUser) => {
      setCurrentUser(newUser);
    });

    return unsubscribe;
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.notFound}</h2>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            {t.goBack}
          </a>
        </div>
      </div>
    );
  }

  const badgesWithStatus = getBadgesWithStatus(profile);
  const earnedBadges = badgesWithStatus.filter(b => b.earned);

  const tabs = [
    { id: 'offers', label: `${t.offersLabel} (${userOffers.length})` },
    { id: 'favorites', label: `${t.favorites} (${userFavorites.length})` },
    { id: 'ratings', label: `${t.ratings} (${userRatings.length})` },
  ];

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'admitted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full bg-gray-100"
              />
              <span className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r ${levelColors[profile.level - 1]} text-white text-xs font-bold`}>
                Lv{profile.level}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                {currentUser && currentUser.id !== userId && (
                  <FollowButton targetUserId={userId!} targetUser={profile} locale={locale} size="md" />
                )}
              </div>
              <p className="text-gray-500 mb-4">
                {t.joined} {new Date(profile.joinDate).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.points}</div>
                  <div className="text-sm text-gray-500">{t.points}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{earnedBadges.length}</div>
                  <div className="text-sm text-gray-500">{locale === 'zh' ? '徽章' : 'Badges'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userOffers.length}</div>
                  <div className="text-sm text-gray-500">{t.offers}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userFavorites.length}</div>
                  <div className="text-sm text-gray-500">{t.favorites}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userRatings.length}</div>
                  <div className="text-sm text-gray-500">{t.ratings}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Preview */}
          {earnedBadges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {earnedBadges.slice(0, 8).map(({ badge, earned }) => (
                  <div
                    key={badge.id}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                      earned ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-400'
                    }`}
                    title={locale === 'zh' ? badge.descriptionZh : badge.description}
                  >
                    <span>{badge.icon}</span>
                    <span>{locale === 'zh' ? badge.nameZh : badge.name}</span>
                  </div>
                ))}
                {earnedBadges.length > 8 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                    +{earnedBadges.length - 8}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            {userOffers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">{t.noPublicContent}</p>
              </div>
            ) : (
              userOffers.map((offer) => (
                <a
                  key={offer.id}
                  href={getLocaleHref(`/offers/${offer.id}`, locale)}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    {offer.universityLogo && (
                      <img
                        src={offer.universityLogo}
                        alt={offer.universityName}
                        className="w-12 h-12 rounded-lg bg-gray-100 p-1 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{offer.universityName}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getResultBadge(offer.admissionResult)}`}>
                          {offer.admissionResult === 'admitted' ? t.admission :
                           offer.admissionResult === 'rejected' ? t.rejected : t.waitlisted}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{offer.programName}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{offer.degree}</span>
                        <span>{offer.universityCountry}</span>
                        {offer.scholarship.type !== 'none' && (
                          <span className="text-green-600">
                            {offer.scholarship.type === 'full' ? (locale === 'zh' ? '全奖' : 'Full') :
                             offer.scholarship.type === 'partial' ? (locale === 'zh' ? '半奖' : 'Partial') : ''}
                            {offer.scholarship.currency} {offer.scholarship.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid md:grid-cols-2 gap-4">
            {userFavorites.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">{t.noPublicContent}</p>
              </div>
            ) : (
              userFavorites.map((fav, index) => (
                <a
                  key={index}
                  href={fav.url || '#'}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-200 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-gray-900">{fav.name || fav.title}</h3>
                  <p className="text-sm text-gray-500">{fav.type || 'Item'}</p>
                </a>
              ))
            )}
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="space-y-4">
            {userRatings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">{t.noPublicContent}</p>
              </div>
            ) : (
              userRatings.map((rating, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-semibold text-gray-900">{rating.name || rating.title}</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= (rating.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-gray-600">{rating.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
