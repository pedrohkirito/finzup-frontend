'use client';

import { useState } from 'react';
import { Check, Crown, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/finance/segmented-control';
import { cn, formatCurrency } from '@/lib/utils';
import type { PlanCatalog, PlanCatalogEntry, PlanCycle, PlanTier } from '@/types';

const TIER_RANK: Record<PlanTier, number> = { free: 0, essencial: 1, dono: 2, cfo: 3, conselho: 4 };

interface PlanCatalogGridProps {
  catalog: PlanCatalog;
  /** Plano que vale agora (para marcar "Seu plano" e esconder planos menores). */
  currentTier?: PlanTier | null;
  currentCycle?: PlanCycle | null;
  /** Mostrar só alguns públicos (ex.: na tela de assinatura, PF + Dono App). */
  tiers?: PlanTier[];
  onChoose: (plan: PlanCatalogEntry, cycle: PlanCycle) => void;
  highlightTier?: PlanTier;
}

export function PlanCatalogGrid({
  catalog,
  currentTier,
  currentCycle,
  tiers,
  onChoose,
  highlightTier = 'dono',
}: PlanCatalogGridProps) {
  const [cycle, setCycle] = useState<PlanCycle>(currentCycle ?? 'annual');
  const plans = catalog.plans.filter(
    (p) => p.available && p.checkout !== 'none' && (!tiers || tiers.includes(p.tier)),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          ariaLabel="Ciclo de cobrança"
          value={cycle}
          onChange={setCycle}
          options={[
            { value: 'monthly', label: 'Mensal' },
            { value: 'annual', label: 'Anual' },
          ]}
        />
        <p className="text-xs text-slate-500">Pagamento pelo Asaas, com PIX ou cartão. O plano libera na confirmação.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const price = plan.prices[cycle] ?? plan.prices.monthly;
          const priceCycle: PlanCycle = plan.prices[cycle] ? cycle : 'monthly';
          const isCurrent = currentTier === plan.tier && (!currentCycle || currentCycle === priceCycle || plan.checkout === 'contact');
          const isLower = !!currentTier && currentTier !== 'free' && TIER_RANK[plan.tier] < TIER_RANK[currentTier];
          const highlighted = plan.tier === highlightTier;

          return (
            <div
              key={plan.tier}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm dark:bg-white/[0.04]',
                highlighted
                  ? 'border-brand-300 shadow-brand-500/10 dark:border-brand-400/40'
                  : 'border-slate-200 dark:border-white/[0.08]',
              )}
            >
              {highlighted && (
                <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  <Sparkles className="h-3 w-3" aria-hidden /> Para donos de empresa
                </span>
              )}
              <div className="flex items-center gap-2">
                {plan.audience === 'dono' && <Crown className="h-4 w-4 text-amber-500" aria-hidden />}
                <h3 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
              </div>
              <p className="mt-1 min-h-[40px] text-sm text-slate-600 dark:text-slate-400">{plan.tagline}</p>

              {price && (
                <div className="mt-4">
                  {price.compareAt && priceCycle === 'annual' && (
                    <p className="text-xs text-slate-400 line-through">{formatCurrency(price.compareAt)}/ano</p>
                  )}
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(price.monthlyEquivalent)}
                    <span className="text-sm font-medium text-slate-500">/mês</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {priceCycle === 'annual' ? `${formatCurrency(price.value)} por ano` : 'cobrado todo mês'}
                    {plan.setupFee ? ` · implantação de ${formatCurrency(plan.setupFee)}` : ''}
                    {plan.minimumMonths ? ` · mínimo de ${plan.minimumMonths} meses` : ''}
                  </p>
                </div>
              )}

              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Seu plano
                  </Button>
                ) : isLower ? (
                  <Button variant="ghost" className="w-full" disabled>
                    Incluído no seu plano
                  </Button>
                ) : plan.checkout === 'contact' ? (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={catalog.salesContactUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" /> Falar com a equipe
                    </a>
                  </Button>
                ) : (
                  <Button
                    className={cn('w-full', highlighted && 'brand-gradient-bg-r text-white shadow-md shadow-brand-500/25 hover:opacity-90')}
                    variant={highlighted ? 'default' : 'outline'}
                    onClick={() => onChoose(plan, priceCycle)}
                  >
                    {currentTier && currentTier !== 'free' ? `Mudar para ${plan.name}` : `Assinar ${plan.name}`}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
