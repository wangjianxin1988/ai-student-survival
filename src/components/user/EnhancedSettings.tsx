import React, { useState, useEffect, useRef } from 'react';
import { demoAuthApi, getCurrentUser, onAuthStateChange, notifyAuthChange, getAuthHeaders, saveDemoSession, type DemoUser } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';

interface UserSettings {
  name: string;
  bio: string;
  avatar: string;
  privacy: 'public' | 'private';
  notifications: {
    email: boolean;
    newFollower: boolean;
    newComment: boolean;
    newFavorite: boolean;
    newRating: boolean;
    weeklyDigest: boolean;
  };
  language: 'zh' | 'en';
}

const defaultSettings: UserSettings = {
  name: '',
  bio: '',
  avatar: '',
  privacy: 'public',
  notifications: {
    email: true,
    newFollower: true,
    newComment: true,
    newFavorite: true,
    newRating: true,
    weeklyDigest: false,
  },
  language: 'zh',
};

const translations = {
  zh: {
    title: '账户设置',
    profileInfo: '个人信息',
    email: '邮箱',
    nickname: '昵称',
    nicknamePlaceholder: '输入昵称',
    bio: '个人简介',
    bioPlaceholder: '介绍一下你自己...',
    avatar: '头像',
    uploadAvatar: '上传头像',
    avatarHint: '点击上传或拖拽图片到此处，支持 JPG、PNG，最大 2MB',
    saveChanges: '保存更改',
    privacy: '隐私设置',
    privacyPublic: '公开',
    privacyPublicDesc: '其他用户可以查看你的个人主页、收藏和评分',
    privacyPrivate: '私密',
    privacyPrivateDesc: '其他用户只能看到你的用户名，无法查看详细信息',
    notifications: '通知设置',
    notifEmail: '邮件通知',
    notifNewFollower: '新粉丝通知',
    notifNewComment: '评论提醒',
    notifNewFavorite: '收藏提醒',
    notifNewRating: '评分提醒',
    notifWeeklyDigest: '每周摘要',
    dangerZone: '危险区域',
    signOut: '退出登录',
    deleteAccount: '删除账户',
    deleteConfirm: '确定要删除账户吗？此操作不可撤销。',
    saved: '保存成功！',
    saveFailed: '保存失败，请重试',
    loadFailed: '加载设置失败',
    language: '语言设置',
    languageZh: '中文',
    languageEn: 'English',
  },
  en: {
    title: 'Account Settings',
    profileInfo: 'Profile Information',
    email: 'Email',
    nickname: 'Nickname',
    nicknamePlaceholder: 'Enter nickname',
    bio: 'Bio',
    bioPlaceholder: 'Tell us about yourself...',
    avatar: 'Avatar',
    uploadAvatar: 'Upload Avatar',
    avatarHint: 'Click to upload or drag and drop image, supports JPG, PNG, max 2MB',
    saveChanges: 'Save Changes',
    privacy: 'Privacy Settings',
    privacyPublic: 'Public',
    privacyPublicDesc: 'Other users can view your profile, favorites, and ratings',
    privacyPrivate: 'Private',
    privacyPrivateDesc: 'Other users can only see your username',
    notifications: 'Notification Settings',
    notifEmail: 'Email Notifications',
    notifNewFollower: 'New Follower',
    notifNewComment: 'Comment Alerts',
    notifNewFavorite: 'Favorite Alerts',
    notifNewRating: 'Rating Alerts',
    notifWeeklyDigest: 'Weekly Digest',
    dangerZone: 'Danger Zone',
    signOut: 'Sign Out',
    deleteAccount: 'Delete Account',
    deleteConfirm: 'Are you sure you want to delete your account? This action cannot be undone.',
    saved: 'Saved successfully!',
    saveFailed: 'Save failed, please try again',
    loadFailed: 'Failed to load settings',
    language: 'Language',
    languageZh: '中文',
    languageEn: 'English',
  },
};

