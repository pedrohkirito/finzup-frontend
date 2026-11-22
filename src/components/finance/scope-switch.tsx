'use client';

import { SegmentedControl } from '@/components/finance/segmented-control';
import { useBusinessEnabled, useScopeFilter } from '@/hooks/use-finance-scope';
import type { ScopeFilter } from '@/types';

const OPTIONS: { value: ScopeFilter; label: string; hint: string }[] = [
  { value: 'all', label: 'Consolidado', hint: 'PF + PJ juntos' },
  { value: 'personal', label: 'PF', hint: 'Só finanças pessoais' },
  { value: 'business', label: 'PJ', hint: 'Só a empresa' },
];

/**
 * Troca a visão entre Consolidado, PF e PJ. Só aparece com o fluxo PJ ligado
 * (Configurações → Fluxo PJ, ou ao salvar o primeiro lançamento PJ).
 */
export function ScopeSwitch({ className }: { className?: string }) {
  const businessEnabled = useBusinessEnabled();
  const [scope, setScope] = useScopeFilter();
  if (!businessEnabled) return null;
  return (
    <SegmentedControl
      ariaLabel="Visão PF/PJ"
      options={OPTIONS}
      value={scope}
      onChange={setScope}
      className={className}
    />
  );
}
