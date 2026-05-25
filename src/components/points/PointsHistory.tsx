import React, { useState, useEffect } from 'react';
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

export function PointsHistory({ userId }: PointsHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchTransactions();
  }, [userId, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });
      const accessToken = await getAccessToken();
      const response = await fetch(`/api/points/transactions?${params}`, {
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">积分记录</h3>

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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-gray-600">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}