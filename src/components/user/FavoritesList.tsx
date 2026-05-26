import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, onAuthStateChange, initAuth, getAccessToken, type DemoUser } from '@/lib/auth';
import { getAuthLoginHref } from '@/lib/i18n';
import { toolsData } from '@/data/toolsData';
import { paymentSolutionsData } from '@/data/paymentSolutions';
import { policiesData } from '@/data/policies';
import { promptTemplates } from '@/data/promptTemplates';

const translations = {
  zh: {
    title: '我的收藏',
    loading: '加载中...',
    empty: '暂无收藏',
    failed: '加载失败',
    remove: '移除',
    tool: 'AI工具',
    prompt: 'Prompt模板',
    policy: '大学政策',
    payment: '支付方案',
  },
  en: {
    title: 'My Favorites',
    loading: 'Loading...',
    empty: 'No favorites yet',
    failed: 'Failed to load',
    remove: 'Remove',
    tool: 'AI Tool',
    prompt: 'Prompt Template',
    policy: 'University Policy',
    payment: 'Payment Solution',
  },
};

// Helper to get favorite item details
function getFavoriteItem(type: string, id: string): { name: string; description?: string; href: string } | null {
  switch (type) {
    case 'tool': {
      const tool = toolsData.find(t => t.id === id);
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
      const prompt = promptTemplates.find((p: { id: string }) => p.id === id);
      if (prompt) {
        return {
          name: prompt.title,
          description: prompt.description,
          href: `/prompts/${prompt.id}`,
        };
      }
      break;
    }
    case 'policy': {
      const policy = policiesData.find(p => p.id === id);
      if (policy) {
        return {
          name: policy.universityName,
          description: policy.country,
          href: `/policies/${policy.id}`,
        };
      }
      break;
    }
    case 'payment_solution': {
      const solution = paymentSolutionsData.find(s => s.id === id);
      if (solution) {
        return {
          name: solution.title,
          description: solution.excerpt,
          href: `/payment/${solution.id}`,
        };
      }
      break;
    }
  }
  return null;
}

export default function FavoritesList({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [favorites, setFavorites] = useState<{ type: string; id: string; name: string; description?: string; href: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[locale];

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    try {
      const token = await getAccessToken();
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.favorites && Array.isArray(data.favorites)) {
          const parsed = data.favorites.map((fav: { target_type: string; target_id: string; tools?: { name: string; slug: string; description?: string } }) => {
            const item = getFavoriteItem(fav.target_type, fav.target_id);
            // Use tool data from API if available, otherwise fallback to local data
            let name = item?.name || `${fav.target_type} #${fav.target_id}`;
            let description = item?.description;
            let href = item?.href || `/${fav.target_type}s/${fav.target_id}`;

            // If it's a tool and API returned tool data, use it
            if (fav.target_type === 'tool' && fav.tools) {
              name = fav.tools.name;
              description = fav.tools.description;
              href = `/tools/${fav.tools.slug}`;
            }

            return {
              type: fav.target_type,
              id: fav.target_id,
              name,
              description,
              href,
            };
          });
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('[FavoritesList] Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

    loadFavorites();
  }, [user, loadFavorites]);

  const handleRemove = async (type: string, id: string) => {
    if (!user) return;

    try {
      const token = await getAccessToken();
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target_type: type, target_id: id }),
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(f => !(f.type === type && f.id === id)));
      }
    } catch (error) {
      console.error('[FavoritesList] Failed to remove favorite:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tool': return '🛠️';
      case 'prompt': return '📝';
      case 'policy': return '📄';
      case 'payment_solution': return '💳';
      default: return '📌';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'tool': return t.tool;
      case 'prompt': return t.prompt;
      case 'policy': return t.policy;
      case 'payment_solution': return t.payment;
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

        {favorites.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t.empty}</div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4 hover:border-gray-300 transition-colors">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {getTypeIcon(fav.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {getTypeName(fav.type)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    <a href={fav.href} className="hover:text-primary-600 transition-colors">
                      {fav.name}
                    </a>
                  </h3>
                  {fav.description && (
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                      {fav.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(fav.type, fav.id)}
                  className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                  title={t.remove}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
