/**
 * Google AdSense Ad Slot Component (React version)
 *
 * Renders a responsive ad unit. Before AdSense approval, shows a placeholder.
 * Replace ca-pub-XXXXXXXXXX and ad-slot values with real IDs after approval.
 *
 * Props:
 *  - format: 'auto' | 'horizontal' | 'vertical' | 'rectangle' (default: 'auto')
 *  - className: extra CSS classes
 *  - slot: ad slot ID (default: uses a generic placeholder)
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
  slot = '0000000000', // Replace with real ad slot ID after AdSense approval
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);

  // AdSense publisher ID — replace after approval
  const AD_CLIENT = 'ca-pub-XXXXXXXXXX';
  const isProduction = import.meta.env.PROD;

  useEffect(() => {
    if (isProduction && AD_CLIENT !== 'ca-pub-XXXXXXXXXX' && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense push failed:', e);
      }
    }
  }, [isProduction, AD_CLIENT]);

  if (isProduction && AD_CLIENT !== 'ca-pub-XXXXXXXXXX') {
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

  // Placeholder (shown before AdSense approval or in dev mode)
  return (
    <div className={`adsense-placeholder bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center py-6 ${className}`}>
      <div className="text-center">
        <p className="text-xs text-gray-400 font-medium">广告位</p>
        <p className="text-[10px] text-gray-300 mt-1">Ad Space — AdSense Pending</p>
      </div>
    </div>
  );
}
