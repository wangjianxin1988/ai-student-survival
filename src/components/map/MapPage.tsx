import { useState, useMemo } from 'react';
import type { MapMarker, MapMarkerCategory } from '@/lib/types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from '@/lib/types';
import CampusMap from './CampusMap';

interface University {
  id: string;
  name: string;
  nameZh: string;
  location: { lat: number; lng: number };
}

interface MapPageProps {
  markers: MapMarker[];
  universities: University[];
  height?: string;
  userPoints?: number;
}

export default function MapPage({
  markers,
  universities,
  height = '500px',
  userPoints = 0,
}: MapPageProps) {
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique categories from markers
  const categories = useMemo(() => {
    const cats = [...new Set(markers.map(m => m.category))];
    return cats.sort();
  }, [markers]);

  // Filter markers based on selection
  const filteredMarkers = useMemo(() => {
    return markers.filter(marker => {
      const matchesUniversity = !selectedUniversity || marker.universityId === selectedUniversity;
      const matchesCategory = !selectedCategory || marker.category === selectedCategory;
      const matchesSearch = !searchQuery ||
        marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        marker.nameZh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        marker.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesUniversity && matchesCategory && matchesSearch;
    });
  }, [markers, selectedUniversity, selectedCategory, searchQuery]);

  // Get unique universities that have markers (for display purposes)
  const _markerUniIds = useMemo(() => {
    return new Set(markers.map(m => m.universityId));
  }, [markers]);

  // University policy link mapping
  const getPolicyLink = (universityId: string): string => {
    const linkMap: Record<string, string> = {
      'mit': '/policies/mit',
      'stanford': '/policies/stanford',
      'harvard': '/policies/harvard',
      'cambridge': '/policies/cambridge',
      'oxford': '/policies/oxford',
      'berkeley': '/policies/berkeley',
      'ucl': '/policies/ucl',
      'eth': '/policies/eth',
      'ntu': '/policies/ntu',
      'nus': '/policies/nus',
      'toronto': '/policies/toronto',
      'ubc': '/policies/ubc',
      'melbourne': '/policies/melbourne',
      'anu': '/policies/anu',
      'lmu': '/policies/lmu',
      'tum': '/policies/tum',
      'epfl': '/policies/epfl',
      'columbia': '/policies/columbia',
      'princeton': '/policies/princeton',
      'cmu': '/policies/cmu',
      'fudan': '/policies/fudan',
      'sjtu': '/policies/sjtu',
      'zju': '/policies/zju',
      'pku': '/policies/pku',
      'tsinghua': '/policies/tsinghua',
    };
    return linkMap[universityId] || `/policies?search=${encodeURIComponent(universities.find(u => u.id === universityId)?.nameZh || '')}`;
  };

  const selectedUniversityData = universities.find(u => u.id === selectedUniversity);

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-end sm:flex-nowrap">
        {/* Search */}
        <div className="w-full sm:flex-1 sm:min-w-[200px] min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            搜索地点
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索名称、描述..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        {/* University Filter */}
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择大学
          </label>
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="">全部大学</option>
            {universities.map(uni => {
              const markerCount = markers.filter(m => m.universityId === uni.id).length;
              const hasMarkers = markerCount > 0;
              return (
                <option key={uni.id} value={uni.id}>
                  {uni.nameZh} ({uni.name}){!hasMarkers ? ' (暂无标记)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            设施类型
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          >
            <option value="">全部类型 ({categories.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat]} {CATEGORY_NAMES[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(selectedUniversity || selectedCategory || searchQuery) && (
          <button
            onClick={() => {
              setSelectedUniversity('');
              setSelectedCategory('');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedUniversity || selectedCategory) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">当前筛选:</span>
          {selectedUniversity && selectedUniversityData && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {selectedUniversityData.nameZh}
              <button
                onClick={() => setSelectedUniversity('')}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {CATEGORY_ICONS[selectedCategory as MapMarkerCategory]} {CATEGORY_NAMES[selectedCategory as MapMarkerCategory]}
              <button
                onClick={() => setSelectedCategory('')}
                className="ml-1 hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedUniversity && (
            <a
              href={getPolicyLink(selectedUniversity)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
            >
              查看大学政策 →
            </a>
          )}
          <span className="text-sm text-gray-500 ml-2">
            找到 {filteredMarkers.length} 个地点
          </span>
        </div>
      )}

      {/* Map Container */}
      <div className="rounded-lg shadow-md">
        <CampusMap
          markers={filteredMarkers}
          selectedUniversity={selectedUniversity}
          height={height}
          userPoints={userPoints}
          universities={universities}
        />
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-500 text-center">
        显示 {filteredMarkers.length} / {markers.length} 个地点
        {selectedUniversity && selectedUniversityData && (
          <span> · {selectedUniversityData.nameZh}</span>
        )}
      </div>
    </div>
  );
}