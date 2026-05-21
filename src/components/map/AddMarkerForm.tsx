import React, { useState, useEffect } from "react";
import type { MapMarkerCategory } from "@/lib/types";
import { CATEGORY_ICONS, CATEGORY_NAMES } from "@/lib/types";
import { universities } from "@/data/map-markers";

interface AddMarkerFormProps {
  initialCoordinates?: { lat: number; lng: number };
  onSubmit?: (marker: any) => void;
  onCancel?: () => void;
}

export default function AddMarkerForm({
  initialCoordinates,
  onSubmit,
  onCancel,
}: AddMarkerFormProps) {
  const [formData, setFormData] = useState({
    nameZh: "",
    category: "other" as MapMarkerCategory,
    descriptionZh: "",
    universityId: universities[0]?.id || "",
    lat: initialCoordinates?.lat || 39.9994,
    lng: initialCoordinates?.lng || 116.3228,
  });

  // Listen for coordinates-updated from map click
  useEffect(() => {
    const handleCoordinatesUpdate = (e: CustomEvent) => {
      setFormData((prev) => ({
        ...prev,
        lat: e.detail.lat,
        lng: e.detail.lng,
      }));
    };
    window.addEventListener(
      "coordinates-updated",
      handleCoordinatesUpdate as EventListener,
    );
    return () => {
      window.removeEventListener(
        "coordinates-updated",
        handleCoordinatesUpdate as EventListener,
      );
    };
  }, []);

  const handleUniversityChange = (newUniversityId: string) => {
    setFormData((prev) => ({ ...prev, universityId: newUniversityId }));
    // Notify map to update center
    window.dispatchEvent(
      new CustomEvent("university-changed", {
        detail: { universityId: newUniversityId },
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const university = universities.find((u) => u.id === formData.universityId);
    const markerData = {
      universityId: formData.universityId,
      universityName: university?.name || university?.nameZh || "",
      name: formData.nameZh,
      nameZh: formData.nameZh,
      category: formData.category,
      description: formData.descriptionZh,
      descriptionZh: formData.descriptionZh,
      coordinates: { lat: formData.lat, lng: formData.lng },
      images: [],
      tags: [],
    };

    // Dispatch event for the page script to handle
    const event = new CustomEvent("marker-form-submit", {
      detail: markerData,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          大学
        </label>
        <select
          value={formData.universityId}
          onChange={(e) => handleUniversityChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          {universities.map((uni) => (
            <option key={uni.id} value={uni.id}>
              {uni.nameZh}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          地点名称
        </label>
        <input
          type="text"
          value={formData.nameZh}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nameZh: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          类型
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              category: e.target.value as MapMarkerCategory,
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          {Object.keys(CATEGORY_ICONS).map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_ICONS[cat]} {CATEGORY_NAMES[cat]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <textarea
          value={formData.descriptionZh}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, descriptionZh: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel || (() => window.history.back())}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          提交
        </button>
      </div>
    </form>
  );
}
