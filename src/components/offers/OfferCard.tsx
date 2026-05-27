import React from 'react';
import type { Offer } from '@/data/offers';
import { DEGREE_LABELS } from '@/data/offers';

interface OfferCardProps {
  offer: Offer;
  locale?: 'zh' | 'en';
  showDetails?: boolean;
}

const translations = {
  zh: {
    admitted: '录取',
    rejected: '拒信',
    waitlisted: '候补',
    toolsUsed: 'AI工具',
    background: '背景分析',
    scholarship: '奖学金',
    full: '全奖',
    partial: '半奖',
    none: '无奖',
    gpa: 'GPA',
    gre: 'GRE',
    toefl: '托福',
    ielts: '雅思',
    publications: '发表',
    research: '科研',
    internships: '实习',
    timeline: '申请时间线',
    advice: '申请建议',
    viewDetails: '查看详情',
    likes: '点赞',
    comments: '评论',
    Bachelor: '本科',
    Master: '硕士',
    PhD: '博士',
    Postdoc: '博后',
    year: '年',
  },
  en: {
    admitted: 'Admitted',
    rejected: 'Rejected',
    waitlisted: 'Waitlisted',
    toolsUsed: 'AI Tools',
    background: 'Background',
    scholarship: 'Scholarship',
    full: 'Full',
    partial: 'Partial',
    none: 'None',
    gpa: 'GPA',
    gre: 'GRE',
    toefl: 'TOEFL',
    ielts: 'IELTS',
    publications: 'Publications',
    research: 'Research',
    internships: 'Internships',
    timeline: 'Timeline',
    advice: 'Advice',
    viewDetails: 'View Details',
    likes: 'Likes',
    comments: 'Comments',
    Bachelor: 'Bachelor',
    Master: 'Master',
    PhD: 'PhD',
    Postdoc: 'Postdoc',
    year: 'yrs',
  },
};

