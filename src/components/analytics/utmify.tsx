'use client';

import { useEffect } from 'react';

const UTMIFY_SRC = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
const SCRIPT_ID = 'utmify';

let utmifyScheduled = false;

function injectUtmifyScript() {
  if (utmifyScheduled || document.getElementById(SCRIPT_ID)) return;
  utmifyScheduled = true;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = UTMIFY_SRC;
  script.async = true;
  script.dataset.utmifyPreventXcodSck = '';
  script.dataset.utmifyPreventSubids = '';
  document.body.appendChild(script);
}

function scheduleUtmify() {
  if (utmifyScheduled || document.getElementById(SCRIPT_ID)) return;

  const run = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(injectUtmifyScript);
    });
  };

  if (document.readyState === 'complete') {
    run();
    return;
  }

  window.addEventListener('load', run, { once: true });
}

export function Utmify() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    scheduleUtmify();
  }, []);

  return null;
}
