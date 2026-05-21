import React, { useState } from 'react';
import { PostEditor } from './PostEditor';

interface CreatePostPageProps {
  userId: string;
}

export function CreatePostPage({ userId }: CreatePostPageProps) {
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
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        window.location.href = '/community';
      } else {
        alert(result.error?.message || '发布失败，请重试');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('网络错误，请重试');
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
