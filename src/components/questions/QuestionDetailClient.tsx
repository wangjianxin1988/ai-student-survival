import React, { useState, useMemo } from 'react';
import {
  getQuestionById,
  getAnswersByQuestionId,
  type Question,
  type Answer,
  QUESTION_CATEGORIES,
  type QuestionCategory,
} from '@/data/questions';
import EmojiPicker from '@/components/common/EmojiPicker';
import FavoriteButton from '@/components/favorites/FavoriteButton';

// Generate locale-aware href
function getLocaleHref(path: string, locale: 'zh' | 'en'): string {
  if (locale === 'zh') {
    return path;
  }
  return `/${locale}${path}`;
}

interface QuestionDetailClientProps {
  questionId: string;
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    answers: '回答',
    noAnswers: '暂无回答',
    beFirstToAnswer: '成为第一个回答的人',
    writeAnswer: '撰写回答',
    submitAnswer: '提交回答',
    answerPlaceholder: '写下你的回答...',
    resolved: '已解决',
    unresolved: '待解决',
    views: '浏览',
    sortBy: '排序',
    highestRated: '最高评分',
    newest: '最新',
    by: 'by',
    anonymous: '匿名用户',
    aiAnswer: 'AI回答',
    accepted: '已采纳',
    answerSubmitted: '回答已提交！',
    viewAll: '查看全部',
    backToQuestions: '返回问题列表',
  },
  en: {
    answers: 'Answers',
    noAnswers: 'No answers yet',
    beFirstToAnswer: 'Be the first to answer',
    writeAnswer: 'Write an answer',
    submitAnswer: 'Submit Answer',
    answerPlaceholder: 'Write your answer...',
    resolved: 'Resolved',
    unresolved: 'Unresolved',
    views: 'views',
    sortBy: 'Sort by',
    highestRated: 'Highest Rated',
    newest: 'Newest',
    by: 'by',
    anonymous: 'Anonymous',
    aiAnswer: 'AI Answer',
    accepted: 'Accepted',
    answerSubmitted: 'Answer submitted!',
    viewAll: 'View all',
    backToQuestions: 'Back to Questions',
  },
};

export default function QuestionDetailClient({ questionId, locale = 'zh' }: QuestionDetailClientProps) {
  const t = translations[locale];
  const [answers, setAnswers] = useState<Answer[]>(getAnswersByQuestionId(questionId));
  const [newAnswer, setNewAnswer] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'newest'>('rating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const question = getQuestionById(questionId);
  const category = question ? QUESTION_CATEGORIES[question.category as QuestionCategory] : null;

  const sortedAnswers = useMemo(() => {
    const sorted = [...answers];
    if (sortBy === 'rating') {
      return sorted.sort((a, b) => b.rating - a.rating);
    }
    return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [answers, sortBy]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const answer: Answer = {
      id: `a-${Date.now()}`,
      questionId,
      content: newAnswer,
      contentZh: newAnswer,
      authorName: locale === 'zh' ? '你' : 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      isAnonymous: false,
      isAiAnswer: false,
      rating: 0,
      isAccepted: false,
      createdAt: new Date().toISOString(),
    };

    setAnswers([...answers, answer]);
    setNewAnswer('');
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">问题未找到</h1>
          <a href={getLocaleHref('/questions', locale)} className="text-primary-600 hover:text-primary-700">
            返回问题列表
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a
            href={getLocaleHref('/questions', locale)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToQuestions}
          </a>

          <div className="flex items-start gap-4">
            {/* Stats sidebar */}
            <div className="flex flex-col items-center gap-2 min-w-[80px] text-center">
              <div className={`text-2xl font-bold ${question.isResolved ? 'text-green-600' : 'text-gray-600'}`}>
                {answers.length}
              </div>
              <div className="text-sm text-gray-500">{t.answers}</div>
            </div>

            <div className="flex-1">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {locale === 'zh' ? question.titleZh : question.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {/* Category */}
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  <span>{category?.icon}</span>
                  <span>{locale === 'zh' ? category?.label : category?.labelEn}</span>
                </span>

                {/* Resolved status */}
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                  question.isResolved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {question.isResolved ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                  {question.isResolved ? t.resolved : t.unresolved}
                </span>

                {/* Views */}
                <span className="text-gray-500">{question.viewCount} {t.views}</span>

                {/* Author */}
                <div className="flex items-center gap-2">
                  {question.isAnonymous ? (
                    <span className="text-gray-500">{t.anonymous}</span>
                  ) : (
                    <>
                      <img src={question.authorAvatar} alt={question.authorName} className="w-5 h-5 rounded-full" />
                      <span className="text-gray-700">{question.authorName}</span>
                    </>
                  )}
                </div>

                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{formatDate(question.createdAt)}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {question.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Favorite Button */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <FavoriteButton targetType="question" targetId={question.id} locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Question content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {locale === 'zh' ? question.contentZh : question.content}
            </p>
          </div>
        </div>

        {/* Answers section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t.answers} ({answers.length})
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t.sortBy}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="rating">{t.highestRated}</option>
                <option value="newest">{t.newest}</option>
              </select>
            </div>
          </div>

          {/* Answer list */}
          {sortedAnswers.length > 0 ? (
            <div className="space-y-6">
              {sortedAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className={`bg-white rounded-lg border p-6 ${
                    answer.isAccepted ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {/* Accepted badge */}
                  {answer.isAccepted && (
                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {t.accepted}
                    </div>
                  )}

                  {/* Author and rating */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Rating */}
                    <div className="flex flex-col items-center gap-1 min-w-[50px]">
                      <button className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="text-lg font-semibold text-gray-700">{answer.rating}</span>
                      <button className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {answer.isAiAnswer && (
                          <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded text-xs font-medium">
                            {t.aiAnswer}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {answer.isAnonymous ? (
                          <span className="text-sm text-gray-500">{t.anonymous}</span>
                        ) : (
                          <>
                            <img src={answer.authorAvatar} alt={answer.authorName} className="w-5 h-5 rounded-full" />
                            <span className="text-sm font-medium text-gray-700">{answer.authorName}</span>
                          </>
                        )}
                        <span className="text-gray-400">·</span>
                        <span className="text-sm text-gray-500">{formatDate(answer.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Answer content */}
                  <div className="pl-14">
                    <div className="prose max-w-none text-gray-800">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {locale === 'zh' ? answer.contentZh : answer.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600 mb-2">{t.noAnswers}</p>
              <p className="text-gray-500 text-sm">{t.beFirstToAnswer}</p>
            </div>
          )}
        </div>

        {/* Answer form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.writeAnswer}</h3>

          {submitSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
              {t.answerSubmitted}
            </div>
          )}

          <form onSubmit={handleSubmitAnswer}>
            <div className="relative">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder={t.answerPlaceholder}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
              <div className="absolute bottom-3 right-3">
                <EmojiPicker
                  onEmojiSelect={(emoji) => setNewAnswer((prev) => prev + emoji)}
                  position="top"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting || !newAnswer.trim()}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  t.submitAnswer
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
