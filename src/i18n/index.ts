import zh from './zh.json';
import en from './en.json';

export const translations = { zh, en };
export const defaultLocale = 'zh';
export const locales = ['zh', 'en'] as const;
export type Locale = typeof locales[number];

// Get nested property from object using dot notation
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Translation function
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const translation = getNestedValue(translations[locale], key)
    ?? getNestedValue(translations[defaultLocale], key)
    ?? key;

  if (typeof translation !== 'string') {
    return key;
  }

  // Replace params like {count} with actual values
  if (params) {
    return Object.entries(params).reduce((str, [k, v]) => {
      return str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }, translation);
  }

  return translation;
}

// Detect locale from URL
export function getLocaleFromUrl(url: URL | { pathname: string; search?: string }): Locale {
  // Check URL search params first (?locale=en)
  if ('search' in url && url.search) {
    const params = new URLSearchParams(url.search);
    const localeParam = params.get('locale');
    if (localeParam && locales.includes(localeParam as Locale)) {
      return localeParam as Locale;
    }
  }

  // Also check URL object for search params
  if (url instanceof URL) {
    const localeParam = url.searchParams.get('locale');
    if (localeParam && locales.includes(localeParam as Locale)) {
      return localeParam as Locale;
    }
  }

  // Check URL path for locale
  const pathLocale = url.pathname.split('/')[1];
  if (locales.includes(pathLocale as Locale)) {
    return pathLocale as Locale;
  }

  // Check localStorage as fallback (for client-side navigation)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale');
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale;
    }
  }

  // Default
  return defaultLocale;
}

// Get alternate URL for language switching
export function getAlternateUrl(url: URL, locale: Locale): string {
  const pathParts = url.pathname.split('/');
  const hasLocalePrefix = locales.includes(pathParts[1] as Locale);

  if (hasLocalePrefix) {
    // Remove existing locale prefix
    pathParts.splice(1, 1);
  }

  // If target locale is default (zh), no prefix needed, return root path
  let basePath: string;
  if (locale === defaultLocale) {
    basePath = pathParts.join('/') || '/';
  } else {
    // Insert new locale after domain
    pathParts.splice(1, 0, locale);
    basePath = pathParts.join('/');
  }

  // Preserve query string when switching languages
  if (url.search) {
    return `${basePath}${url.search}`;
  }

  return basePath;
}

// Language switcher data for UI
export function getLanguageSwitcherData(currentLocale: Locale) {
  return [
    { locale: 'zh' as Locale, label: '中文', current: currentLocale === 'zh' },
    { locale: 'en' as Locale, label: 'EN', current: currentLocale === 'en' },
  ];
}