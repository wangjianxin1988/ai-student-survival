import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';
import { contentModerationApi } from '@/lib/content-moderation';
import { DEGREE_TYPES, DEGREE_LABELS, type DegreeType } from '@/data/offers';

interface SubmitOfferFormProps {
  locale?: 'zh' | 'en';
  onSuccess?: (offerId: string) => void;
  onCancel?: () => void;
}

const translations = {
  zh: {
    title: '分享你的Offer',
    subtitle: '帮助学弟学妹了解申请经验',
    universityName: '大学名称',
    universityNamePlaceholder: '例如：Stanford University',
    programName: '申请项目',
    programNamePlaceholder: '例如：MS Computer Science',
    degree: '学位类型',
    country: '国家/地区',
    admissionResult: '录取结果',
    admitted: '录取',
    rejected: '拒信',
    waitlisted: '候补',
    scholarship: '奖学金',
    scholarshipType: '奖学金类型',
    full: '全奖',
    partial: '半奖',
    none: '无奖',
    scholarshipAmount: '奖学金金额',
    background: '背景分析',
    gpa: 'GPA',
    gre: 'GRE',
    toefl: '托福',
    ielts: '雅思',
    publications: '发表论文数',
    researchExperience: '科研经历（年）',
    internships: '实习数量',
    aiToolsUsed: '使用的AI工具',
    aiToolsPlaceholder: '例如：ChatGPT, Claude, Perplexity（用逗号分隔）',
    timeline: '申请时间线',
    timelinePlaceholder: '例如：2025 Fall - Submitted Dec 2024, Result Feb 2025',
    advice: '给学弟学妹的建议',
    advicePlaceholder: '分享你的申请经验和建议...',
    anonymous: '匿名提交',
    submit: '提交',
    submitting: '提交中...',
    success: '提交成功！感谢分享',
    loginRequired: '请先登录才能分享Offer',
    login: '登录',
    cancel: '取消',
    fieldRequired: '此项为必填',
  },
  en: {
    title: 'Share Your Offer',
    subtitle: 'Help other students learn from your experience',
    universityName: 'University Name',
    universityNamePlaceholder: 'e.g., Stanford University',
    programName: 'Program',
    programNamePlaceholder: 'e.g., MS Computer Science',
    degree: 'Degree Type',
    country: 'Country/Region',
    admissionResult: 'Admission Result',
    admitted: 'Admitted',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    scholarship: 'Scholarship',
    scholarshipType: 'Scholarship Type',
    full: 'Full',
    partial: 'Partial',
    none: 'None',
    scholarshipAmount: 'Scholarship Amount',
    background: 'Background',
    gpa: 'GPA',
    gre: 'GRE',
    toefl: 'TOEFL',
    ielts: 'IELTS',
    publications: 'Publications',
    researchExperience: 'Research Experience (years)',
    internships: 'Internships',
    aiToolsUsed: 'AI Tools Used',
    aiToolsPlaceholder: 'e.g., ChatGPT, Claude, Perplexity (comma separated)',
    timeline: 'Timeline',
    timelinePlaceholder: 'e.g., 2025 Fall - Submitted Dec 2024, Result Feb 2025',
    advice: 'Advice for Others',
    advicePlaceholder: 'Share your application experience and advice...',
    anonymous: 'Submit Anonymously',
    submit: 'Submit',
    submitting: 'Submitting...',
    success: 'Submitted successfully! Thank you for sharing',
    loginRequired: 'Please login to share your offer',
    login: 'Login',
    cancel: 'Cancel',
    fieldRequired: 'This field is required',
  },
};

const countries = [
  { code: 'USA', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'Canada', name: 'Canada' },
  { code: 'Australia', name: 'Australia' },
  { code: 'Germany', name: 'Germany' },
  { code: 'Switzerland', name: 'Switzerland' },
  { code: 'Singapore', name: 'Singapore' },
  { code: 'Hong Kong', name: 'Hong Kong' },
  { code: 'China', name: 'China' },
  { code: 'Japan', name: 'Japan' },
  { code: 'France', name: 'France' },
  { code: 'Netherlands', name: 'Netherlands' },
];

