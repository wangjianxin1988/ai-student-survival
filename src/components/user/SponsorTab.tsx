import React from 'react';
import SponsorPage from '@/components/sponsor/SponsorPage';

interface SponsorTabProps {
  locale?: 'zh' | 'en';
}

export default function SponsorTab({ locale = 'zh' }: SponsorTabProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {locale === 'zh' ? '赞助我们' : 'Sponsor Us'}
        </h2>
        <p className="text-sm text-gray-500">
          {locale === 'zh'
            ? '感谢您的支持！赞助后记录可获得积分奖励。'
            : 'Thank you for your support! Record your sponsorship to earn points rewards.'}
        </p>
      </div>
      <SponsorPage locale={locale} />
    </div>
  );
}
