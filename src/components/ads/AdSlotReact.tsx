/**
 * Ad Slot Component (React version)
 * 
 * Placeholder for future AdSense ads. Shows a clean placeholder until AdSense is approved.
 * Replace ca-pub-2380757804889093 with real publisher ID after approval.
 *
 * Props:
 *  - format: 'auto' | 'horizontal' | 'vertical' | 'rectangle' (default: 'auto')
 *  - className: extra CSS classes
 *  - slot: ad slot ID
 */

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  slot?: string;
}

export default function AdSlot({
  format = 'auto',
  className = '',
  slot = '0000000000',
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);

  // AdSense publisher ID — replace after approval
  const AD_CLIENT = 'ca-pub-2380757804889093';
  const isProduction = import.meta.env.PROD;
  const isAdSenseReady = isProduction && AD_CLIENT !== 'ca-pub-2380757804889093';

  useEffect(() => {
    if (isAdSenseReady && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push failed:', e);
      }
    }
  }, [isAdSenseReady]);

  if (isAdSenseReady) {
    return (
      <div className={`adsense-container ${className}`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Placeholder (shown before AdSense approval)
  return (
    <div className={`ad-placeholder bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <p className="text-xs text-gray-300 font-medium">广告位</p>
        <p className="text-[10px] text-gray-200 mt-1">Ad Space</p>
      </div>
    </div>
  );
}
