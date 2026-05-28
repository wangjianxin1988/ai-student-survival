import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface PointsHistoryProps {
  userId: string;
}

const TYPE_LABELS: Record<string, string> = {
  earn_post: '发布帖子',
  earn_comment: '发表评论',
  earn_like_received: '获得点赞',
  earn_favorite: '被收藏',
  earn_share: '被分享',
  earn_sponsor: '赞助获积分',
  spend_exchange: '积分兑换',
  spend_featured: '帖子置顶',
  spend_gift: '赠送礼物',
};

const TYPE_COLORS: Record<string, string> = {
  earn_post: 'text-green-600 bg-green-50',
  earn_comment: 'text-green-600 bg-green-50',
  earn_like_received: 'text-green-600 bg-green-50',
  earn_favorite: 'text-green-600 bg-green-50',
  earn_share: 'text-green-600 bg-green-50',
  earn_sponsor: 'text-green-600 bg-green-50',
  spend_exchange: 'text-red-600 bg-red-50',
  spend_featured: 'text-red-600 bg-red-50',
  spend_gift: 'text-red-600 bg-red-50',
};

const PAGE_SIZE = 20;

export function PointsHistory({ userId }: PointsHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  // Fetch a page of transactions
  const fetchPage = useCallback(async (offset: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const isFirst = offset === 0;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: offset.toString(),
      });
      const accessToken = await getAccessToken();
      const response = await fetch(`/api/community/points-history?${params}`, {
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      });
      const data = await response.json();
      if (data.success) {
        const newTxs: Transaction[] = data.data || [];
        setTransactions(prev => (isFirst ? newTxs : [...prev, ...newTxs]));
        const serverTotal: number = data.meta?.total ?? 0;
        setTotal(serverTotal);
        setHasMore(offset + newTxs.length < serverTotal);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    setTransactions([]);
    setTotal(0);
    setHasMore(true);
    fetchPage(0);
  }, [userId, fetchPage]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !fetchingRef.current) {
          fetchPage(transactions.length);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, transactions.length, fetchPage]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        积分记录
        {total > 0 && <span className="text-sm font-normal text-gray-500 ml-2">共 {total} 条</span>}
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">暂无积分记录</p>
          <p className="text-sm">在社区发帖、评论可获得积分奖励</p>
          <a
            href="/questions"
            className="inline-block mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
          >
            前往社区
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[tx.type] || 'text-gray-600 bg-gray-50'}`}>
                    {TYPE_LABELS[tx.type] || tx.type}
                  </span>
                  <span className="text-sm text-gray-600">{tx.description}</span>
                </div>
                <span className={`text-sm font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={observerRef} className="py-4">
            {loadingMore && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-500">加载更多...</span>
              </div>
            )}
            {!hasMore && transactions.length > 0 && (
              <p className="text-center text-sm text-gray-400">已加载全部记录</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