export default function EnhancedSettings({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[locale];

  // Fetch settings from API
  const fetchSettings = async (currentUser: DemoUser) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/users/profile', {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        console.error('[EnhancedSettings] Failed to fetch profile:', res.status);
        return;
      }

      const result = await res.json();
      if (result.success && result.data) {
        const data = result.data;
        const newSettings: UserSettings = {
          name: data.name || currentUser.name || '',
          bio: data.bio || '',
          avatar: data.avatar || currentUser.avatar || '',
          privacy: data.privacy || 'public',
          notifications: data.notifications || defaultSettings.notifications,
          language: data.language || 'zh',
        };
        setSettings(newSettings);
        setAvatarPreview(newSettings.avatar);
      }
    } catch (err) {
      console.error('[EnhancedSettings] Error fetching settings:', err);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      // Fetch settings from Supabase API
      fetchSettings(currentUser);
    }

    setLoading(false);

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      if (newUser) {
        fetchSettings(newUser);
      }
    });

    return unsubscribe;
  }, []);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(locale === 'zh' ? '图片大小不能超过 2MB' : 'Image size must be less than 2MB');
      return;
    }

    // Check file type - accept image/jpeg, image/png
    if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
      alert(locale === 'zh' ? '只支持 JPG、PNG 和 WebP 格式' : 'Only JPG, PNG and WebP formats are supported');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage via API
    setUploadingAvatar(true);
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await res.json();
      if (result.success && result.url) {
        setAvatarPreview(result.url);
        setSettings(prev => ({ ...prev, avatar: result.url }));
      } else {
        console.error('[EnhancedSettings] Avatar upload failed:', result.error);
        alert(locale === 'zh' ? '头像上传失败，请重试' : 'Avatar upload failed, please try again');
      }
    } catch (err) {
      console.error('[EnhancedSettings] Avatar upload error:', err);
      alert(locale === 'zh' ? '头像上传失败，请重试' : 'Avatar upload failed, please try again');
    }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settings.name,
          bio: settings.bio,
          avatar_url: settings.avatar,
          privacy: settings.privacy,
          notifications: settings.notifications,
          language: settings.language,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        console.error('[EnhancedSettings] Save failed:', result.error);
        alert(t.saveFailed);
        setSaving(false);
        return;
      }

      // Update local auth state for UI consistency
      const updatedUser = { ...user, name: settings.name, avatar: settings.avatar };
      notifyAuthChange(updatedUser);

      alert(t.saved);
    } catch (err) {
      console.error('[EnhancedSettings] Save error:', err);
      alert(t.saveFailed);
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    await demoAuthApi.signOut();
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    if (confirm(t.deleteConfirm)) {
      // Remove user data from localStorage (demo mode cleanup)
      const USERS_KEY = 'demo_users';
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        delete users[user.id];
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      // Clear session
      sessionStorage.removeItem('demo_session');
      document.cookie = 'demo_auth=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';

      // Redirect to home
      window.location.href = '/';
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getAuthLoginHref();
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>
          <div className="text-center py-12 text-gray-500">
            {!user ? (locale === 'zh' ? '跳转中...' : 'Redirecting...') : (locale === 'zh' ? '加载中...' : 'Loading...')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        {/* Profile Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t.profileInfo}</h2>

          {/* Avatar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.avatar}</label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="text-sm text-gray-500">{t.avatarHint}</div>
            </div>
          </div>

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
                value={settings.name}
                onChange={(e) => updateSetting('name', e.target.value)}
                placeholder={t.nicknamePlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.bio}
              </label>
              <textarea
                value={settings.bio}
                onChange={(e) => updateSetting('bio', e.target.value)}
                placeholder={t.bioPlaceholder}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.language}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value="zh"
                    checked={settings.language === 'zh'}
                    onChange={() => updateSetting('language', 'zh')}
                    className="w-4 h-4 text-primary-500"
                  />
                  <span>{t.languageZh}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={settings.language === 'en'}
                    onChange={() => updateSetting('language', 'en')}
                    className="w-4 h-4 text-primary-500"
                  />
                  <span>{t.languageEn}</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || uploadingAvatar}
            className="mt-6 w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {saving ? (locale === 'zh' ? '保存中...' : 'Saving...') : uploadingAvatar ? (locale === 'zh' ? '上传中...' : 'Uploading...') : t.saveChanges}
          </button>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t.privacy}</h2>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={settings.privacy === 'public'}
                onChange={() => updateSetting('privacy', 'public')}
                className="mt-1 w-4 h-4 text-primary-500"
              />
              <div>
                <div className="font-medium text-gray-900">{t.privacyPublic}</div>
                <div className="text-sm text-gray-500">{t.privacyPublicDesc}</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={settings.privacy === 'private'}
                onChange={() => updateSetting('privacy', 'private')}
                className="mt-1 w-4 h-4 text-primary-500"
              />
              <div>
                <div className="font-medium text-gray-900">{t.privacyPrivate}</div>
                <div className="text-sm text-gray-500">{t.privacyPrivateDesc}</div>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t.notifications}</h2>

          <div className="space-y-4">
            {[
              { key: 'newFollower', label: t.notifNewFollower },
              { key: 'newComment', label: t.notifNewComment },
              { key: 'newFavorite', label: t.notifNewFavorite },
              { key: 'newRating', label: t.notifNewRating },
              { key: 'weeklyDigest', label: t.notifWeeklyDigest },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between py-2">
                <span className="text-gray-700">{label}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.notifications[key as keyof typeof settings.notifications]}
                    onChange={(e) => updateNotification(key as keyof typeof settings.notifications, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all cursor-pointer"></div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">{t.dangerZone}</h2>

          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
            >
              {t.signOut}
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              {t.deleteAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
