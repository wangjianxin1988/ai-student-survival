import React, { useState, useEffect } from 'react';

interface PricingPlan {
  price: string;
  currency: string;
  period: string;
  planName: string;
  features: string[];
  lastUpdated: string;
  source: string;
}

interface ToolPricingRealtimeProps {
  toolSlug: string;
  toolName: string;
  officialUrl: string;
  initialPricing?: PricingPlan;
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    title: '实时定价',
    lastUpdated: '最后更新',
    source: '数据来源',
    refresh: '刷新',
    refreshing: '刷新中...',
    error: '获取定价失败',
    retry: '重试',
    officialSite: '访问官网',
    plans: '套餐方案',
    perMonth: '/月',
    features: '功能特性',
    scraped: '实时抓取',
    cached: '缓存数据',
  },
  en: {
    title: 'Live Pricing',
    lastUpdated: 'Last Updated',
    source: 'Source',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    error: 'Failed to fetch pricing',
    retry: 'Retry',
    officialSite: 'Visit Official Site',
    plans: 'Plans',
    perMonth: '/month',
    features: 'Features',
    scraped: 'Live scraped',
    cached: 'Cached data',
  },
};

export default function ToolPricingRealtime({ toolSlug, toolName, officialUrl, initialPricing, locale = 'zh' }: ToolPricingRealtimeProps) {
  const [pricing, setPricing] = useState<PricingPlan[]>(initialPricing ? [initialPricing] : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [isScraped, setIsScraped] = useState(false);
  const [source, setSource] = useState('');
  const t = translations[locale];

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tools/pricing/${toolSlug}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setPricing(result.data);
          setLastRefresh(result.meta?.fetchedAt || new Date().toISOString());
          setIsScraped(result.meta?.scraped || false);
          setSource(result.meta?.source || '');
          return;
        }
      }
      
      setError(t.error);
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pricing.length === 0) {
      fetchPricing();
    }
  }, [toolSlug]);

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error && pricing.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPricing}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : isScraped ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded ${isScraped ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {isScraped ? '🟢 ' + t.scraped : '📦 ' + t.cached}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-gray-400 hidden sm:inline">{t.lastUpdated}: {formatDate(lastRefresh)}</span>
          )}
          <button
            onClick={fetchPricing}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            title={t.refresh}
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {loading && pricing.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {pricing.map((plan, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{plan.planName}</h4>
                    {source && <p className="text-xs text-gray-500">{source}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{plan.price}</div>
                    <div className="text-xs text-gray-500">{plan.period}</div>
                  </div>
                </div>
                <ul className="space-y-1">
                  {plan.features && plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
            >
              {t.officialSite}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <span className="text-xs text-gray-400">
              {locale === 'zh' ? '定价可能有变动，请以官网为准' : 'Pricing may vary, check official site for details'}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
