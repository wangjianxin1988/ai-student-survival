import { useState, useEffect } from 'react';

interface UpdateNotesClientProps {
  slug: string;
  sourceUrl?: string;
  sourceType?: string;
}

interface UpdateData {
  latestUpdate: string;
  sourceUrl: string;
  fetchedAt: string;
  sourceType: string;
}

export default function UpdateNotesClient({
  slug,
  sourceUrl,
  sourceType,
}: UpdateNotesClientProps) {
  const [update, setUpdate] = useState<UpdateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpdate = async () => {
      if (!sourceUrl || sourceType === 'none') {
        setLoading(false);
        setError('暂无更新信息来源');
        return;
      }

      try {
        const response = await fetch(`/api/tools/updates/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setUpdate(data);
      } catch (err) {
        console.error('Failed to fetch update:', err);
        setError('获取更新信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUpdate();
  }, [slug, sourceUrl, sourceType]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm">加载更新信息...</span>
      </div>
    );
  }

  if (error || !update) {
    return (
      <div className="text-gray-500 text-sm">
        <p>{error || '暂无更新信息'}</p>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 mt-1 inline-block"
          >
            查看官方更新 →
          </a>
        )}
      </div>
    );
  }

  // 格式化显示
  const formattedDate = new Date(update.fetchedAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-3">
      {/* 更新内容 */}
      <div className="prose prose-sm max-w-none">
        {update.latestUpdate.split('\n').map((line, i) => (
          <p key={i} className={line.startsWith('**') ? 'font-semibold' : ''}>
            {line.replace(/\*\*/g, '')}
          </p>
        ))}
      </div>

      {/* 来源和时间 */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <a
          href={update.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-indigo-600"
        >
          来源: {update.sourceType === 'github' ? 'GitHub Releases' : '官方更新'}
        </a>
        <span>抓取时间: {formattedDate}</span>
      </div>

      {/* 刷新按钮 */}
      <button
        onClick={() => {
          setLoading(true);
          setError(null);
          fetch(`/api/tools/updates/${slug}`)
            .then((res) => res.json())
            .then((data) => {
              setUpdate(data);
              setLoading(false);
            })
            .catch((err) => {
              setError('刷新失败');
              setLoading(false);
            });
        }}
        className="text-xs text-indigo-600 hover:text-indigo-800"
      >
        刷新更新信息
      </button>
    </div>
  );
}
