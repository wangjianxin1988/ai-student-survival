import React, { useState, useEffect } from 'react';
import { onAuthStateChange, initAuth, type DemoUser } from '@/lib/auth';
import { getAuthHeaders } from '@/lib/auth';
import { isDemoMode } from '@/lib/supabase';
import { getAuthLoginHref } from '@/lib/i18n';

const translations = {
  zh: {
    title: '我的评论',
    loading: '加载中...',
    empty: '暂无评论记录',
    post: '帖子',
    comment: '评论',
    readMore: '阅读更多',
  },
  en: {
    title: 'My Comments',
    loading: 'Loading...',
    empty: 'No comments yet',
    post: 'Post',
    comment: 'Comment',
    readMore: 'Read more',
  },
};

interface ActivityItem {
  type: 'post' | 'comment';
  id: string;
  title: string;
  snippet: string;
  createdAt: string;
  href: string;
}

async function fetchActivityFromApi(): Promise<ActivityItem[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/user/activity', { headers });
    if (!res.ok) return [];
    const json = await res.json();
    return json.items || [];
  } catch {
    return [];
  }
}

export default function RatingsList({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[locale];

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

    async function loadActivity() {
      if (!isDemoMode()) {
        const apiItems = await fetchActivityFromApi();
        if (apiItems.length > 0) {
          setItems(apiItems);
          setLoading(false);
          return;
        }
      }

      // Fallback: no data in demo mode
      setItems([]);
      setLoading(false);
    }

    loadActivity();
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      window.location.href = getAuthLoginHref();
    }
  }, [user, loading]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return '📝';
      case 'comment': return '💬';
      default: return '📌';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'post': return t.post;
      case 'comment': return t.comment;
      default: return type;
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t.empty}</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.type === 'post'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {getTypeName(item.type)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      <a href={item.href} className="hover:text-primary-600 transition-colors">
                        {item.title}
                      </a>
                    </h3>
                    {item.snippet && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {item.snippet}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <a href={item.href} className="text-xs text-primary-600 hover:text-primary-700">
                        {t.readMore} →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
