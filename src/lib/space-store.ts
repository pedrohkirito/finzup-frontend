/**
 * Espaço escolhido no topo do app (consolidado, pessoal ou uma empresa), lembrado no navegador.
 * Fica fora do React para o `api.ts` mandar o header X-Finzup-Space em toda requisição.
 */
import type { SpaceSelection } from '@/types';

const STORAGE_KEY = 'finzup:space';
export const SPACE_CHANGE_EVENT = 'finzup:space-change';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readSpaceSelection(): SpaceSelection {
  if (typeof window === 'undefined') return 'all';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && UUID_RE.test(stored) ? stored : 'all';
  } catch {
    return 'all';
  }
}

export function writeSpaceSelection(value: SpaceSelection) {
  try {
    if (value === 'all') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // sem localStorage: a escolha vale só até recarregar
  }
  window.dispatchEvent(new Event(SPACE_CHANGE_EVENT));
}

export function subscribeSpaceSelection(onChange: () => void) {
  window.addEventListener(SPACE_CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(SPACE_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** Header para a API: só quando há um espaço escolhido (consolidado = sem header). */
export function spaceHeader(): Record<string, string> {
  const value = readSpaceSelection();
  return value === 'all' ? {} : { 'X-Finzup-Space': value };
}
