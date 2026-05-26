import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, onAuthStateChange, initAuth, getAccessToken, type DemoUser } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';
import SubmitOfferForm from '@/components/offers/SubmitOfferForm';

interface Offer {
  id: string;
  universityName: string;
  program: string;
  admissionResult: 'accepted' | 'rejected' | 'waitlisted';
  background?: string;
  offerImage?: string;
  createdAt: string;
  // Extended fields from SubmitOfferForm
  userId?: string;
  userName?: string;
  userAvatar?: string;
  universityCountry?: string;
  programName?: string;
  degree?: string;
  scholarship?: {
    amount: number;
    currency: string;
    type: string;
  };
  backgroundDetails?: {
    gpa: string;
    gre: string;
    toefl: string;
    ielts: string;
    publications: number;
    researchExperience: number;
    internships: number;
  };
  aiToolsUsed?: string[];
  timeline?: string;
  advice?: string;
  likes?: number;
  comments?: number;
}

const translations = {
  zh: {
    title: '我的Offer',
    loading: '加载中...',
    empty: '暂无Offer记录',
    failed: '加载失败',
    accepted: '录取',
    rejected: '拒信',
    waitlisted: '候补',
    addOffer: '添加Offer',
    viewImage: '查看Offer截图',
  },
  en: {
    title: 'My Offers',
    loading: 'Loading...',
    empty: 'No offers yet',
    failed: 'Failed to load',
    accepted: 'Accepted',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    addOffer: 'Add Offer',
    viewImage: 'View Offer Screenshot',
  },
};

export default function OffersList({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const t = translations[locale];

  const loadOffers = useCallback(async () => {
    if (!user) return;

    try {
      const token = await getAccessToken();
      const response = await fetch('/api/offers/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.offers && Array.isArray(data.offers)) {
          const mappedOffers: Offer[] = data.offers.map((o: {
            id: string;
            university_name: string;
            university_slug?: string;
            program: string;
            admission_result: 'accepted' | 'rejected' | 'waitlisted';
            background?: string;
            tools_used?: string[];
            created_at: string;
            user_id?: string;
          }) => ({
            id: o.id,
            universityName: o.university_name,
            program: o.program,
            admissionResult: o.admission_result,
            background: o.background,
            aiToolsUsed: o.tools_used,
            createdAt: o.created_at,
            userId: o.user_id,
          }));
          setOffers(mappedOffers);
        }
      }
    } catch (error) {
      console.error('[OffersList] Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    initAuth().then(user => {
      setUser(user);
    });

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadOffers();
  }, [user, loadOffers]);

  const handleOfferSuccess = (offerId: string) => {
    setShowAddForm(false);
    loadOffers();
  };

  const getResultClass = (result: string) => {
    if (result === 'accepted') return 'bg-green-100 text-green-700 border-green-200';
    if (result === 'rejected') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const getResultText = (result: string) => {
    if (result === 'accepted') return t.accepted;
    if (result === 'rejected') return t.rejected;
    return t.waitlisted;
  };

  // Redirect to login if not authenticated (only after mount)
  useEffect(() => {
    if (!user && !loading) {
      window.location.href = getAuthLoginHref();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>
          <div className="text-center py-12 text-gray-500">{t.loading}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>
          <div className="text-center py-12 text-gray-500">跳转中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.addOffer}
          </button>
        </div>

        {/* Add Offer Form - using SubmitOfferForm for comprehensive fields */}
        {showAddForm && (
          <div className="mb-6">
            <SubmitOfferForm
              locale={locale}
              onSuccess={handleOfferSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {offers.length === 0 && !showAddForm ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">{t.empty}</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {t.addOffer}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{offer.universityName}</h3>
                    <p className="text-gray-600">{offer.program}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getResultClass(offer.admissionResult)}`}>
                    {getResultText(offer.admissionResult)}
                  </span>
                </div>
                {offer.background && <p className="text-sm text-gray-500 mb-2">{offer.background}</p>}
                {offer.offerImage && (
                  <button
                    onClick={() => window.open(offer.offerImage, '_blank')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t.viewImage}
                  </button>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(offer.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
