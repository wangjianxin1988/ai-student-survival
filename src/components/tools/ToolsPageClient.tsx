import { useState, useEffect, useMemo } from 'react';
import type { Tool } from '@/lib/supabase';
import { staticTools } from '@/data/static-tools';
import { getLocaleHref } from '@/lib/i18n';
import AdSlot from '@/components/ads/AdSlotReact';

interface CommunityTool {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: { name: string; avatar?: string };
}

interface ToolsPageClientProps {
  initialLocale: string;
  translations: {
    title: string;
    description: string;
    categories: Record<string, string>;
    pricing: Record<string, string>;
    showResults: string;
    free: string;
    freePlus: string;
    new: string;
    viewDetails: string;
    noResults: string;
    clearFilters: string;
    dbConnected: string;
  };
}

export default function ToolsPageClient({ initialLocale, translations }: ToolsPageClientProps) {
  const [locale, setLocale] = useState(initialLocale);
  const [allTools, setAllTools] = useState<Tool[]>(staticTools);
  const [communityTools, setCommunityTools] = useState<CommunityTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);

  // Filter states
  const [category, setCategory] = useState('');
  const [pricing, setPricing] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get('category') || '');
    setPricing(params.get('pricing') || '');
    setSearch(params.get('q') || '');
    setSortBy(params.get('sort') || 'rating');
  }, []);

  // Fetch tools data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Try Supabase if configured
        const supabaseUrl = (window as any).import.meta?.env?.PUBLIC_SUPABASE_URL;
        const supabaseKey = (window as any).import.meta?.env?.PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
          const params: { category?: string; pricing?: string; search?: string } = {};
          if (category) params.category = category;
          if (pricing) params.pricing = pricing;
          if (search) params.search = search;

          try {
            const { getTools } = await import('@/lib/supabase');
            const dbTools = await getTools(params);
            if (dbTools && dbTools.length > 0) {
              setAllTools(dbTools);
              setIsUsingSupabase(true);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Supabase fetch failed:', e);
          }
        }

        // Use static data
        setAllTools(staticTools);
        setIsUsingSupabase(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [category, pricing, search]);

  // Fetch community tools
  useEffect(() => {
    async function fetchCommunity() {
      try {
        const { getPosts } = await import('@/lib/community/storage');
        const result = await getPosts({ category: 'tools', autoPromoted: true, limit: 6 });
        setCommunityTools(result?.posts || []);
      } catch (e) {
        console.warn('Failed to fetch community tools:', e);
      }
    }
    fetchCommunity();
  }, []);

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = allTools;

    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }
    if (pricing) {
      filtered = filtered.filter(t => t.pricing === pricing);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'updated') {
      filtered = [...filtered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [allTools, category, pricing, search, sortBy]);

  const categories = [
    { value: '', label: translations.categories.all || '全部' },
    { value: 'agent', label: translations.categories.agent || 'Agent' },
    { value: 'writing', label: translations.categories.writing || '写作' },
    { value: 'coding', label: translations.categories.coding || '编程' },
    { value: 'design', label: translations.categories.design || '设计' },
    { value: 'research', label: translations.categories.research || '研究' },
    { value: 'communication', label: translations.categories.communication || '对话' },
  ];

  const pricingOptions = [
    { value: '', label: translations.pricing.all || '全部' },
    { value: 'free', label: translations.pricing.free || '免费' },
    { value: 'freemium', label: translations.pricing.freemium || '免费+付费' },
    { value: 'paid', label: translations.pricing.paid || '付费' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    window.location.href = `/tools?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Recommended Section */}
      {communityTools.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              社区推荐
            </h2>
            <a href="/community?category=tools" className="text-sm text-blue-600 hover:text-blue-700">
              查看更多 →
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityTools.map(post => (
              <a key={post.id} href={getLocaleHref(`/community/${post.slug}`, locale)} className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {post.coverImage && (
                  <img src={post.coverImage} alt={post.title} className="w-full h-32 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {translations.showResults?.replace('{count}', filteredTools.length.toString()) || `显示 ${filteredTools.length} 个结果`}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">排序:</label>
            <select
              className="input py-1.5 text-sm w-auto min-w-[140px]"
              value={sortBy}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="rating">评分最高</option>
              <option value="updated">最近更新</option>
              <option value="name">名称排序</option>
            </select>
          </div>
          <a href="/compare" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            {locale === 'en' ? 'Compare Tools' : '对比工具'}
          </a>
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <>
              <article key={tool.id} className="tool-card group">
                <div className="tool-card-image">
                  <img
                    src={tool.imageUrl}
                    alt={tool.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="tool-card-body">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary-600 transition-colors">
                      <a href={getLocaleHref(`/tools/${tool.slug}`, locale)}>{tool.name}</a>
                    </h3>
                    {tool.isNew && (
                      <span className="badge bg-red-100 text-red-700">{translations.new || '新'}</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tool.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`rating-star ${star <= Math.round(tool.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium">{tool.rating}</span>
                      <span className="text-xs text-gray-500">({tool.ratingCount})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`badge ${
                        tool.pricing === 'free' ? 'badge-free' :
                        tool.pricing === 'paid' ? 'badge-paid' : 'badge-freemium'
                      }`}>
                        {tool.pricing === 'free' ? translations.free :
                         tool.pricing === 'paid' ? `$${tool.priceDetail.monthly}/mo` : translations.freePlus}
                      </span>
                      <a
                        href={getLocaleHref(`/tools/${tool.slug}`, locale)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {translations.viewDetails || '查看详情'}
                      </a>
                    </div>
                  </div>
                </div>
              </article>
              {/* Ad after every 6 tools */}
              {(index + 1) % 6 === 0 && index < filteredTools.length - 1 && (
                <div className="sm:col-span-2 lg:col-span-3 adsense-in-feed">
                  <AdSlot format="horizontal" className="w-full" />
                </div>
              )}
            </>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{translations.noResults || '没有找到结果'}</h3>
          <p className="text-gray-600 mb-4">Try adjusting filters or search terms</p>
          <a href="/tools" className="btn-outline">{translations.clearFilters || '清除筛选'}</a>
        </div>
      )}
    </div>
  );
}
