import React, { useState, useEffect } from 'react';
import { onAuthStateChange, initAuth, type DemoUser } from '@/lib/auth';
import { getAuthHeaders } from '@/lib/auth';
import { isDemoMode } from '@/lib/supabase';
import { getAuthLoginHref } from '@/lib/i18n';
import { toolsData } from '@/data/toolsData';
import { paymentSolutionsData } from '@/data/paymentSolutions';
import { policiesData } from '@/data/policies';
import { promptTemplates } from '@/data/promptTemplates';

const translations = {
  zh: {
    title: '我的互动',
    loading: '加载中...',
    empty: '暂无互动记录',
    post: '帖子',
    comment: '评论',
    like: '点赞',
    favorite: '收藏',
    share: '分享',
    readMore: '查看原帖',
  },
  en: {
    title: 'My Activity',
    loading: 'Loading...',
    empty: 'No activity yet',
    post: 'Post',
    comment: 'Comment',
    like: 'Like',
    favorite: 'Favorite',
    share: 'Share',
    readMore: 'View original',
  },
};

interface ActivityItem {
  type: 'post' | 'comment' | 'like' | 'favorite' | 'share';
  id: string;
  title: string;
  snippet: string;
  createdAt: string;
  href: string;
  targetType?: string;
  targetId?: string;
}

// Helper to get item name from data
function getItemName(type: string, id: string, title?: string): { name: string; href: string } {
  switch (type) {
    case 'tool': {
      const tool = toolsData.find(t => t.slug === id || t.id === id);
      return { name: tool?.name || `工具 #${id}`, href: `/tools/${id}` };
    }
    case 'prompt': {
      const prompt = promptTemplates.find((p: { id: string }) => p.id === id);
      return { name: prompt?.title || `Prompt #${id}`, href: `/prompts/${id}` };
    }
    case 'policy': {
      const policy = policiesData.find(p => p.id === id);
      return { name: policy?.universityName || `政策 #${id}`, href: `/policies/${id}` };
    }
    case 'payment_solution': {
      const solution = paymentSolutionsData.find(s => s.id === id);
      return { name: solution?.title || `支付方案 #${id}`, href: `/payment/${id}` };
    }
    case 'survival': {
      return { name: `防坑指南 #${id}`, href: `/survival/${id}` };
    }
    case 'community': {
      return { name: title || `社区帖子 #${id}`, href: `/community/${id}` };
    }
    case 'question': {
      return { name: title || `问答 #${id}`, href: `/questions/${id}` };
    }
    default:
      return { name: `${type} #${id}`, href: `/${type}/${id}` };
  }
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
  const [authReady, setAuthReady] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const t = translations[locale];

  useEffect(() => {
    initAuth().then(user => {
      setUser(user);
      setAuthReady(true);
    });

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authReady) return; // still waiting for auth
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadActivity() {
      if (!isDemoMode()) {
        const headers = await getAuthHeaders();

        // 1. Community activity (posts + comments)
        const apiItems = await fetchActivityFromApi();

        // 2. Content comments
        let contentComments: ActivityItem[] = [];
        try {
          const res = await fetch(`/api/content-comments?user_id=${user!.id}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.comments) {
              contentComments = data.comments.map((c: any) => {
                const info = getItemName(c.target_type, c.target_id);
                return {
                  type: 'comment' as const,
                  id: c.id,
                  title: info.name,
                  snippet: (c.content || '').substring(0, 120),
                  createdAt: c.created_at,
                  href: info.href,
                  targetType: c.target_type,
                  targetId: c.target_id,
                };
              });
            }
          }
        } catch {}

        // 3. Content likes
        let contentLikes: ActivityItem[] = [];
        try {
          const res = await fetch(`/api/content-likes?user_id=${user!.id}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.likes) {
              contentLikes = data.likes.map((l: any) => {
                const info = getItemName(l.target_type, l.target_id);
                return {
                  type: 'like' as const,
                  id: l.id,
                  title: info.name,
                  snippet: `点赞了 ${info.name}`,
                  createdAt: l.created_at,
                  href: info.href,
                  targetType: l.target_type,
                  targetId: l.target_id,
                };
              });
            }
          }
        } catch {}

        // 4. Content favorites (from favorites API)
        let contentFavorites: ActivityItem[] = [];
        try {
          const res = await fetch('/api/favorites', { headers });
          if (res.ok) {
            const data = await res.json();
            const favs = data.favorites || [];
            contentFavorites = favs.map((f: any) => {
              const info = getItemName(f.target_type, f.target_id);
              return {
                type: 'favorite' as const,
                id: f.id || `${f.target_type}_${f.target_id}`,
                title: info.name,
                snippet: `收藏了 ${info.name}`,
                createdAt: f.created_at || new Date().toISOString(),
                href: info.href,
                targetType: f.target_type,
                targetId: f.target_id,
              };
            });
          }
        } catch {}

        // 5. Content shares
        let contentShares: ActivityItem[] = [];
        try {
          const res = await fetch(`/api/content-shares?user_id=${user!.id}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.shares) {
              contentShares = data.shares.map((s: any) => {
                const title = s.community_posts?.title;
                const info = getItemName(s.target_type, s.target_id, title);
                return {
                  type: 'share' as const,
                  id: s.id,
                  title: info.name,
                  snippet: `分享了 ${info.name} (${s.platform || 'copy_link'})`,
                  createdAt: s.created_at,
                  href: info.href,
                  targetType: s.target_type,
                  targetId: s.target_id,
                };
              });
            }
          }
        } catch {}

        // Merge and sort by date
        const allItems = [
          ...apiItems,
          ...contentComments,
          ...contentLikes,
          ...contentFavorites,
          ...contentShares,
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setItems(allItems);
        setLoading(false);
        return;
      }

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
      case 'like': return '❤️';
      case 'favorite': return '⭐';
      case 'share': return '🔗';
      default: return '📌';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'post': return t.post;
      case 'comment': return t.comment;
      case 'like': return t.like;
      case 'favorite': return t.favorite;
      case 'share': return t.share;
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-700';
      case 'comment': return 'bg-green-100 text-green-700';
      case 'like': return 'bg-red-100 text-red-700';
      case 'favorite': return 'bg-yellow-100 text-yellow-700';
      case 'share': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  const filterOptions = [
    { key: 'all', label: `全部 (${items.length})` },
    { key: 'comment', label: `${t.comment} (${items.filter(i => i.type === 'comment').length})` },
    { key: 'like', label: `${t.like} (${items.filter(i => i.type === 'like').length})` },
    { key: 'share', label: `${t.share} (${items.filter(i => i.type === 'share').length})` },
    { key: 'post', label: `${t.post} (${items.filter(i => i.type === 'post').length})` },
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>
          <div className="flex flex-col items-center justify-center py-12"><div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-3" style={{ borderWidth: "3px" }} /><p className="text-sm text-gray-500">{t.loading}</p></div>
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === opt.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{t.empty}</div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(item.type)}`}>
                        {getTypeName(item.type)}
                      </span>
                      {item.targetType && (
                        <span className="text-xs text-gray-400">
                          {item.targetType === 'tool' ? 'AI工具' :
                           item.targetType === 'policy' ? '大学政策' :
                           item.targetType === 'prompt' ? 'Prompt' :
                           item.targetType === 'survival' ? '防坑指南' :
                           item.targetType === 'payment_solution' ? '支付方案' :
                           item.targetType}
                        </span>
                      )}
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