import React, { useState, useEffect } from 'react';
import { demoAuthApi, getCurrentUser, onAuthStateChange, type DemoUser } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';

const translations = {
  zh: {
    title: '账户设置',
    profileInfo: '个人信息',
    email: '邮箱',
    nickname: '昵称',
    nicknamePlaceholder: '输入昵称',
    saveChanges: '保存更改',
    dangerZone: '危险区域',
    signOut: '退出登录',
    saved: '保存成功！',
  },
  en: {
    title: 'Account Settings',
    profileInfo: 'Profile Information',
    email: 'Email',
    nickname: 'Nickname',
    nicknamePlaceholder: 'Enter nickname',
    saveChanges: 'Save Changes',
    dangerZone: 'Danger Zone',
    signOut: 'Sign Out',
    saved: 'Saved successfully!',
  },
};

const USERS_KEY = 'demo_users';

export default function Settings({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const t = translations[locale];

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      setName(currentUser.name);
    }

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      if (newUser) {
        setName(newUser.name);
      }
    });

    return unsubscribe;
  }, []);

  const handleSave = async () => {
    if (!user) return;

    // Update in localStorage
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      if (users[user.id]) {
        users[user.id].name = name;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }

    // Update session
    const updatedUser = { ...user, name };
    sessionStorage.setItem('demo_session', JSON.stringify(updatedUser));

    // Update cookie
    document.cookie = `demo_auth=${JSON.stringify(updatedUser)};path=/;SameSite=Lax`;

    alert(t.saved);
  };

  const handleSignOut = async () => {
    await demoAuthApi.signOut();
    window.location.href = '/';
  };

  // Redirect to login if not authenticated (only after mount)
  useEffect(() => {
    if (!user && !loading) {
      window.location.href = getAuthLoginHref();
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>
          <div className="text-center py-12 text-gray-500">
            {!user ? '跳转中...' : '加载中...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t.profileInfo}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.nickname}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.nicknamePlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-6 w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            {t.saveChanges}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">{t.dangerZone}</h2>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </div>
  );
}
