import React, { useState } from 'react';
import { QUESTION_CATEGORIES, type QuestionCategory } from '@/data/questions';

interface AskQuestionFormProps {
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    title: '提问',
    subtitle: '详细描述你的问题，这样更容易得到有用的回答',
    questionTitle: '问题标题',
    questionTitlePlaceholder: '用简短的一句话描述你的问题',
    questionTitleZhPlaceholder: '中文标题',
    questionContent: '问题详情',
    questionContentPlaceholder: '详细描述你的问题，包括你已经尝试过的解决方案',
    questionContentZhPlaceholder: '中文详情',
    category: '选择分类',
    selectCategory: '选择一个问题分类',
    tags: '添加标签',
    tagsPlaceholder: '添加标签，用逗号分隔',
    anonymous: '匿名提问',
    submitQuestion: '发布问题',
    submitting: '发布中...',
    questionPosted: '问题已发布！',
    backToQuestions: '返回问题列表',
    cancel: '取消',
    tips: '提问技巧',
    tip1: '标题要简洁明了',
    tip2: '详细描述问题和背景',
    tip3: '说明你已经尝试过什么',
    tip4: '选择合适的分类和标签',
  },
  en: {
    title: 'Ask a Question',
    subtitle: 'Describe your question in detail to get better answers',
    questionTitle: 'Question Title',
    questionTitlePlaceholder: 'Describe your question in one sentence',
    questionTitleZhPlaceholder: 'Chinese title',
    questionContent: 'Question Details',
    questionContentPlaceholder: 'Describe your question in detail, including solutions you have tried',
    questionContentZhPlaceholder: 'Chinese details',
    category: 'Category',
    selectCategory: 'Select a category',
    tags: 'Tags',
    tagsPlaceholder: 'Add tags, separated by commas',
    anonymous: 'Ask anonymously',
    submitQuestion: 'Post Question',
    submitting: 'Posting...',
    questionPosted: 'Question posted!',
    backToQuestions: 'Back to Questions',
    cancel: 'Cancel',
    tips: 'Question Tips',
    tip1: 'Keep the title concise and clear',
    tip2: 'Describe the problem and background in detail',
    tip3: 'Explain what you have already tried',
    tip4: 'Choose appropriate category and tags',
  },
};

export default function AskQuestionForm({ locale = 'zh' }: AskQuestionFormProps) {
  const t = translations[locale];
  const [formData, setFormData] = useState({
    title: '',
    titleZh: '',
    content: '',
    contentZh: '',
    category: '' as QuestionCategory | '',
    tags: '',
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = Object.entries(QUESTION_CATEGORIES) as [QuestionCategory, typeof QUESTION_CATEGORIES[QuestionCategory]][];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim() && !formData.titleZh.trim()) {
      newErrors.title = locale === 'zh' ? '请填写问题标题' : 'Please fill in the question title';
    }
    if (!formData.content.trim() && !formData.contentZh.trim()) {
      newErrors.content = locale === 'zh' ? '请填写问题详情' : 'Please fill in the question details';
    }
    if (!formData.category) {
      newErrors.category = locale === 'zh' ? '请选择分类' : 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real app, this would save to a backend
    console.log('Question submitted:', formData);

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Redirect after success
    setTimeout(() => {
      window.location.href = '/questions';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a
            href="/questions"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToQuestions}
          </a>

          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main form */}
          <div className="flex-1">
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t.questionPosted}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.questionTitle} (English)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t.questionTitlePlaceholder}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Title (Chinese) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.questionTitle} (中文)
                </label>
                <input
                  type="text"
                  value={formData.titleZh}
                  onChange={(e) => setFormData({ ...formData, titleZh: e.target.value })}
                  placeholder={t.questionTitleZhPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Content (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.questionContent} (English)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t.questionContentPlaceholder}
                  rows={8}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              </div>

              {/* Content (Chinese) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.questionContent} (中文)
                </label>
                <textarea
                  value={formData.contentZh}
                  onChange={(e) => setFormData({ ...formData, contentZh: e.target.value })}
                  placeholder={t.questionContentZhPlaceholder}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as QuestionCategory })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.icon} {locale === 'zh' ? cat.label : cat.labelEn}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.tags}
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder={t.tagsPlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Anonymous checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isAnonymous" className="text-sm text-gray-700">
                  {t.anonymous}
                </label>
              </div>

              {/* Submit buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t.submitting}
                    </span>
                  ) : (
                    t.submitQuestion
                  )}
                </button>
                <a
                  href="/questions"
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {t.cancel}
                </a>
              </div>
            </form>
          </div>

          {/* Tips sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">{t.tips}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <span className="text-sm text-gray-600">{t.tip1}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <span className="text-sm text-gray-600">{t.tip2}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <span className="text-sm text-gray-600">{t.tip3}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                  <span className="text-sm text-gray-600">{t.tip4}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
