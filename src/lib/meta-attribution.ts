const FBCLID_STORAGE_KEY = 'finzup:meta:fbclid';
export const CHECKOUT_RETURN_ORDER_KEY = 'finzup:checkout:return-order';

type StoredClick = { fbclid: string; ts: number };

export function rememberMetaClick() {
  if (typeof window === 'undefined') return;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid')?.trim();
  if (!fbclid || fbclid.length > 240) return;

  try {
    const stored: StoredClick = { fbclid, ts: Date.now() };
    sessionStorage.setItem(FBCLID_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // sessionStorage indisponível
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const parts = document.cookie.split('; ');
  for (const part of parts) {
    const index = part.indexOf('=');
    if (index === -1 || part.slice(0, index) !== name) continue;
    const value = decodeURIComponent(part.slice(index + 1)).trim();
    return value || undefined;
  }
  return undefined;
}

export type MetaBrowserContext = {
  fbp?: string;
  fbc?: string;
  eventSourceUrl: string;
};

export function getMetaBrowserContext(): MetaBrowserContext {
  const fbp = readCookie('_fbp');
  let fbc = readCookie('_fbc');

  if (!fbc && typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(FBCLID_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredClick>;
        if (typeof parsed.fbclid === 'string' && typeof parsed.ts === 'number') {
          fbc = `fb.1.${parsed.ts}.${parsed.fbclid}`;
        }
      }
    } catch {
      // clique inválido ou storage indisponível
    }
  }

  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
    eventSourceUrl:
      typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}`,
  };
}

export function metaContextHeaders(): Record<string, string> {
  const context = getMetaBrowserContext();
  return {
    ...(context.fbp ? { 'X-Meta-Fbp': context.fbp } : {}),
    ...(context.fbc ? { 'X-Meta-Fbc': context.fbc } : {}),
  };
}
