'use client';

import { useState } from 'react';
import { Check, Loader2, Sparkles, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trackLead } from '@/lib/funnel-analytics';
import {
  BILLING_FEATURES,
  BILLING_PLAN_ORDER,
  BILLING_PLANS,
  type BillingPlanId,
  formatBRL,
  formatPriceParts,
  planBillingLabel,
  planDiscountPercent,
  planPriceIntervalSuffix,
  planSavingsVsMonthly,
} from '@/constants/billing-plans';

const ICONS = {
  zap: Zap,
  star: Star,
  sparkles: Sparkles,
} as const;

interface PlanPickerProps {
  mode: 'landing' | 'subscribe';
  onSelectPlan?: (plan: BillingPlanId) => void | Promise<void>;
  loadingPlan?: BillingPlanId | null;
  defaultSelected?: BillingPlanId;
  compactHeader?: boolean;
}

export function PlanPicker({
  mode,
  onSelectPlan,
  loadingPlan = null,
  defaultSelected = 'annual',
  compactHeader = false,
}: PlanPickerProps) {
  const [selected, setSelected] = useState<BillingPlanId>(defaultSelected);

  const tabs = BILLING_PLAN_ORDER.map((id) => ({
    id,
    label: BILLING_PLANS[id].label,
    badge: planDiscountPercent(id),
  }));

  const isSelected = (plan: BillingPlanId) => selected === plan;

  const ctaClass = (plan: BillingPlanId) =>
    isSelected(plan)
      ? 'bg-brand-500 text-white shadow-md shadow-brand-200/70 hover:bg-brand-600 hover:shadow-lg dark:shadow-brand-900/50'
      : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900';

  const cardClass = (plan: BillingPlanId) => {
    if (isSelected(plan)) {
      return 'border-brand-300 shadow-xl shadow-brand-100/60 ring-2 ring-brand-500 dark:border-brand-700 dark:shadow-brand-950 dark:ring-brand-700';
    }

    if (plan === 'annual') {
      return 'border-brand-200 shadow-md dark:border-brand-800';
    }

    return 'border-slate-200 shadow-sm dark:border-slate-800';
  };

  const renderPrice = (planId: BillingPlanId) => {
    const plan = BILLING_PLANS[planId];
    const { int, dec } = formatPriceParts(plan.total);
    const intervalSuffix = planPriceIntervalSuffix(plan.intervalMonths);

    return (
      <>
        <div className="flex items-end gap-1">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">R$</span>
          <span className="text-4xl font-extrabold leading-none text-slate-900 sm:text-5xl dark:text-white">
            {int}<span className="text-2xl sm:text-3xl">,{dec}</span>
          </span>
          <span className="mb-0.5 text-sm text-slate-500 dark:text-slate-400">{intervalSuffix}</span>
        </div>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {planBillingLabel(plan.intervalMonths)}
        </p>
      </>
    );
  };

  const renderCta = (planId: BillingPlanId) => {
    const label =
      mode === 'landing'
        ? 'Assinar agora'
        : loadingPlan === planId
          ? 'Redirecionando...'
          : 'Assinar plano';

    const className = `mb-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-semibold transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 ${ctaClass(planId)}`;

    if (mode === 'landing') {
      return (
        <button
          type="button"
          className={className}
          onClick={() => {
            trackLead('Pricing Section', { ctaLocation: 'plan_picker', plan: planId });
            if (onSelectPlan) {
              onSelectPlan(planId);
            } else {
              window.location.href = '/?checkout=1';
            }
          }}
        >
          {label}
        </button>
      );
    }

    return (
      <Button
        type="button"
        variant="ghost"
        className={className}
        disabled={loadingPlan != null}
        onClick={() => onSelectPlan?.(planId)}
      >
        {loadingPlan === planId && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </Button>
    );
  };

  return (
    <div>
      {!compactHeader && (
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:mb-4 sm:text-4xl dark:text-white">
            {mode === 'subscribe' ? 'Escolha seu plano' : 'Planos simples e transparentes'}
          </h2>
          {mode === 'landing' ? (
            <>
              <p className="mb-3 text-lg font-semibold leading-relaxed text-slate-800 sm:text-xl dark:text-slate-200">
                Controle financeiro premium com{' '}
                <span className="text-brand-600 dark:text-brand-400">assistente de IA</span> incluso.
              </p>
              <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
                PIX ou cartão. Cancele quando quiser, sem burocracia.
              </p>
            </>
          ) : (
            <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
              Escolha um plano e pague com PIX ou cartão. Acesso imediato após a confirmação.
            </p>
          )}
        </div>
      )}

      <div className="mb-8 flex justify-center sm:mb-12">
        <ScrollArea
          variant="none"
          orientation="horizontal"
          className="inline-flex max-w-full rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="inline-flex items-center">
          {tabs.map(({ id, label, badge }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:gap-2 sm:px-5 sm:py-2 sm:text-sm ${
                isSelected(id)
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {label}
              {badge != null && badge > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    isSelected(id)
                      ? 'bg-white/20 text-white'
                      : 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-950 dark:text-brand-green-400'
                  }`}
                >
                  -{badge}%
                </span>
              )}
            </button>
          ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mx-auto grid max-w-6xl gap-4 overflow-visible sm:gap-6 lg:grid-cols-3 lg:items-stretch">
        {BILLING_PLAN_ORDER.map((planId) => {
          const plan = BILLING_PLANS[planId];
          const Icon = ICONS[plan.icon];
          const discount = planDiscountPercent(planId);
          const savings = planSavingsVsMonthly(planId);

          return (
            <div
              key={planId}
              className={`relative flex h-full flex-col rounded-3xl border bg-white p-5 transition-all sm:p-7 dark:bg-slate-950 ${cardClass(planId)} ${
                isSelected(planId)
                  ? 'mx-auto w-full max-w-md lg:mx-0 lg:max-w-none'
                  : 'hidden lg:flex'
              }`}
            >
              {(planId === 'annual' || isSelected(planId)) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                    {planId === 'annual' && <Sparkles className="h-3.5 w-3.5" />}
                    {planId === 'semester' && isSelected(planId) && <Star className="h-3.5 w-3.5" />}
                    {planId === 'annual' ? 'Mais popular' : 'Selecionado'}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                    planId === 'monthly'
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : planId === 'semester'
                        ? 'bg-brand-100 dark:bg-brand-950'
                        : 'bg-brand-green-100 dark:bg-brand-green-950'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      planId === 'monthly'
                        ? 'text-slate-600 dark:text-slate-400'
                        : planId === 'semester'
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-brand-green-600 dark:text-brand-green-400'
                    }`}
                  />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{plan.label}</h3>
                    <p className="min-h-10 text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                  </div>
                  {discount != null && discount > 0 && (
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                        planId === 'annual'
                          ? 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-950 dark:text-brand-green-400'
                          : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      }`}
                    >
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">{renderPrice(planId)}</div>

              <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/40">
                <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {plan.aiCredits} créditos de IA inclusos
                </p>
                <p className="mt-0.5 text-xs text-brand-600/80 dark:text-brand-400/80">
                  Renovados a cada cobrança do plano
                </p>
              </div>

              <div className="-mt-4 mb-4 min-h-10">
                {savings > 0 && planId !== 'monthly' && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Economize R${formatBRL(savings)} em relação ao mensal
                  </p>
                )}
              </div>

              {renderCta(planId)}

              <ul className="space-y-2.5">
                {BILLING_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {mode === 'landing' && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-8">
          {['Sem taxa de cancelamento', 'Dados 100% seguros', 'Suporte em português'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Check className="h-4 w-4 text-brand-green-500" />
              {badge}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
