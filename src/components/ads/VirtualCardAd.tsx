import React from 'react';

interface VirtualCardAdProps {
  variant?: 'redotpay' | 'onekey' | 'auto';
  index?: number;
  className?: string;
  locale?: 'zh' | 'en';
}

const ads = {
  redotpay: {
    icon: '💳',
    badge: 'RedotPay',
    title: '需要虚拟卡支付AI工具？',
    titleEn: 'Need a Virtual Card for AI Tools?',
    desc: 'RedotPay - USDT充值，130+国家4400万商户消费，无年费',
    descEn: 'RedotPay - Top up with USDT, spend at 44M+ merchants worldwide, no annual fee',
    cta: '立即开通 →',
    ctaEn: 'Get Started →',
    href: 'https://wap.redotpay.com/en/invite/affiliates-2?utm_id=thp9sj&utm_source=union&utm_uid=16062&utm_s=83f435b475fa9740d21e75f619566991ebe88480',
    gradient: 'from-blue-500 to-indigo-600',
    border: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
  },
  onekey: {
    icon: '🔑',
    badge: 'OneKey',
    title: '留学生必备虚拟卡',
    titleEn: 'Essential Virtual Card for Students',
    desc: 'OneKey - USDT充值，完美支持ChatGPT/OpenAI订阅',
    descEn: 'OneKey - Top up with USDT, perfect for ChatGPT/OpenAI subscriptions',
    cta: '立即开通 →',
    ctaEn: 'Get Started →',
    href: 'https://onekey.so/r/5R2CVW',
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

export default function VirtualCardAd({ variant = 'auto', index = 0, className = '', locale = 'zh' }: VirtualCardAdProps) {
  const key = variant === 'auto' ? (index % 2 === 0 ? 'redotpay' : 'onekey') : variant;
  const ad = ads[key];
  const isZh = locale === 'zh';

  return (
    <a
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-xl border ${ad.border} bg-white hover:shadow-md transition-all group overflow-hidden ${className}`}
    >
      <div className={`bg-gradient-to-r ${ad.gradient} p-4 sm:p-5`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{ad.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${ad.badgeColor} bg-white/90 font-medium`}>
                {ad.badge}
              </span>
              <span className="text-xs text-white/70">{isZh ? '推荐' : 'Recommended'}</span>
            </div>
            <h3 className="text-white font-semibold text-lg">
              {isZh ? ad.title : ad.titleEn}
            </h3>
          </div>
          <span className={`shrink-0 px-4 py-2 rounded-lg text-white text-sm font-medium ${ad.btnColor} transition-colors`}>
            {isZh ? ad.cta : ad.ctaEn}
          </span>
        </div>
        <p className="text-white/80 text-sm mt-2 ml-11">
          {isZh ? ad.desc : ad.descEn}
        </p>
      </div>
    </a>
  );
}
