'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

/** Dia de vencimento da fatura do cartão (opcional). Usado no fluxo de caixa. */
export function DueDaySelect({
  value,
  onChange,
  className,
  compact = false,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Select value={value ? String(value) : 'none'} onValueChange={(v) => onChange(v === 'none' ? null : Number(v))}>
      <SelectTrigger aria-label="Vencimento da fatura" className={cn(compact && 'h-8 w-auto gap-1 px-2 text-xs', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value="none">{compact ? 'Sem vencimento' : 'Não informar'}</SelectItem>
        {DAYS.map((d) => (
          <SelectItem key={d} value={String(d)}>
            {compact ? `Vence dia ${d}` : `Dia ${d}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