const resultColors = {
  admitted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  waitlisted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const countryFlags: Record<string, string> = {
  USA: '🇺🇸',
  UK: '🇬🇧',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  Germany: '🇩🇪',
  Switzerland: '🇨🇭',
  Singapore: '🇸🇬',
  "Hong Kong": '🇭🇰',
  China: '🇨🇳',
  Japan: '🇯🇵',
  France: '🇫🇷',
  Netherlands: '🇳🇱',
};

export default function OfferCard({ offer, locale = 'zh', showDetails = false }: OfferCardProps) {
  const t = translations[locale];
  const flag = countryFlags[offer.universityCountry] || '';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatScholarship = () => {
    if (offer.scholarship.type === 'none' || offer.scholarship.amount === 0) {
      return t.none;
    }
    const amount = offer.scholarship.amount.toLocaleString();
    const scholarshipType = offer.scholarship.type === 'full' ? t.full : t.partial;
    return `${scholarshipType} (${offer.scholarship.currency} ${amount})`;
  };

  const getDegreeLabel = () => {
    return DEGREE_LABELS[offer.degree]?.[locale === 'zh' ? 'zh' : 'en'] || offer.degree;
  };

  if (showDetails) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with university info */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-center gap-4">
            {offer.universityLogo && (
              <img
                src={offer.universityLogo}
                alt={offer.universityName}
                className="w-16 h-16 bg-white rounded-lg p-1 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{offer.universityName}</h2>
              <p className="text-primary-100">
                {flag} {offer.universityCountry} · {getDegreeLabel()} · {offer.programName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Admission Result & Scholarship */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${resultColors[offer.admissionResult]}`}>
                {offer.admissionResult === 'admitted' ? t.admitted :
                 offer.admissionResult === 'rejected' ? t.rejected : t.waitlisted}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">{t.scholarship}</p>
              <p className="font-semibold text-gray-900">{formatScholarship()}</p>
            </div>
          </div>

          {/* Background Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.background}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {offer.background.gpa && offer.background.gpa !== 'N/A' && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t.gpa}</p>
                  <p className="font-semibold text-gray-900">{offer.background.gpa}</p>
                </div>
              )}
              {offer.background.gre && offer.background.gre !== 'N/A' && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t.gre}</p>
                  <p className="font-semibold text-gray-900">{offer.background.gre}</p>
                </div>
              )}
              {offer.background.toefl && offer.background.toefl !== 'N/A' && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t.toefl}</p>
                  <p className="font-semibold text-gray-900">{offer.background.toefl}</p>
                </div>
              )}
              {offer.background.ielts && offer.background.ielts !== 'N/A' && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t.ielts}</p>
                  <p className="font-semibold text-gray-900">{offer.background.ielts}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t.publications}</p>
                <p className="font-semibold text-gray-900">{offer.background.publications}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t.research}</p>
                <p className="font-semibold text-gray-900">{offer.background.researchExperience} {t.year}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{t.internships}</p>
                <p className="font-semibold text-gray-900">{offer.background.internships}</p>
              </div>
            </div>
          </div>

          {/* AI Tools Used */}
          {offer.aiToolsUsed && offer.aiToolsUsed.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.toolsUsed}</h3>
              <div className="flex flex-wrap gap-2">
                {offer.aiToolsUsed.map((tool, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-full border border-primary-100"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {offer.timeline && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.timeline}</h3>
              <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{offer.timeline}</p>
            </div>
          )}

          {/* Advice */}
          {offer.advice && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.advice}</h3>
              <p className="text-gray-600 bg-amber-50 rounded-lg p-4 border border-amber-100">
                {offer.advice}
              </p>
            </div>
          )}

          {/* User Info and Stats */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-3">
              <img
                src={offer.userAvatar}
                alt={offer.userName}
                className="w-10 h-10 rounded-full bg-gray-200"
              />
              <div>
                <p className="font-medium text-gray-900">{offer.userName}</p>
                <p className="text-sm text-gray-500">{formatDate(offer.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 01-.316 1l-2.5 2.5a2 2 0 01-2.684 0l-2.5-2.5A2 2 0 015 15.763V10.333a2 2 0 011.316-1.727l2.5-2.5a2 2 0 012.368 0l2.5 2.5a2 2 0 011.316 1.727z" />
                </svg>
                {offer.likes}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                {offer.comments}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact card view
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {offer.universityLogo && (
            <img
              src={offer.universityLogo}
              alt={offer.universityName}
              className="w-10 h-10 bg-gray-100 rounded-lg p-1 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{offer.universityName}</h3>
            <p className="text-sm text-gray-500">
              {flag} {offer.universityCountry} · {getDegreeLabel()}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${resultColors[offer.admissionResult]}`}>
          {offer.admissionResult === 'admitted' ? t.admitted :
           offer.admissionResult === 'rejected' ? t.rejected : t.waitlisted}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{offer.programName}</p>

      {/* Scholarship */}
      <p className="text-sm mb-3">
        <span className="text-gray-500">{t.scholarship}: </span>
        <span className="font-medium text-gray-900">{formatScholarship()}</span>
      </p>

      {/* AI Tools */}
      {offer.aiToolsUsed && offer.aiToolsUsed.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {offer.aiToolsUsed.slice(0, 3).map((tool, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tool}
              </span>
            ))}
            {offer.aiToolsUsed.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{offer.aiToolsUsed.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-3 mt-3">
        <div className="flex items-center gap-2">
          <img
            src={offer.userAvatar}
            alt={offer.userName}
            className="w-6 h-6 rounded-full bg-gray-200"
          />
          <span className="text-xs text-gray-500">{offer.userName}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 01-.316 1l-2.5 2.5a2 2 0 01-2.684 0l-2.5-2.5A2 2 0 015 15.763V10.333a2 2 0 011.316-1.727l2.5-2.5a2 2 0 012.368 0l2.5 2.5a2 2 0 011.316 1.727z" />
            </svg>
            {offer.likes}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {offer.comments}
          </span>
        </div>
      </div>
    </div>
  );
}
