import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';
import OfferCard from './OfferCard';
import SubmitOfferForm from './SubmitOfferForm';
import { sampleOffers, filterOffers, sortOffers, getUniqueCountries, type Offer } from '@/data/offers';
import { getLocaleHref } from '@/lib/i18n';

const OFFERS_STORAGE_KEY = 'demo_offers';

interface OffersClientProps {
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    title: 'Offer展示',
    subtitle: '分享你的录取结果，帮助其他留学生做出更好的选择',
    loading: '加载中...',
    empty: '暂无Offer记录',
    shareOffer: '分享你的Offer',
    filters: '筛选',
    clearFilters: '清除筛选',
    sortBy: '排序',
    newest: '最新',
    hottest: '最热',
    scholarship: '奖学金金额',
    allCountries: '全部国家',
    allDegrees: '全部学位',
    allResults: '全部结果',
    admitted: '录取',
    rejected: '拒信',
    waitlisted: '候补',
    Master: '硕士',
    PhD: '博士',
    Postdoc: '博后',
    searchPlaceholder: '搜索学校或专业...',
    submitOffer: '提交Offer',
    viewDetails: '查看详情',
    showResults: '显示 {count} 个结果',
    noResults: '没有找到匹配的Offer',
  },
  en: {
    title: 'Offers',
    subtitle: 'Share your admission results to help other students make better choices',
    loading: 'Loading...',
    empty: 'No offers yet',
    shareOffer: 'Share Your Offer',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    sortBy: 'Sort By',
    newest: 'Newest',
    hottest: 'Hottest',
    scholarship: 'Scholarship Amount',
    allCountries: 'All Countries',
    allDegrees: 'All Degrees',
    allResults: 'All Results',
    admitted: 'Admitted',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    Master: 'Master',
    PhD: 'PhD',
    Postdoc: 'Postdoc',
    searchPlaceholder: 'Search university or program...',
    submitOffer: 'Submit Offer',
    viewDetails: 'View Details',
    showResults: 'Showing {count} results',
    noResults: 'No matching offers found',
  },
};

function getStoredOffers(): Offer[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(OFFERS_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    const userOffers: Offer[] = [];
    Object.values(parsed).forEach((offers: any) => {
      if (Array.isArray(offers)) {
        userOffers.push(...offers);
      }
    });
    return userOffers;
  } catch {
    return [];
  }
}

export default function OffersClient({ locale = 'zh' }: OffersClientProps) {
  // Initialize synchronously to avoid flash
  const [user, setUser] = useState<DemoUser | null>(() => getCurrentUser());
  const [offers, setOffers] = useState<Offer[]>(() => [...sampleOffers, ...getStoredOffers()]);
  const [loading, setLoading] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'hottest' | 'scholarship'>('newest');

  const t = translations[locale];

  // Stable ref to track if component is mounted
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((newUser) => {
      if (isMountedRef.current) {
        setUser(newUser);
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  // Filter and sort offers
  const filteredOffers = React.useMemo(() => {
    let result = filterOffers({
      country: countryFilter || undefined,
      degree: degreeFilter || undefined,
      result: resultFilter || undefined,
      searchQuery: searchQuery || undefined,
    });

    // Also filter user offers from the combined list
    const userOffers = getStoredOffers();
    const userFiltered = userOffers.filter(offer => {
      if (countryFilter && offer.universityCountry !== countryFilter) return false;
      if (degreeFilter && offer.degree !== degreeFilter) return false;
      if (resultFilter && offer.admissionResult !== resultFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesUniversity = offer.universityName.toLowerCase().includes(query);
        const matchesProgram = offer.programName.toLowerCase().includes(query);
        if (!matchesUniversity && !matchesProgram) return false;
      }
      return true;
    });

    // Combine and dedupe
    const combined = [...result, ...userFiltered];
    const uniqueMap = new Map(combined.map(o => [o.id, o]));

    return sortOffers(Array.from(uniqueMap.values()), sortBy);
  }, [offers, searchQuery, countryFilter, degreeFilter, resultFilter, sortBy]);

  const countries = getUniqueCountries();

  const handleSubmitSuccess = (offerId: string) => {
    setShowSubmitForm(false);
    // Refresh offers
    const userOffers = getStoredOffers();
    const allOffers = [...sampleOffers, ...userOffers];
    setOffers(allOffers);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCountryFilter('');
    setDegreeFilter('');
    setResultFilter('');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || countryFilter || degreeFilter || resultFilter;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="mt-2 text-gray-600">{t.subtitle}</p>
          </div>
          <div className="text-center py-12 text-gray-500">{t.loading}</div>
        </div>
      </div>
    );
  }

  if (showSubmitForm) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setShowSubmitForm(false)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {locale === 'zh' ? '返回列表' : 'Back to List'}
          </button>
          <SubmitOfferForm
            locale={locale}
            onSuccess={handleSubmitSuccess}
            onCancel={() => setShowSubmitForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-2 text-gray-600">{t.subtitle}</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              >
                <option value="">{t.allCountries}</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              >
                <option value="">{t.allDegrees}</option>
                <option value="Master">{t.Master}</option>
                <option value="PhD">{t.PhD}</option>
                <option value="Postdoc">{t.Postdoc}</option>
              </select>

              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              >
                <option value="">{t.allResults}</option>
                <option value="admitted">{t.admitted}</option>
                <option value="rejected">{t.rejected}</option>
                <option value="waitlisted">{t.waitlisted}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              >
                <option value="newest">{t.newest}</option>
                <option value="hottest">{t.hottest}</option>
                <option value="scholarship">{t.scholarship}</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.clearFilters}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500">
          {t.showResults.replace('{count}', String(filteredOffers.length))}
        </div>

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500">{t.noResults}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="relative group">
                <OfferCard offer={offer} locale={locale} />
                <a
                  href={getLocaleHref(`/offers/${offer.id}`, locale)}
                  className="absolute inset-0 z-10"
                  aria-label={t.viewDetails}
                />
              </div>
            ))}
          </div>
        )}

        {/* Floating Submit Button */}
        <button
          onClick={() => setShowSubmitForm(true)}
          className="fixed bottom-24 right-6 px-4 py-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all hover:scale-105 flex items-center justify-center gap-2 z-40 text-sm font-medium"
          aria-label={t.submitOffer}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>提交</span>
        </button>
      </div>
    </div>
  );
}
