'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { ScopeTag } from '@/components/finance/entry-extras-meta';
import { CASH_FLOW_SOURCE_LABELS } from '@/components/fluxo/cash-flow-labels';
import type { CashFlowMovement } from '@/types';

const SCOPE_SHORT = { personal: 'PF', business: 'PJ' } as const;

export function MovementAmount({ movement, className }: { movement: CashFlowMovement; className?: string }) {
  if (movement.direction === 'internal') {
    return (
      <span
        className={cn('shrink-0 font-semibold tabular-nums text-slate-500 dark:text-slate-400', className)}
        title="Transferência: sai de um lado e entra no outro, sem mudar o saldo deste filtro"
      >
        ⇄ {formatCurrency(movement.amount)}
      </span>
    );
  }
  const isIn = movement.direction === 'in';
  return (
    <span
      className={cn(
        'shrink-0 font-semibold tabular-nums',
        isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400',
        className,
      )}
    >
      {isIn ? '+' : '−'} {formatCurrency(movement.amount)}
    </span>
  );
}

/** "PJ → PF · Inter → Nubank" para as transferências. */
function transferRoute(movement: CashFlowMovement, accountNames?: Map<string, string>) {
  const t = movement.transfer;
  if (!t) return null;
  const parts: string[] = [];
  if (t.fromScope !== t.toScope) parts.push(`${SCOPE_SHORT[t.fromScope]} → ${SCOPE_SHORT[t.toScope]}`);
  const from = t.fromBankAccountId ? accountNames?.get(t.fromBankAccountId) : undefined;
  const to = t.toBankAccountId ? accountNames?.get(t.toBankAccountId) : undefined;
  if (from || to) parts.push(`${from ?? 'sem conta'} → ${to ?? 'sem conta'}`);
  return parts.join(' · ') || null;
}

function dotColor(movement: CashFlowMovement) {
  if (movement.direction === 'internal' || movement.source === 'transfer') return 'bg-sky-500';
  if (movement.direction === 'in') return 'bg-emerald-500';
  return movement.source === 'credit_card_bill' ? 'bg-violet-500' : 'bg-orange-500';
}

/** Uma movimentação do dia. A fatura do cartão abre para mostrar o que a compõe. */
export function CashFlowMovementRow({
  movement,
  accountName,
  accountNames,
  showScope,
}: {
  movement: CashFlowMovement;
  accountName?: string;
  /** Usado para mostrar origem e destino das transferências. */
  accountNames?: Map<string, string>;
  showScope: boolean;
}) {
  const [open, setOpen] = useState(false);
  const items = movement.items ?? [];
  const expandable = items.length > 0;

  const route = transferRoute(movement, accountNames);
  const meta = (
    route
      ? [CASH_FLOW_SOURCE_LABELS[movement.source], route, movement.direction === 'internal' ? 'não muda o saldo' : null]
      : [CASH_FLOW_SOURCE_LABELS[movement.source], accountName]
  )
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="py-2">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', dotColor(movement))}
        />
        <div className="min-w-0 flex-1">
          {expandable ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex max-w-full cursor-pointer items-center gap-1 text-left text-sm font-medium text-slate-800 hover:underline dark:text-slate-100"
            >
              <span className="truncate">{movement.name}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
            </button>
          ) : (
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{movement.name}</p>
          )}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
            <span>{expandable ? `${meta} · ${items.length} ${items.length === 1 ? 'item' : 'itens'}` : meta}</span>
            {showScope && !movement.transfer && <ScopeTag scope={movement.scope} />}
          </div>
        </div>
        <MovementAmount movement={movement} className="text-sm" />
      </div>
      {expandable && open && (
        <ul className="mt-2 space-y-1 border-l border-slate-200 pl-4 ml-1 dark:border-white/[0.08]">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate text-slate-500 dark:text-slate-400">
                {item.name}
                {item.day ? ` · compra dia ${item.day}` : ''}
              </span>
              <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(item.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
