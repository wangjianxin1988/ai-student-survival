import type { MapMarker } from './types';

const STORAGE_KEY = 'ugc_map_markers';
const PENDING_KEY = 'ugc_pending_markers';

export interface UGCMarkerData {
  id: string;
  universityId: string;
  universityName: string;
  name: string;
  nameZh: string;
  category: MapMarker['category'];
  description: string;
  descriptionZh: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  rating: number;
  ratingCount: number;
  tags: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Get all UGC markers from localStorage
export function getUGCMarkers(): UGCMarkerData[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load UGC markers:', error);
    return [];
  }
}

// Get pending markers
export function getPendingMarkers(): UGCMarkerData[] {
  return getUGCMarkers().filter(m => m.status === 'pending');
}

// Save UGC marker to localStorage
export function saveUGCMarker(
  marker: Omit<UGCMarkerData, 'id' | 'createdAt' | 'status' | 'rating' | 'ratingCount'>,
  status: 'pending' | 'approved' | 'rejected' = 'pending'
): UGCMarkerData {
  const markers = getUGCMarkers();

  const newMarker: UGCMarkerData = {
    ...marker,
    id: `ugc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: status,
    rating: 0,
    ratingCount: 0,
  };

  markers.push(newMarker);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
  }

  return newMarker;
}

// Update marker status (for admin use)
export function updateMarkerStatus(
  markerId: string,
  status: 'pending' | 'approved' | 'rejected'
): boolean {
  const markers = getUGCMarkers();
  const index = markers.findIndex(m => m.id === markerId);

  if (index === -1) return false;

  markers[index].status = status;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
  }

  return true;
}

// Delete marker
export function deleteUGCMarker(markerId: string): boolean {
  const markers = getUGCMarkers();
  const filtered = markers.filter(m => m.id !== markerId);

  if (filtered.length === markers.length) return false;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  return true;
}

// Get all markers (including UGC) combined with static markers
export function getAllMarkersWithUGC(staticMarkers: MapMarker[]): (MapMarker | UGCMarkerData)[] {
  const ugcMarkers = getUGCMarkers();

  // Filter out UGC markers that are not approved (only show approved in main view)
  const approvedUGC = ugcMarkers.filter(m => m.status === 'approved');

  return [...staticMarkers, ...approvedUGC];
}

// Get UGC markers count by status
export function getUGCMarkerStats(): { pending: number; approved: number; rejected: number } {
  const markers = getUGCMarkers();

  return {
    pending: markers.filter(m => m.status === 'pending').length,
    approved: markers.filter(m => m.status === 'approved').length,
    rejected: markers.filter(m => m.status === 'rejected').length,
  };
}

// Clear all UGC markers (for testing)
export function clearAllUGCMarkers(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PENDING_KEY);
  }
}
