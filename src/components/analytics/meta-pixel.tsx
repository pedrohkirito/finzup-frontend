'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  flushQueuedMetaPurchases,
  prepareMetaTrackingUrl,
  trackMetaEvent,
} from '@/lib/meta-pixel';

export function MetaPixel() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const lastPageViewRef = useRef<string | null>(null);
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    const shouldEnable = Boolean(pixelId) && prepareMetaTrackingUrl(pathname);
    window.fbq?.('consent', shouldEnable ? 'grant' : 'revoke');

    if (!shouldEnable) {
      lastPageViewRef.current = null;
    }

    const timeout = window.setTimeout(() => setEnabled(shouldEnable), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname, pixelId]);

  const trackPageView = useCallback(() => {
    if (!enabled) return;
    flushQueuedMetaPurchases();
    if (lastPageViewRef.current === pathname) return;
    if (trackMetaEvent('PageView')) {
      lastPageViewRef.current = pathname;
    }
  }, [enabled, pathname]);

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  if (!pixelId || !enabled) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onReady={trackPageView}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('consent', 'grant');
            fbq('init', '${pixelId}');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
