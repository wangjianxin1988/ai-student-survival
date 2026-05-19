import React from 'react';

export type CommunityCategory = 'all' | 'tools' | 'payment' | 'policy' | 'prompt' | 'survival' | 'discussion' | 'qa';

interface CategoryFilterProps {
  selected: CommunityCategory;
  onChange: (category: CommunityCategory) => void;
}

const CATEGORIES: { value: CommunityCategory; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: '📋' },
  { value: 'tools', label: 'AI工具', icon: '🤖' },
  { value: 'payment', label: '支付指南', icon: '💳' },
  { value: 'policy', label: '政策', icon: '📜' },
  { value: 'prompt', label: 'Prompt', icon: '💡' },
  { value: 'survival', label: '妙妙贴', icon: '🎒' },
  { value: 'discussion', label: '讨论', icon: '💬' },
  { value: 'qa', label: '问答', icon: '❓' },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === cat.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <span className="mr-1">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
