import React, { useEffect, useRef } from 'react';
import type { MapMarker } from '@/lib/types';

interface University {
  id: string;
  name: string;
  nameZh: string;
  location: { lat: number; lng: number };
}

interface CampusMapProps {
  markers?: MapMarker[];
  selectedUniversity?: string;
  height?: string;
  userPoints?: number;
  universities?: University[];
  isAddMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

/** Build marker popup HTML (DRY - single source of truth) */
function buildPopupContent(marker: MapMarker, universityName?: string): string {
  return `
    <div class="p-2 min-w-[200px]">
      <h3 class="font-semibold text-sm">${marker.nameZh || marker.name}</h3>
      <p class="text-xs text-gray-500 mt-1">${universityName || ''}</p>
      <p class="text-xs text-gray-600 mt-1">${marker.descriptionZh || marker.description || ''}</p>
      ${marker.rating ? `<div class="flex items-center mt-2 text-xs">${marker.rating}/5 (${marker.ratingCount || 0} reviews)</div>` : ''}
      <a href="/map?marker=${marker.id}" class="block mt-2 text-xs text-blue-500 hover:text-blue-700">View Details</a>
    </div>
  `;
}

/** Add all markers to the map layer */
function addMarkersToLayer(
  L: any,
  layer: any,
  markers: MapMarker[],
  universities: University[]
) {
  layer.clearLayers();

  // Custom emoji-based icon to avoid Leaflet default icon image dependency
  const customIcon = L.divIcon({
    html: '<div style="font-size:28px;line-height:28px;text-align:center;">📍</div>',
    className: 'custom-leaflet-marker',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });

  markers.forEach(marker => {
    const uni = universities.find(u => u.id === marker.universityId);
    const content = buildPopupContent(marker, uni?.name || uni?.nameZh);
    L.marker([marker.coordinates.lat, marker.coordinates.lng], { icon: customIcon })
      .bindPopup(L.popup().setContent(content))
      .addTo(layer);
  });
}

export default function CampusMap({
  markers = [],
  selectedUniversity,
  height = '500px',
  userPoints = 0,
  universities = [],
  isAddMode = false,
  onMapClick,
}: CampusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);
  // Store L reference for use in update effect
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingMarkerRef = useRef<any>(null);
  // Store university-changed handler for cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const universityHandlerRef = useRef<any>(null);
  // Clicked coordinates for add mode
  const [clickedCoords, setClickedCoords] = React.useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      LRef.current = L; // Store L for later use

      // Default center: Beijing
      let center: [number, number] = [39.9042, 116.4074];
      let zoom = 12;

      if (selectedUniversity) {
        const uni = universities.find(u => u.id === selectedUniversity);
        if (uni) {
          center = [uni.location.lat, uni.location.lng];
          zoom = 15;
        }
      }

      const map = L.map(mapRef.current!).setView(center, zoom);
      mapInstanceRef.current = map;

      // Tile layer - OpenStreetMap
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Satellite tile layer option
      const satelliteTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 19,
      });

      // Layer control for Street/Satellite toggle
      const baseMaps = {
        'Street Map': tileLayer,
        'Satellite': satelliteTileLayer,
      };
      L.control.layers(baseMaps).addTo(map);

      // Click handler for add mode - show interactive marker
      if (isAddMode && onMapClick) {
        map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
          const { lat, lng } = e.latlng;
          onMapClick(lat, lng);
          setClickedCoords({ lat, lng });

          // Remove previous pending marker
          if (pendingMarkerRef.current) {
            map.removeLayer(pendingMarkerRef.current);
          }

          // Add a pulsing marker at clicked location
          const pulseIcon = L.divIcon({
            html: `<div class="add-marker-pulse">
              <div class="add-marker-dot"></div>
              <div class="add-marker-ring"></div>
            </div>`,
            className: 'add-marker-container',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          pendingMarkerRef.current = L.marker([lat, lng], { icon: pulseIcon }).addTo(map);
        });
      }

      // Markers layer
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Add existing markers
      if (markers.length > 0) {
        addMarkersToLayer(L, markersLayerRef.current, markers, universities);
      }

      // Listen for university-changed events from AddMarkerForm
      const handleUniversityChanged = (e: CustomEvent) => {
        const { universityId } = e.detail;
        const uni = universities.find(u => u.id === universityId);
        if (uni) {
          map.setView([uni.location.lat, uni.location.lng], 15, { animate: true });
          // Reset pending marker when university changes
          if (pendingMarkerRef.current) {
            map.removeLayer(pendingMarkerRef.current);
            pendingMarkerRef.current = null;
          }
          setClickedCoords(null);
        }
      };
      universityHandlerRef.current = handleUniversityChanged;
      window.addEventListener('university-changed', handleUniversityChanged as EventListener);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        if (universityHandlerRef.current) {
          window.removeEventListener('university-changed', universityHandlerRef.current as EventListener);
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when they change (including filter changes)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !LRef.current) return;
    addMarkersToLayer(LRef.current, markersLayerRef.current, markers, universities);
  }, [markers, universities]);

  // Update center when selectedUniversity changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedUniversity) return;

    const uni = universities.find(u => u.id === selectedUniversity);
    if (uni) {
      mapInstanceRef.current.setView([uni.location.lat, uni.location.lng], 15);
    }
  }, [selectedUniversity, universities]);

  if (isAddMode) {
    return (
      <div className="relative w-full" style={{ height }}>
        <div
          ref={mapRef}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
          style={{ height: '100%' }}
        />
        <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none z-[1000]">
          {clickedCoords ? (
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700">
              {clickedCoords.lat.toFixed(5)}, {clickedCoords.lng.toFixed(5)}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm text-gray-500">
              {universities.find(u => u.id === selectedUniversity)
                ? '点击地图选择位置'
                : '请先选择大学'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg"
      />
      {userPoints > 0 && (
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full shadow text-sm font-medium text-blue-600">
          {userPoints} 积分
        </div>
      )}
    </div>
  );
}
