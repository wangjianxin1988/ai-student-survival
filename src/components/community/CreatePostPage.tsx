import React, { useState } from 'react';
import { PostEditor } from './PostEditor';
import { getCurrentLocale, getLocaleHref } from '@/lib/i18n';

interface CreatePostPageProps {
  userId: string;
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    success: '发布成功，跳转中...',
    failed: '发布失败',
    networkError: '网络错误',
  },
  en: {
    success: 'Success! Redirecting...',
    failed: 'Failed to post',
    networkError: 'Network error',
  },
};

export function CreatePostPage({ userId, locale }: CreatePostPageProps) {
  const currentLocale = locale || getCurrentLocale();
  const t = translations[currentLocale];
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    meta?: Record<string, unknown>;
  }) => {
    setError(null);

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          meta: data.meta,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRedirecting(true);
        window.location.href = getLocaleHref(`/community/${result.data.id}`, currentLocale);
      } else {
        setError(result.error?.message || t.failed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.networkError);
    }
  };

  if (redirecting) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.success}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      <PostEditor onSubmit={handleSubmit} locale={currentLocale} />
    </div>
  );
}
