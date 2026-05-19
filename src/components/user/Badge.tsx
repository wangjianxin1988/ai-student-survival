import React from 'react';
import { BADGES, type Badge, type UserProfile, getBadgesWithStatus } from '@/lib/userProfile';

interface BadgeDisplayProps {
  badge: Badge;
  earned: boolean;
  size?: 'sm' | 'md' | 'lg';
  locale?: 'zh' | 'en';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
};

export function BadgeDisplay({ badge, earned, size = 'md', locale = 'zh' }: BadgeDisplayProps) {
  const name = locale === 'zh' ? badge.nameZh : badge.name;
  const description = locale === 'zh' ? badge.descriptionZh : badge.description;

  return (
    <div
      className={`relative group flex flex-col items-center ${!earned ? 'opacity-40 grayscale' : ''}`}
      title={`${name}: ${description}`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          earned
            ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 shadow-md'
            : 'bg-gray-100 border-gray-300'
        }`}
      >
        {badge.icon}
      </div>
      <span className="mt-1 text-xs text-center font-medium text-gray-700 max-w-[60px] truncate">
        {name}
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        <div className="font-semibold">{name}</div>
        <div className="text-gray-300">{description}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

interface BadgeGridProps {
  profile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
  locale?: 'zh' | 'en';
  showLocked?: boolean;
}

export function BadgeGrid({ profile, size = 'md', locale = 'zh', showLocked = true }: BadgeGridProps) {
  const badgesWithStatus = getBadgesWithStatus(profile);
  const earnedBadges = badgesWithStatus.filter(b => b.earned);
  const lockedBadges = badgesWithStatus.filter(b => !b.earned);

  return (
    <div className="space-y-4">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {locale === 'zh' ? '已获得' : 'Earned'} ({earnedBadges.length})
          </h3>
          <div className="flex flex-wrap gap-4">
            {earnedBadges.map(({ badge, earned }) => (
              <BadgeDisplay key={badge.id} badge={badge} earned={earned} size={size} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {showLocked && lockedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            {locale === 'zh' ? '待解锁' : 'Locked'} ({lockedBadges.length})
          </h3>
          <div className="flex flex-wrap gap-4">
            {lockedBadges.map(({ badge, earned }) => (
              <BadgeDisplay key={badge.id} badge={badge} earned={earned} size={size} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface BadgeShowcaseProps {
  locale?: 'zh' | 'en';
  size?: 'sm' | 'md' | 'lg';
  limit?: number;
}

export function BadgeShowcase({ locale = 'zh', size = 'md', limit }: BadgeShowcaseProps) {
  const badgesToShow = limit ? BADGES.slice(0, limit) : BADGES;

  return (
    <div className="flex flex-wrap gap-4">
      {badgesToShow.map((badge) => (
        <BadgeDisplay key={badge.id} badge={badge} earned={false} size={size} locale={locale} />
      ))}
    </div>
  );
}

interface BadgeNotificationProps {
  badge: Badge;
  locale?: 'zh' | 'en';
  onClose?: () => void;
}

export function BadgeNotification({ badge, locale = 'zh', onClose }: BadgeNotificationProps) {
  const name = locale === 'zh' ? badge.nameZh : badge.name;
  const description = locale === 'zh' ? badge.descriptionZh : badge.description;

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
          {badge.icon}
        </div>
        <div>
          <div className="font-bold">{locale === 'zh' ? '获得新徽章!' : 'New Badge Earned!'}</div>
          <div className="text-sm opacity-90">
            {name}: {description}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default BadgeDisplay;
