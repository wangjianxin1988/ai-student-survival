import React, { useState } from 'react';
import AuthGate from '@/components/auth/AuthGate';
import { PostEditor } from './PostEditor';
import { getAccessToken } from '@/lib/auth';

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
      const accessToken = getAccessToken();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const result = await response.json();

      if (result.success) {
        window.location.href = '/community';
      } else {
        alert(result.error?.message || '发布失败，请重试');
      }
    } catch (error: unknown) {
      console.error('Failed to create post:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        alert('请求超时，请检查网络后重试');
      } else {
        alert('网络错误，请重试');
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