import { useEffect, useState, useRef } from 'react';
import type { MapMarker } from '@/lib/types';
import { CATEGORY_ICONS, CATEGORY_NAMES } from '@/lib/types';

// Level thresholds for marker privileges
const MARKER_PRIVILEGES = {
  ADD_MARKER_MIN_LEVEL: 3,
  ADD_MARKER_MIN_POINTS: 150,
  VERIFIED_MARKER_MIN_LEVEL: 5,
  VERIFIED_MARKER_MIN_POINTS: 500,
  PRIORITY_MARKER_MIN_LEVEL: 7,
  PRIORITY_MARKER_MIN_POINTS: 1200,
};

interface University {
  id: string;
  name: string;
  nameZh: string;
  location: { lat: number; lng: number };
}

function getUserLevel(points: number): number {
  const LEVELS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i]) {
      return i + 1;
    }
  }
  return 1;
}

interface CampusMapProps {
  markers: MapMarker[];
  selectedUniversity?: string;
  height?: string;
  isAddMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  userPoints?: number;
  universities?: University[];
}

export default function CampusMap({
  markers,
  selectedUniversity,
  height = '400px',
  isAddMode = false,
  onMapClick,
  userPoints = 0,
  universities = [],
}: CampusMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const LRef = useRef<any>(null); // Store Leaflet instance for cross-effect access
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    setIsClient(true);
    setUserLevel(getUserLevel(userPoints));
  }, [userPoints]);

  // Listen for university-changed event from AddMarkerForm
  useEffect(() => {
    if (!isClient) return;

    const handleUniversityChange = (e: CustomEvent) => {
      const { universityId } = e.detail;
      if (mapInstanceRef.current && LRef.current) {
        const uni = universities.find(u => u.id === universityId);
        if (uni) {
          mapInstanceRef.current.setView([uni.location.lat, uni.location.lng], 15, { animate: true });
        }
      }
    };

    window.addEventListener('university-changed', handleUniversityChange as EventListener);
    return () => {
      window.removeEventListener('university-changed', handleUniversityChange as EventListener);
    };
  }, [isClient, universities]);

  // Initialize map
  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    let map: any = null;
    let L: any = null;

    const initMap = async () => {
      try {
        [L] = await Promise.all([
          import('leaflet'),
        ]);
        LRef.current = L;

        if (!mapRef.current) return;

        // Get center coordinates
        let center: [number, number] = [39.9994, 116.3228]; // Default: Tsinghua
        let zoom = 13;

        if (selectedUniversity && universities.length > 0) {
          const uni = universities.find(u => u.id === selectedUniversity);
          if (uni) {
            center = [uni.location.lat, uni.location.lng];
            zoom = 15;
          }
        }

        // Create map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        map = L.map(mapRef.current).setView(center, zoom);
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add markers
        addMarkersToMap(L, map);

        // Add click handler for add mode - always handle click internally when isAddMode is true
        let clickMarker: any = null;
        if (isAddMode) {
          map.on('click', (e: any) => {
            // Call onMapClick if provided
            if (onMapClick) {
              onMapClick(e.latlng.lat, e.latlng.lng);
            }
            // Dispatch event for AddMarkerForm
            window.dispatchEvent(new CustomEvent('coordinates-updated', {
              detail: { lat: e.latlng.lat, lng: e.latlng.lng }
            }));
            // Visually add/update marker on map
            if (clickMarker) {
              map.removeLayer(clickMarker);
            }
            clickMarker = L.marker([e.latlng.lat, e.latlng.lng], {
              icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }).addTo(map);
          });
          map.getContainer().style.cursor = 'crosshair';
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Update markers when filters change
  useEffect(() => {
    if (!isClient || !mapRef.current || !mapInstanceRef.current) return;

    const updateMarkers = async () => {
      try {
        const [L] = await Promise.all([import('leaflet')]);

        if (!mapInstanceRef.current) return;

        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Add markers
        addMarkersToMap(L, mapInstanceRef.current);

        // Update center if university changed
        if (selectedUniversity && universities.length > 0) {
          const uni = universities.find(u => u.id === selectedUniversity);
          if (uni) {
            mapInstanceRef.current.setView([uni.location.lat, uni.location.lng], 15, { animate: true });
          }
        }
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    };

    updateMarkers();
  }, [isClient, markers, selectedUniversity]);

  const addMarkersToMap = (L: any, map: any) => {
    const filteredMarkers = selectedUniversity
      ? markers.filter(m => m.universityId === selectedUniversity)
      : markers;

    filteredMarkers.forEach(marker => {
      const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // 显示中文名称，英文名称作为后备
      const displayName = marker.nameZh || marker.name;
      const displayDescription = marker.descriptionZh || marker.description;
      const categoryName = CATEGORY_NAMES[marker.category] || marker.category;

      const popupContent = `
        <div class="min-w-[220px]">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">${CATEGORY_ICONS[marker.category] || '📍'}</span>
            <div>
              <h3 class="font-semibold text-gray-900">${displayName}</h3>
              <p class="text-xs text-gray-500">${marker.universityName} · ${categoryName}</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-2">${displayDescription || ''}</p>
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span class="text-yellow-500">${'★'.repeat(Math.round(marker.rating))}${'☆'.repeat(5 - Math.round(marker.rating))}</span>
            <span>(${marker.ratingCount}条评价)</span>
          </div>
          ${marker.tags && marker.tags.length > 0 ? `
          <div class="flex flex-wrap gap-1">
            ${marker.tags.slice(0, 5).map((tag: string) => `<span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">${tag}</span>`).join('')}
          </div>
          ` : ''}
          ${!isAddMode ? `
          <div class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <span class="text-xs px-2 py-0.5 rounded-full ${userLevel >= 7 ? 'bg-purple-100 text-purple-700' : userLevel >= 5 ? 'bg-blue-100 text-blue-700' : userLevel >= 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">
              Lv.${userLevel}
            </span>
            ${userLevel >= 5 ? '<span class="text-xs text-green-600">可添加验证标记</span>' : ''}
            ${userLevel >= 7 ? '<span class="text-xs text-purple-600">优先展示</span>' : ''}
          </div>
          ` : ''}
        </div>
      `;

      L.marker([marker.coordinates.lat, marker.coordinates.lng], {
        icon: customIcon,
      }).addTo(map).bindPopup(popupContent);
    });
  };

  if (!isClient) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg shadow-md relative ${isAddMode ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
      role="application"
      aria-label="校园地图 - 交互式地图标记"
    >
      {isAddMode && (
        <div className="absolute top-2 left-2 z-[1000] bg-primary-500 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          点击地图添加标记
        </div>
      )}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="z-0"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}
