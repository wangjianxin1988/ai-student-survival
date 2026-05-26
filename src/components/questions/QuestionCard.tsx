import React from 'react';
import type { Question } from '@/data/questions';
import { QUESTION_CATEGORIES, type QuestionCategory } from '@/data/questions';
import { getLocaleHref } from '@/lib/i18n';

interface QuestionCardProps {
  question: Question;
  locale?: 'zh' | 'en';
}

const CATEGORY_COLORS: Record<string, string> = {
  academic: 'bg-orange-100 text-orange-700',
  life: 'bg-green-100 text-green-700',
  visa: 'bg-blue-100 text-blue-700',
  job: 'bg-indigo-100 text-indigo-700',
  policy: 'bg-purple-100 text-purple-700',
  payment: 'bg-emerald-100 text-emerald-700',
  ai_tools: 'bg-cyan-100 text-cyan-700',
  study_life: 'bg-rose-100 text-rose-700',
  job_recruitment: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

const translations = {
  zh: {
    resolved: '已解决',
    unresolved: '待解决',
  },
  en: {
    resolved: 'Resolved',
    unresolved: 'Unresolved',
  },
};

export default function QuestionCard({ question, locale = 'zh' }: QuestionCardProps) {
  const t = translations[locale];
  const category = QUESTION_CATEGORIES[question.category as QuestionCategory];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return locale === 'zh' ? '今天' : 'Today';
    if (diffDays === 1) return locale === 'zh' ? '昨天' : 'Yesterday';
    if (diffDays < 7) return locale === 'zh' ? `${diffDays}天前` : `${diffDays} days ago`;
    if (diffDays < 30) return locale === 'zh' ? `${Math.floor(diffDays / 7)}周前` : `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US');
  };

  const handleClick = () => {
    window.location.href = getLocaleHref(`/questions/${question.id}`, locale);
  };

  const categoryColor = CATEGORY_COLORS[question.category] || CATEGORY_COLORS.other;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      {/* Category badges row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColor}`}>
          {category?.icon} {locale === 'zh' ? category?.label : category?.labelEn}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          question.isResolved
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {question.isResolved ? t.resolved : t.unresolved}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
        {locale === 'zh' ? question.titleZh : question.title}
      </h3>

      {/* Excerpt */}
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {locale === 'zh' ? question.contentZh : question.content}
      </p>

      {/* Tags */}
      {question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {question.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row: author info + horizontal stats */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {/* Author + date */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {question.isAnonymous ? (
            <span>{locale === 'zh' ? '匿名用户' : 'Anonymous'}</span>
          ) : (
            <>
              <img
                src={question.authorAvatar}
                alt={question.authorName}
                className="w-4 h-4 rounded-full"
              />
              <span>{question.authorName}</span>
            </>
          )}
          <span>·</span>
          <span>{formatDate(question.createdAt)}</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {question.viewCount}
          </span>
        </div>

        {/* Horizontal stats: answers */}
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{question.answerCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
