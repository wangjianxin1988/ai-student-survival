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

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

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

      // Click handler for add mode
      if (isAddMode && onMapClick) {
        map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Markers layer
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Add existing markers
      if (markers.length > 0) {
        markersLayerRef.current.clearLayers();
        markers.forEach(marker => {
          const uni = universities.find(u => u.id === marker.universityId);
          const popupContent = `
            <div class="p-2 min-w-[200px]">
              <h3 class="font-semibold text-sm">${marker.nameZh || marker.name}</h3>
              <p class="text-xs text-gray-500 mt-1">${marker.universityName || ''}</p>
              <p class="text-xs text-gray-600 mt-1">${marker.descriptionZh || marker.description || ''}</p>
              ${marker.rating ? `<div class="flex items-center mt-2 text-xs">${marker.rating}/5 (${marker.ratingCount || 0} reviews)</div>` : ''}
              <a href="/map?marker=${marker.id}" class="block mt-2 text-xs text-blue-500 hover:text-blue-700">View Details</a>
            </div>
          `;
          const popup = L.popup().setContent(popupContent);
          L.marker([marker.coordinates.lat, marker.coordinates.lng])
            .bindPopup(popup)
            .addTo(markersLayerRef.current);
        });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayerRef.current.clearLayers();
      markers.forEach(marker => {
        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-semibold text-sm">${marker.nameZh || marker.name}</h3>
            <p class="text-xs text-gray-500 mt-1">${marker.universityName || ''}</p>
            <p class="text-xs text-gray-600 mt-1">${marker.descriptionZh || marker.description || ''}</p>
            ${marker.rating ? `<div class="flex items-center mt-2 text-xs">${marker.rating}/5 (${marker.ratingCount || 0} reviews)</div>` : ''}
            <a href="/map?marker=${marker.id}" class="block mt-2 text-xs text-blue-500 hover:text-blue-700">View Details</a>
          </div>
        `;
        const popup = L.popup().setContent(popupContent);
        L.marker([marker.coordinates.lat, marker.coordinates.lng])
          .bindPopup(popup)
          .addTo(markersLayerRef.current);
      });
    };

    updateMarkers();
  }, [markers]);

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
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
      />
    );
  }

  return (
    <div className="relative" style={{ zIndex: 1 }}>
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