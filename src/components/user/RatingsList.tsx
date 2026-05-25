import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange, initAuth, type DemoUser } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';
import { toolsData } from '@/data/toolsData';
import { promptTemplates } from '@/data/promptTemplates';

const RATINGS_KEY = 'demo_ratings';

const translations = {
  zh: {
    title: '我的评分',
    loading: '加载中...',
    empty: '暂无评分记录',
    failed: '加载失败',
    tool: 'AI工具',
    prompt: 'Prompt模板',
  },
  en: {
    title: 'My Ratings',
    loading: 'Loading...',
    empty: 'No ratings yet',
    failed: 'Failed to load',
    tool: 'AI Tool',
    prompt: 'Prompt Template',
  },
};

// Helper to get rated item details
function getRatedItem(targetType: string, targetId: string): { name: string; description?: string; href: string } | null {
  switch (targetType) {
    case 'tool': {
      const tool = toolsData.find(t => t.id === targetId);
      if (tool) {
        return {
          name: tool.name,
          description: tool.description,
          href: `/tools/${tool.slug}`,
        };
      }
      break;
    }
    case 'prompt': {
      const prompt = promptTemplates.find(p => p.id === targetId);
      if (prompt) {
        return {
          name: prompt.title,
          description: prompt.description,
          href: `/prompts/${prompt.id}`,
        };
      }
      break;
    }
  }
  return null;
}

function getRatings(): Record<string, Record<string, number>> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(RATINGS_KEY);
  return stored ? JSON.parse(stored) : {};
}

export default function RatingsList({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ratings, setRatings] = useState<{ targetType: string; targetId: string; rating: number; name: string; description?: string; href: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[locale];

  useEffect(() => {
    // Initialize auth first so OAuth sessions are detected synchronously
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

    const allRatings = getRatings();
    const userRatings = allRatings[user.id] || {};
    const parsed = Object.entries(userRatings).map(([key, rating]) => {
      const [targetType, targetId] = key.split('_');
      const item = getRatedItem(targetType, targetId);
      return {
        targetType,
        targetId,
        rating,
        name: item?.name || `${targetType} #${targetId}`,
        description: item?.description,
        href: item?.href || `/${targetType}s/${targetId}`,
      };
    });
    setRatings(parsed);
    setLoading(false);
  }, [user]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tool': return '🛠️';
      case 'prompt': return '📝';
      default: return '⭐';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'tool': return t.tool;
      case 'prompt': return t.prompt;
      default: return type;
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        {ratings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t.empty}</div>
        ) : (
          <div className="space-y-4">
            {ratings.map((r, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {getTypeIcon(r.targetType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {getTypeName(r.targetType)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        <a href={r.href} className="hover:text-primary-600 transition-colors">
                          {r.name}
                        </a>
                      </h3>
                      {r.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(r.rating)}
                  <span className="text-sm text-gray-500 ml-1">{r.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
