// Client-side locale detection and href generation

// Detect current locale from URL pathname
export function getCurrentLocale(): 'zh' | 'en' {
  if (typeof window === 'undefined') return 'zh';
  const pathname = window.location.pathname;
  if (pathname.startsWith('/en')) return 'en';
  return 'zh';
}

// Generate locale-aware auth href
// Note: Auth pages don't have /en/ versions, they use locale prop internally
export function getAuthLoginHref(): string {
  return '/auth/login';
}

export function getAuthRegisterHref(): string {
  return '/auth/register';
}

// Legacy function name for compatibility
// Auth pages don't have /en/ versions, they use locale prop internally
export function getLocaleHref(path: string, locale?: 'zh' | 'en'): string {
  const loc = locale || getCurrentLocale();
  // Auth pages are shared - no /en/ prefix
  if (path.startsWith('/auth/')) {
    return path;
  }
  if (loc === 'zh') {
    return path;
  }
  return `/${loc}${path}`;
}