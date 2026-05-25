import React, { useState } from 'react';
import AuthGate from '@/components/auth/AuthGate';
import { PostEditor } from './PostEditor';
import { getAuthHeaders } from '@/lib/auth';

interface CreatePostPageProps {
  userId: string;
}

/**
 * CreatePostPage - Wrapper that handles auth check client-side
 * AuthGate ensures user is logged in before showing the post editor
 */
export function CreatePostPage({ userId: _userId }: CreatePostPageProps) {
  return (
    <AuthGate>
      <CreatePostContent />
    </AuthGate>
  );
}

function CreatePostContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    meta?: Record<string, unknown>;
  }) => {
    setIsSubmitting(true);
    try {
      const accessToken = await getAccessToken();
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const result = await response.json();

      if (result.success) {
        // Detect locale from current path and redirect to correct community page
        const pathParts = window.location.pathname.split('/');
        const isEn = pathParts[1] === 'en';
        window.location.href = `${isEn ? '/en/questions' : '/questions'}?fresh=1`;
      } else {
        const errMsg = result.error?.message || '发布失败，请重试';
        if (result.error?.code === 'UNAUTHORIZED') {
          window.location.href = '/auth/login?redirect=/questions/ask';
        } else {
          alert(errMsg);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to create post:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        alert('请求超时，请检查网络后重试');
      } else {
        // Show more specific error message instead of generic "网络错误"
        alert('网络错误，请检查网络后重试。如果问题持续，请刷新页面后重试。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PostEditor
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}