export default function SubmitOfferForm({ locale = 'zh', onSuccess, onCancel }: SubmitOfferFormProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const t = translations[locale];

  // Form state
  const [universityName, setUniversityName] = useState('');
  const [programName, setProgramName] = useState('');
  const [degree, setDegree] = useState<DegreeType>('Master');
  const [country, setCountry] = useState('');
  const [admissionResult, setAdmissionResult] = useState<'admitted' | 'rejected' | 'waitlisted'>('admitted');
  const [scholarshipType, setScholarshipType] = useState<'full' | 'partial' | 'none'>('none');
  const [scholarshipAmount, setScholarshipAmount] = useState('');
  const [scholarshipCurrency, setScholarshipCurrency] = useState('USD');
  const [gpa, setGpa] = useState('');
  const [gre, setGre] = useState('');
  const [toefl, setToefl] = useState('');
  const [ielts, setIelts] = useState('');
  const [publications, setPublications] = useState('0');
  const [researchExperience, setResearchExperience] = useState('0');
  const [internships, setInternships] = useState('0');
  const [aiToolsUsed, setAiToolsUsed] = useState('');
  const [timeline, setTimeline] = useState('');
  const [advice, setAdvice] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  // Honeypot field for spam detection (hidden from real users)
  const [website, setWebsite] = useState('');

  useEffect(() => {
    setUser(getCurrentUser());
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Honeypot check - if filled, it's a bot
    if (website) {
      // Silently reject but show success to fool bots
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.('offer-' + Date.now());
      }, 2000);
      return;
    }

    // Content moderation check for advice field
    if (advice.trim()) {
      const modResult = contentModerationApi.moderate(advice.trim(), user.id, 'comment');
      if (!modResult.isAllowed) {
        alert(modResult.reason || '内容审核未通过，请修改后重试');
        return;
      }
    }

    setIsSubmitting(true);

    const isDemo = (await import('@/lib/supabase')).isDemoMode();

    if (!isDemo) {
      // Real mode: save to Supabase via API
      try {
        const { getAuthHeaders } = await import('@/lib/auth');
        const headers = await getAuthHeaders();
        const res = await fetch('/api/offers', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            university_name: universityName,
            university_slug: universityName.toLowerCase().replace(/\s+/g, '-'),
            program: programName,
            admission_result: admissionResult === 'admitted' ? 'accepted' : admissionResult,
            background: JSON.stringify({
              gpa: gpa || 'N/A',
              gre: gre || 'N/A',
              toefl: toefl || 'N/A',
              ielts: ielts || 'N/A',
              publications: parseInt(publications) || 0,
              researchExperience: parseInt(researchExperience) || 0,
              internships: parseInt(internships) || 0,
              degree,
              country,
              scholarship: { amount: parseInt(scholarshipAmount) || 0, currency: scholarshipCurrency, type: scholarshipType },
              aiToolsUsed: aiToolsUsed.split(',').map(t => t.trim()).filter(Boolean),
              timeline,
              advice,
              isAnonymous,
            }),
            tools_used: aiToolsUsed.split(',').map(t => t.trim()).filter(Boolean),
          }),
        });
        if (res.ok) {
          const json = await res.json();
          setShowSuccess(true);
          setIsSubmitting(false);
          setTimeout(() => {
            setShowSuccess(false);
            onSuccess?.(json.data?.id || 'offer-' + Date.now());
          }, 2000);
          return;
        }
      } catch (e) {
        console.error('[SubmitOfferForm] API call failed:', e);
      }
    }

    // Demo mode or API fallback: save to localStorage
    await new Promise(resolve => setTimeout(resolve, 800));

    const offerId = 'offer-' + Date.now();

    if (typeof window !== 'undefined') {
      const offersKey = 'demo_offers';
      const stored = localStorage.getItem(offersKey);
      const offers = stored ? JSON.parse(stored) : {};

      if (!offers[user.id]) {
        offers[user.id] = [];
      }

      offers[user.id].push({
        id: offerId,
        userId: user.id,
        userName: isAnonymous ? (locale === 'zh' ? '匿名用户' : 'Anonymous') : user.name || user.email,
        userAvatar: isAnonymous
          ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        universityName,
        universityLogo: '',
        universityCountry: country,
        programName,
        degree,
        admissionResult,
        scholarship: {
          amount: parseInt(scholarshipAmount) || 0,
          currency: scholarshipCurrency,
          type: scholarshipType,
        },
        background: {
          gpa: gpa || 'N/A',
          gre: gre || 'N/A',
          toefl: toefl || 'N/A',
          ielts: ielts || 'N/A',
          publications: parseInt(publications) || 0,
          researchExperience: parseInt(researchExperience) || 0,
          internships: parseInt(internships) || 0,
        },
        aiToolsUsed: aiToolsUsed.split(',').map(t => t.trim()).filter(Boolean),
        timeline,
        advice,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
      });

      localStorage.setItem(offersKey, JSON.stringify(offers));
    }

    setShowSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setShowSuccess(false);
      onSuccess?.(offerId);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.loginRequired}</h3>
        <a
          href="/auth/login"
          className="inline-block px-6 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          {t.login}
        </a>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.success}</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.universityName} *
            </label>
            <input
              type="text"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              required
              placeholder={t.universityNamePlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.programName} *
            </label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              required
              placeholder={t.programNamePlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.degree}
            </label>
            <select
              value={degree}
              onChange={(e) => setDegree(e.target.value as DegreeType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              {DEGREE_TYPES.map(d => (
                <option key={d} value={d}>{DEGREE_LABELS[d][locale === 'zh' ? 'zh' : 'en']}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.country}
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Select...</option>
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.admissionResult}
            </label>
            <select
              value={admissionResult}
              onChange={(e) => setAdmissionResult(e.target.value as typeof admissionResult)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="admitted">{t.admitted}</option>
              <option value="rejected">{t.rejected}</option>
              <option value="waitlisted">{t.waitlisted}</option>
            </select>
          </div>
        </div>

        {/* Scholarship */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.scholarship}
          </label>
          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={scholarshipType}
              onChange={(e) => setScholarshipType(e.target.value as typeof scholarshipType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="none">{t.none}</option>
              <option value="partial">{t.partial}</option>
              <option value="full">{t.full}</option>
            </select>
            {scholarshipType !== 'none' && (
              <>
                <input
                  type="number"
                  value={scholarshipAmount}
                  onChange={(e) => setScholarshipAmount(e.target.value)}
                  placeholder={t.scholarshipAmount}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <select
                  value={scholarshipCurrency}
                  onChange={(e) => setScholarshipCurrency(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="CHF">CHF</option>
                  <option value="SGD">SGD</option>
                  <option value="HKD">HKD</option>
                  <option value="CNY">CNY</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.background}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <input
                type="text"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder={t.gpa}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <input
                type="text"
                value={gre}
                onChange={(e) => setGre(e.target.value)}
                placeholder={t.gre}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <input
                type="text"
                value={toefl}
                onChange={(e) => setToefl(e.target.value)}
                placeholder={t.toefl}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <input
                type="text"
                value={ielts}
                onChange={(e) => setIelts(e.target.value)}
                placeholder={t.ielts}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                value={publications}
                onChange={(e) => setPublications(e.target.value)}
                min="0"
                placeholder={t.publications}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                value={researchExperience}
                onChange={(e) => setResearchExperience(e.target.value)}
                min="0"
                placeholder={t.researchExperience}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
            <div>
              <input
                type="number"
                value={internships}
                onChange={(e) => setInternships(e.target.value)}
                min="0"
                placeholder={t.internships}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* AI Tools */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.aiToolsUsed}
          </label>
          <input
            type="text"
            value={aiToolsUsed}
            onChange={(e) => setAiToolsUsed(e.target.value)}
            placeholder={t.aiToolsPlaceholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.timeline}
          </label>
          <input
            type="text"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder={t.timelinePlaceholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Advice */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.advice}
          </label>
          <textarea
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            rows={4}
            placeholder={t.advicePlaceholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
        </div>

        {/* Anonymous */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
          />
          <label htmlFor="anonymous" className="text-sm text-gray-600">
            {t.anonymous}
          </label>
        </div>

        {/* Honeypot field - hidden from real users, bots will fill it */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t.cancel}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !universityName || !programName}
            className="flex-1 px-6 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
