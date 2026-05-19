import React, { useState, useRef, useEffect } from 'react';
import { demoAuthApi, getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';

interface UserMenuProps {
  locale?: 'zh' | 'en';
}

// Generate locale-aware href
// Auth pages don't have /en/ versions, they use locale prop internally
function getLocaleHref(path: string, locale: 'zh' | 'en'): string {
  // Auth pages are shared - no /en/ prefix
  if (path.startsWith('/auth/')) {
    return path;
  }
  if (locale === 'zh') {
    return path;
  }
  return `/${locale}${path}`;
}

const translations = {
  zh: {
    signIn: '登录',
    register: '注册',
    userCenter: '用户中心',
    myFavorites: '我的收藏',
    myRatings: '我的评分',
    myOffers: '我的Offer',
    settings: '设置',
    signOut: '退出登录',
    demoMode: '演示模式',
  },
  en: {
    signIn: 'Sign In',
    register: 'Register',
    userCenter: 'User Center',
    myFavorites: 'My Favorites',
    myRatings: 'My Ratings',
    myOffers: 'My Offers',
    settings: 'Settings',
    signOut: 'Sign Out',
    demoMode: 'Demo Mode',
  },
};

export default function UserMenu({ locale = 'zh' }: UserMenuProps) {
  // Initialize as null to avoid hydration mismatch - user will be fetched in useEffect
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[locale];

  // Mark as hydrated after first render to prevent hydration flash
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    // Also check for existing user after mount (handles page refresh scenario)
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await demoAuthApi.signOut();
    setIsOpen(false);
    window.location.href = '/';
  };

  // Prevent flash during hydration - show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={getLocaleHref('/auth/login', locale)}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
        >
          {t.signIn}
        </a>
        <a
          href={getLocaleHref('/auth/register', locale)}
          className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          {t.register}
        </a>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button - 点击打开下拉菜单 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-medium overflow-hidden hover:ring-2 hover:ring-primary-300 transition-all"
        aria-label="User menu"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-sm font-semibold">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <a
              href="/user/settings"
              className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-medium flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </a>
          </div>

          <div className="py-1">
            <a
              href="/user/favorites"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {t.myFavorites}
            </a>
            <a
              href="/user/ratings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t.myRatings}
            </a>
            <a
              href="/user/offers"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.myOffers}
            </a>
            <a
              href="/user"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t.userCenter}
            </a>
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t.signOut}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
