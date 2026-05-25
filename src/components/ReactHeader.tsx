import React, { useEffect } from 'react';
import UserMenu from '@/components/auth/UserMenu';
import NotificationCenter from '@/components/common/NotificationCenter';
import OnboardingGuide from '@/components/common/OnboardingGuide';
import { defaultLocale } from '@/i18n';

interface LanguageSwitcherItem {
  locale: 'zh' | 'en';
  label: string;
  current: boolean;
}

interface ReactHeaderProps {
  locale?: 'zh' | 'en';
  currentPath?: string;
  siteName?: string;
  languageSwitcher?: LanguageSwitcherItem[];
  getAlternateUrl?: (locale: 'zh' | 'en') => string;
}

// Generate locale-aware href
function getLocaleHref(path: string, locale: 'zh' | 'en'): string {
  if (locale === defaultLocale) {
    return path;
  }
  return `/${locale}${path}`;
}

const baseNavLinks = [
  { href: '/tools', key: 'nav.aiTools', shortZh: 'AI工具', shortEn: 'AI Tools' },
  { href: '/payment', key: 'nav.payment', shortZh: 'AI工具支付指南', shortEn: 'AI Tools Payment' },
  { href: '/policies', key: 'nav.policies', shortZh: '大学AI政策', shortEn: 'University AI Policies' },
  { href: '/map', key: 'nav.map', shortZh: '妙妙地图', shortEn: 'Map' },
  { href: '/survival', key: 'nav.survival', shortZh: '防坑指南', shortEn: 'Survival Guide' },
  { href: '/prompts', key: 'nav.prompts', shortZh: 'Prompt', shortEn: 'Prompts' },
  { href: '/offers', key: 'nav.offers', shortZh: 'Offer', shortEn: 'Offers' },
  { href: '/questions', key: 'nav.questions', shortZh: '妙妙社区', shortEn: 'Community' },
];

const translations = {
  zh: {
    search: '搜索',
  },
  en: {
    search: 'Search',
  },
};

export default function ReactHeader({ locale = 'zh', currentPath = '/', siteName, languageSwitcher, getAlternateUrl }: ReactHeaderProps) {
  const t = translations[locale];
  const links = baseNavLinks.map(link => ({
    href: getLocaleHref(link.href, locale),
    key: link.key,
    short: locale === 'zh' ? link.shortZh : link.shortEn,
  }));

  // Mobile menu toggle effect
  useEffect(() => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    const handleClick = () => {
      mobileMenu?.classList.toggle('hidden');
    };

    mobileMenuBtn?.addEventListener('click', handleClick);

    return () => {
      mobileMenuBtn?.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        {/* Top bar: Auth & Search */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Left: Logo with site name */}
              <a href={getLocaleHref('/', locale)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="/logo.svg" alt={siteName || (locale === 'en' ? 'AI Student Survival Guide' : 'MI TO AI留学生存指南')} className="w-10 h-10 rounded-lg flex-shrink-0" />
                <span className="font-semibold text-base text-gray-900">{siteName || (locale === 'en' ? 'AI Student Survival Guide' : 'MI TO AI留学生存指南')}</span>
              </a>

              {/* Right: Language Switcher, Search, Notifications & User Menu */}
              <div className="flex items-center gap-1">
                {/* Language Switcher — integrated into header top bar */}
                {languageSwitcher && languageSwitcher.length > 0 && (
                  <div className="flex items-center gap-0.5 mr-1">
                    {languageSwitcher.map(item => (
                      <a
                        key={item.locale}
                        href={getAlternateUrl ? getAlternateUrl(item.locale) : (item.locale === 'zh' ? '/' : '/en/')}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          item.current
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-label={`Switch to ${item.label}`}
                        aria-current={item.current ? 'true' : undefined}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Search */}
                <button
                  data-search-trigger
                  aria-label={t.search}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  title={t.search}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Notification Center */}
                <NotificationCenter locale={locale} />

                {/* User Menu */}
                <UserMenu locale={locale} />
              </div>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-0.5">
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    currentPath.startsWith(link.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.short}
                </a>
              ))}
            </div>

            {/* Right Actions (mobile only) */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                type="button"
                aria-label={locale === 'zh' ? '打开菜单' : 'Open Menu'}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                id="mobile-menu-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden hidden" id="mobile-menu">
            <div className="py-3 space-y-1 border-t border-gray-100">
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    currentPath.startsWith(link.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.short}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Onboarding Guide */}
      <OnboardingGuide locale={locale} />
    </>
  );
}
