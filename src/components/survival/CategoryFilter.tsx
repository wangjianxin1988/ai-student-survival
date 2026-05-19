import React from 'react';
import { survivalGuideCategories } from '@/data/survivalGuides';
import type { SurvivalCategory } from '@/data/survivalGuides';

interface CategoryFilterProps {
  selectedCategory?: SurvivalCategory | 'all';
  onCategoryChange: (category: SurvivalCategory | 'all') => void;
  locale?: 'zh' | 'en';
}

const categoryBgColors = {
  scam: 'bg-red-50 hover:bg-red-100 border-red-200',
  culture: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  safety: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  legal: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
  other: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
  all: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
};

const categoryActiveColors = {
  scam: 'bg-red-500 text-white border-red-500',
  culture: 'bg-purple-500 text-white border-purple-500',
  safety: 'bg-blue-500 text-white border-blue-500',
  legal: 'bg-amber-500 text-white border-amber-500',
  other: 'bg-gray-500 text-white border-gray-500',
  all: 'bg-gray-500 text-white border-gray-500',
};

const categoryIconColors = {
  scam: 'text-red-500',
  culture: 'text-purple-500',
  safety: 'text-blue-500',
  legal: 'text-amber-500',
  other: 'text-gray-500',
  all: 'text-gray-500',
};

export default function CategoryFilter({
  selectedCategory = 'all',
  onCategoryChange,
  locale = 'zh',
}: CategoryFilterProps) {
  const allOption = {
    value: 'all' as const,
    label: locale === 'zh' ? '全部' : 'All',
    labelEn: 'All',
    icon: '📚',
  };

  const categories = [allOption, ...survivalGuideCategories];

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const isActive = selectedCategory === category.value;
        const bgColor = isActive
          ? categoryActiveColors[category.value as keyof typeof categoryActiveColors]
          : categoryBgColors[category.value as keyof typeof categoryBgColors];

        return (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value as SurvivalCategory | 'all')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border
              transition-all duration-200 ${bgColor}
              ${isActive ? 'shadow-sm' : ''}
            `}
          >
            <span className={`${isActive ? '' : categoryIconColors[category.value as keyof typeof categoryIconColors]}`}>
              {category.icon}
            </span>
            <span>{locale === 'zh' ? category.label : category.labelEn}</span>
          </button>
        );
      })}
    </div>
  );
}
