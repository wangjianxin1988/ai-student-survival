/**
 * Monetag In-Page Push Ad Slot Component (React version)
 * 
 * Renders a Monetag in-page push banner ad in existing ad slots.
 * Zone ID: 11076692 (In-Page Push format)
 *
 * Props:
 *  - className: extra CSS classes
 *  - label: optional label text above the ad
 */

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  className?: string;
  label?: string;
}

export default function AdSlot({ className = '', label }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check if script already loaded to avoid duplicates
    if (containerRef.current.querySelector('script[src*="nap5k.com"]')) return;

    const script = document.createElement('script');
    script.dataset.zone = '11076692';
    script.src = 'https://nap5k.com/tag.min.js';
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div ref={containerRef} className={`monetag-ad-container ${className}`}>
      {label && <p className="text-xs text-gray-400 mb-2 text-center">{label}</p>}
    </div>
  );
}
