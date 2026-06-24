'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { initMixpanel, trackMixpanelEvent } from '@/lib/mixpanel';

export function MixpanelProvider() {
  const pathname = usePathname();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initMixpanel();
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    trackMixpanelEvent('page_viewed', {
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    });
  }, [pathname]);

  return null;
}
