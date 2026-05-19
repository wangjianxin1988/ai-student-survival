import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getAuthLoginHref } from '@/lib/i18n';

interface OfferFormProps {
  locale?: 'zh' | 'en';
  onSuccess?: () => void;
}

const translations = {
  zh: {
    title: '分享你的Offer',
    universityName: '大学名称',
    program: '申请项目',
    admissionResult: '录取结果',
    accepted: '录取',
    rejected: '拒信',
    waitlisted: '候补',
    background: '背景分析（可选）',
    backgroundPlaceholder: '简单描述你的背景和使用的AI工具...',
    toolsUsed: '使用的AI工具（可选）',
    toolsPlaceholder: '例如：ChatGPT, Claude, Midjourney',
    submit: '提交',
    loading: '提交中...',
    success: '提交成功！',
    error: '提交失败，请重试',
    loginRequired: '请先登录',
  },
  en: {
    title: 'Share Your Offer',
    universityName: 'University Name',
    program: 'Program',
    admissionResult: 'Admission Result',
    accepted: 'Accepted',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    background: 'Background (Optional)',
    backgroundPlaceholder: 'Briefly describe your background and AI tools used...',
    toolsUsed: 'AI Tools Used (Optional)',
    toolsPlaceholder: 'e.g., ChatGPT, Claude, Midjourney',
    submit: 'Submit',
    loading: 'Submitting...',
    success: 'Submitted successfully!',
    error: 'Submission failed, please try again',
    loginRequired: 'Please login first',
  },
};

export default function OfferForm({ locale = 'zh', onSuccess }: OfferFormProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [universityName, setUniversityName] = useState('');
  const [program, setProgram] = useState('');
  const [admissionResult, setAdmissionResult] = useState<'accepted' | 'rejected' | 'waitlisted'>('accepted');
  const [background, setBackground] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const t = translations[locale];

  useEffect(() => {
    setUser(getCurrentUser());
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      window.location.href = getAuthLoginHref();
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // In demo mode, just show success without actual DB insert
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setMessage({ type: 'success', text: t.success });
        setUniversityName('');
        setProgram('');
        setBackground('');
        setToolsUsed('');
        setIsLoading(false);
        onSuccess?.();
      }, 500);
      return;
    }

    const toolsArray = toolsUsed
      ? toolsUsed.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const { error } = await supabase
      .from('offers')
      .insert({
        university_name: universityName,
        program,
        admission_result: admissionResult,
        background,
        tools_used: toolsArray,
      });

    if (error) {
      setMessage({ type: 'error', text: t.error });
    } else {
      setMessage({ type: 'success', text: t.success });
      setUniversityName('');
      setProgram('');
      setBackground('');
      setToolsUsed('');
      onSuccess?.();
    }

    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">{t.loginRequired}</p>
        <a
          href="/auth/login"
          className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          {locale === 'zh' ? '登录' : 'Login'}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.title}</h3>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="universityName" className="block text-sm font-medium text-gray-700 mb-1">
          {t.universityName}
        </label>
        <input
          type="text"
          id="universityName"
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder={locale === 'zh' ? '例如：MIT, 斯坦福大学' : 'e.g., MIT, Stanford'}
        />
      </div>

      <div>
        <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
          {t.program}
        </label>
        <input
          type="text"
          id="program"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder={locale === 'zh' ? '例如：计算机科学硕士' : 'e.g., MS Computer Science'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.admissionResult}
        </label>
        <div className="flex gap-4">
          {(['accepted', 'rejected', 'waitlisted'] as const).map((result) => (
            <label key={result} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="admissionResult"
                value={result}
                checked={admissionResult === result}
                onChange={(e) => setAdmissionResult(e.target.value as typeof admissionResult)}
                className="w-4 h-4 text-primary-500"
              />
              <span className="text-sm text-gray-700">
                {result === 'accepted' ? t.accepted :
                 result === 'rejected' ? t.rejected : t.waitlisted}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-1">
          {t.background}
        </label>
        <textarea
          id="background"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          placeholder={t.backgroundPlaceholder}
        />
      </div>

      <div>
        <label htmlFor="toolsUsed" className="block text-sm font-medium text-gray-700 mb-1">
          {t.toolsUsed}
        </label>
        <input
          type="text"
          id="toolsUsed"
          value={toolsUsed}
          onChange={(e) => setToolsUsed(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder={t.toolsPlaceholder}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t.loading : t.submit}
      </button>
    </form>
  );
}