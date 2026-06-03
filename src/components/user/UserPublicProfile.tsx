import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';
import { getBadgesWithStatus, fetchUserStats, type RealUserStats } from '@/lib/userProfile';
import { sampleOffers, type Offer } from '@/data/offers';
import FollowButton from './FollowButton';
import { BadgeGrid, BadgeDisplay } from './Badge';
import { getLocaleHref } from '@/lib/i18n';

interface UserPublicProfileProps {
  userId: string | undefined;
  locale?: 'zh' | 'en';
}

interface SupabaseUserStats {
  userId: string;
  name: string;
  avatar: string;
  email: string;
  points: number;
  totalEarned: number;
  postsCount: number;
  commentsCount: number;
  joinDate: string;
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
    postsCount: '帖子',
    commentsCount: '评论',
    loading: '加载中...',
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
    postsCount: 'Posts',
    commentsCount: 'Comments',
    loading: 'Loading...',
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

function getLevelFromPoints(points: number): number {
  if (points >= 10000) return 10;
  if (points >= 5000) return 9;
  if (points >= 2000) return 8;
  if (points >= 1000) return 7;
  if (points >= 500) return 6;
  if (points >= 200) return 5;
  if (points >= 100) return 4;
  if (points >= 50) return 3;
  if (points >= 20) return 2;
  return 1;
}

export default function UserPublicProfile({ userId, locale = 'zh' }: UserPublicProfileProps) {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [userStats, setUserStats] = useState<SupabaseUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchDone, setFetchDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'offers' | 'favorites' | 'ratings'>('offers');
  const [userOffers, setUserOffers] = useState<Offer[]>([]);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [realBadgeStats, setRealBadgeStats] = useState<RealUserStats | null>(null);
  const t = translations[locale];

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (userId) {
      // Fetch user stats from Supabase
      fetch(`/api/community/user/${userId}/stats`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setUserStats(data.data);
            setRealBadgeStats({
              points: data.data.points || 0,
              totalEarned: data.data.totalEarned || 0,
              totalSpent: data.data.totalSpent || 0,
              postsCount: data.data.postsCount || 0,
              commentsCount: data.data.commentsCount || 0,
            });
          }
        })
        .catch(e => console.error('[UserPublicProfile] Failed to fetch user stats:', e))
        .finally(() => {
          setFetchDone(true);
          setLoading(false);
        });

      // Load localStorage-based offers/favorites/ratings
      if (typeof window !== 'undefined') {
        const storedOffers = localStorage.getItem('demo_offers');
        if (storedOffers) {
          try {
            const parsed = JSON.parse(storedOffers);
            const offers: Offer[] = [];
            Object.values(parsed).forEach((userOfferList: any) => {
              if (Array.isArray(userOfferList)) {
                const filtered = (userOfferList as Offer[]).filter((o: Offer) => o.userId === userId);
                offers.push(...filtered);
              }
            });
            setUserOffers(offers);
          } catch (e) {
            console.error('Failed to parse offers:', e);
          }
        }

        const storedFavorites = localStorage.getItem('demo_favorites');
        if (storedFavorites) {
          try {
            const parsed = JSON.parse(storedFavorites);
            setUserFavorites(parsed[userId] || []);
          } catch (e) {
            console.error('Failed to parse favorites:', e);
          }
        }

        const storedRatings = localStorage.getItem('demo_ratings');
        if (storedRatings) {
          try {
            const parsed = JSON.parse(storedRatings);
            setUserRatings(parsed[userId] || []);
          } catch (e) {
            console.error('Failed to parse ratings:', e);
          }
        }
      }
    }

    const unsubscribe = onAuthStateChange((newUser) => {
      setCurrentUser(newUser);
    });

    return unsubscribe;
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4" style={{ borderWidth: "3px" }} />
            <p className="text-sm text-gray-500">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (fetchDone && !userStats) {
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

  const level = getLevelFromPoints(userStats.points);

  // Compute earned badges using real Supabase stats
  const minimalProfile = {
    id: userId || '',
    email: userStats.email || '',
    name: userStats.name,
    avatar: userStats.avatar,
    points: userStats.points,
    level,
    badges: [],
    favoritesCount: 0,
    ratingsCount: 0,
    reviewsCount: 0,
    followees: [],
    followers: [],
    joinDate: userStats.joinDate,
    lastActive: userStats.joinDate,
  };
  const badgesWithStatus = realBadgeStats
    ? getBadgesWithStatus(minimalProfile, realBadgeStats)
    : getBadgesWithStatus(minimalProfile);
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
                src={userStats.avatar}
                alt={userStats.name}
                className="w-24 h-24 rounded-full bg-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
                }}
              />
              <span className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r ${levelColors[level - 1]} text-white text-xs font-bold`}>
                Lv{level}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{userStats.name}</h1>
                {currentUser && currentUser.id !== userId && (
                  <FollowButton
                    targetUserId={userId!}
                    targetUser={{ id: userId!, name: userStats.name, avatar: userStats.avatar, level, badges: [], joinDate: userStats.joinDate, points: userStats.points, email: '', followees: [], followers: [], lastActive: userStats.joinDate, favoritesCount: 0, ratingsCount: 0, reviewsCount: 0 }}
                    locale={locale}
                    size="md"
                  />
                )}
              </div>
              <p className="text-gray-500 mb-4">
                {t.joined} {new Date(userStats.joinDate).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userStats.points}</div>
                  <div className="text-sm text-gray-500">{t.points}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userStats.postsCount}</div>
                  <div className="text-sm text-gray-500">{t.postsCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userStats.commentsCount}</div>
                  <div className="text-sm text-gray-500">{t.commentsCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userOffers.length}</div>
                  <div className="text-sm text-gray-500">{t.offers}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userFavorites.length}</div>
                  <div className="text-sm text-gray-500">{t.favorites}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {locale === 'zh' ? '已获得徽章' : 'Earned Badges'} ({earnedBadges.length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map(({ badge, earned }) => (
                <BadgeDisplay key={badge.id} badge={badge} earned={earned} size="md" locale={locale} />
              ))}
            </div>
          </div>
        )}

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
