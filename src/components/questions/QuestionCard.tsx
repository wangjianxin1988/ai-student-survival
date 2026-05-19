import React from 'react';
import type { Question } from '@/data/questions';
import { QUESTION_CATEGORIES, type QuestionCategory } from '@/data/questions';
import { getLocaleHref } from '@/lib/i18n';

interface QuestionCardProps {
  question: Question;
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    resolved: '已解决',
    answers: '回答',
    views: '浏览',
    unresolved: '待解决',
    askQuestion: '提问',
    by: 'by',
  },
  en: {
    resolved: 'Resolved',
    answers: 'answers',
    views: 'views',
    unresolved: 'Unresolved',
    askQuestion: 'Ask',
    by: 'by',
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Left sidebar - stats */}
        <div className="flex flex-col items-center gap-2 min-w-[60px] text-center">
          <div className={`text-lg font-semibold ${question.isResolved ? 'text-green-600' : 'text-gray-600'}`}>
            {question.answerCount}
          </div>
          <div className="text-xs text-gray-500">{t.answers}</div>
          <div className="text-sm text-gray-400">{question.viewCount} {t.views}</div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-medium mb-2 line-clamp-2">
            <a
              href={getLocaleHref(`/questions/${question.id}`, locale)}
              className="text-gray-900 hover:text-primary-600 transition-colors"
            >
              {locale === 'zh' ? question.titleZh : question.title}
            </a>
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {locale === 'zh' ? question.contentZh : question.content}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category badge */}
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: 'var(--category-bg, #f3f4f6)',
                color: 'var(--category-color, #374151)',
              }}
            >
              <span>{category?.icon || '💬'}</span>
              <span>{locale === 'zh' ? category?.label : category?.labelEn}</span>
            </span>

            {/* Resolved badge */}
            {question.isResolved && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t.resolved}
              </span>
            )}

            {/* Tags */}
            {question.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
              >
                #{tag}
              </span>
            ))}

            {/* Author and date */}
            <div className="flex items-center gap-2 ml-auto text-xs text-gray-500">
              {question.isAnonymous ? (
                <span>{locale === 'zh' ? '匿名用户' : 'Anonymous'}</span>
              ) : (
                <>
                  <img
                    src={question.authorAvatar}
                    alt={question.authorName}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{question.authorName}</span>
                </>
              )}
              <span>·</span>
              <span>{formatDate(question.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
