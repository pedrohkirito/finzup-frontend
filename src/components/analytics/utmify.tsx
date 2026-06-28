'use client';

import { useEffect } from 'react';

const UTMIFY_SRC = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
const SCRIPT_ID = 'utmify';

export function Utmify() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = UTMIFY_SRC;
    script.async = true;
    script.dataset.utmifyPreventXcodSck = '';
    script.dataset.utmifyPreventSubids = '';
    document.body.appendChild(script);
  }, []);

  return null;
}
