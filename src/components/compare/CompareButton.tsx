import React, { useState, useEffect } from 'react';

interface CompareButtonProps {
  toolSlug: string;
  toolName: string;
  toolImage: string;
  locale?: 'zh' | 'en';
}

const STORAGE_KEY = 'compareToolIds';
const MAX_COMPARE = 5;

const translations = {
  zh: {
    addToCompare: '加入对比',
    removeFromCompare: '移出对比',
    added: '已添加',
    maxReached: '最多对比 {count} 个工具',
    alreadyAdded: '已在对比列表',
  },
  en: {
    addToCompare: 'Add to Compare',
    removeFromCompare: 'Remove from Compare',
    added: 'Added',
    maxReached: 'Maximum {count} tools can be compared',
    alreadyAdded: 'Already in compare list',
  },
};

function getCompareToolIds(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveCompareToolIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  if (!Array.isArray(ids)) ids = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function CompareButton({ toolSlug, toolName, toolImage, locale = 'zh' }: CompareButtonProps) {
  const [isInCompare, setIsInCompare] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const t = translations[locale];

  useEffect(() => {
    // Check initial state
    const ids = getCompareToolIds();
    setCompareCount(ids.length);
    setIsInCompare(ids.includes(toolSlug));
  }, [toolSlug]);

  useEffect(() => {
    // Listen for clearAll events from compare page
    const handleClearAll = () => {
      setIsInCompare(false);
      setCompareCount(0);
    };
    window.addEventListener('compareListClearAll', handleClearAll);
    return () => {
      window.removeEventListener('compareListClearAll', handleClearAll);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const ids = getCompareToolIds();

    if (isInCompare) {
      // Remove from compare
      const newIds = ids.filter(id => id !== toolSlug);
      saveCompareToolIds(newIds);
      setIsInCompare(false);
      setCompareCount(newIds.length);
    } else {
      // Add to compare
      if (ids.length >= MAX_COMPARE) {
        // Show notification or handle max
        console.warn(t.maxReached.replace('{count}', String(MAX_COMPARE)));
        return;
      }
      const newIds = [...ids, toolSlug];
      saveCompareToolIds(newIds);
      setIsInCompare(true);
      setCompareCount(newIds.length);
    }

    // Dispatch custom event to notify compare page
    window.dispatchEvent(new CustomEvent('compareListChange', {
      detail: { toolSlug, isInCompare: !isInCompare }
    }));
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isInCompare
          ? 'bg-primary-100 text-primary-700 border border-primary-300 hover:bg-primary-200'
          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:text-gray-900'
      }`}
      title={isInCompare ? t.removeFromCompare : t.addToCompare}
    >
      <svg
        className={`w-4 h-4 ${isInCompare ? 'text-primary-600' : 'text-gray-500'}`}
        fill={isInCompare ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <span>{isInCompare ? t.added : t.addToCompare}</span>
      {compareCount > 0 && !isInCompare && (
        <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 rounded-full">
          {compareCount}/{MAX_COMPARE}
        </span>
      )}
    </button>
  );
}
