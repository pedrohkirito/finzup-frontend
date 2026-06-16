'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Star, Sparkles, Zap } from 'lucide-react';

type Plan = 'monthly' | 'semester' | 'annual';

const baseFeatures = [
  'Controle de receitas ilimitadas',
  'Gestão de despesas por categoria',
  'Orçamentos mensais personalizados',
  'Acompanhamento de investimentos',
  'Gestão de doações',
  'Relatórios mensais detalhados',
  'Acesso em todos os dispositivos',
  'Suporte por e-mail',
];


const MONTHLY_PRICE = 13.9;
const SEMESTER_PRICE = 11.9;
const ANNUAL_PRICE = 8.9;

function fmt(value: number) {
  return value.toFixed(2).replace('.', ',');
}

export function PricingSection() {
  const [selected, setSelected] = useState<Plan>('annual');

  const semesterTotal = fmt(SEMESTER_PRICE * 6);
  const semesterSavings = fmt((MONTHLY_PRICE - SEMESTER_PRICE) * 6);
  const semesterDiscount = Math.round(((MONTHLY_PRICE - SEMESTER_PRICE) / MONTHLY_PRICE) * 100);

  const annualTotal = fmt(ANNUAL_PRICE * 12);
  const annualSavings = fmt((MONTHLY_PRICE - ANNUAL_PRICE) * 12);
  const annualDiscount = Math.round(((MONTHLY_PRICE - ANNUAL_PRICE) / MONTHLY_PRICE) * 100);

  const tabs: { id: Plan; label: string; badge?: string }[] = [
    { id: 'monthly', label: 'Mensal' },
    { id: 'semester', label: 'Semestral', badge: `-${semesterDiscount}%` },
    { id: 'annual', label: 'Anual', badge: `-${annualDiscount}%` },
  ];

  const isSelected = (plan: Plan) => selected === plan;

  const ctaClass = (plan: Plan) =>
    isSelected(plan)
      ? 'bg-brand-500 text-white shadow-md shadow-brand-200/70 hover:bg-brand-600 hover:shadow-lg dark:shadow-brand-900/50'
      : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900';

  const cardClass = (plan: Plan) =>
    isSelected(plan)
      ? 'border-brand-300 shadow-xl shadow-brand-100/60 ring-2 ring-brand-500 dark:border-brand-700 dark:shadow-brand-950 dark:ring-brand-700'
      : 'border-slate-200 shadow-sm dark:border-slate-800';

  return (
    <section id="pricing" className="bg-slate-50 py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Planos simples e transparentes
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Sem taxas escondidas. Cancele quando quiser.
          </p>
        </div>

        {/* Seletor de planos */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {tabs.map(({ id, label, badge }) => (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  isSelected(id)
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {label}
                {badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                      isSelected(id)
                        ? 'bg-white/20 text-white'
                        : 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-950 dark:text-brand-green-400'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards de preço */}
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
          {/* Mensal */}
          <div className={`relative rounded-3xl border bg-white p-7 transition-all dark:bg-slate-950 ${cardClass('monthly')}`}>
            {isSelected('monthly') && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                  Selecionado
                </span>
              </div>
            )}

            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Zap className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Mensal</h3>
              <p className="min-h-10 text-sm text-slate-500 dark:text-slate-400">
                Sem compromisso de longo prazo
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">R$</span>
                <span className="text-5xl font-extrabold leading-none text-slate-900 dark:text-white">
                  13<span className="text-3xl">,90</span>
                </span>
                <span className="mb-0.5 text-sm text-slate-500 dark:text-slate-400">/mês</span>
              </div>
              <p className="mt-1 text-xs text-transparent select-none" aria-hidden="true">
                &nbsp;
              </p>
            </div>

            <Link
              href="/register"
              className={`mb-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all hover:-translate-y-px ${ctaClass('monthly')}`}
            >
              Começar agora
            </Link>

            <ul className="space-y-2.5">
              {baseFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Semestral */}
          <div className={`relative rounded-3xl border bg-white p-7 transition-all dark:bg-slate-950 ${cardClass('semester')}`}>
            {isSelected('semester') && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                  <Star className="h-3.5 w-3.5" />
                  Selecionado
                </span>
              </div>
            )}

            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-950">
                <Star className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Semestral</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cobrado como R${semesterTotal} a cada 6 meses
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  -{semesterDiscount}%
                </span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">R$</span>
                <span className="text-5xl font-extrabold leading-none text-slate-900 dark:text-white">
                  11<span className="text-3xl">,90</span>
                </span>
                <span className="mb-0.5 text-sm text-slate-500 dark:text-slate-400">/mês</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Economize R${semesterSavings} em relação ao mensal
              </p>
            </div>

            <Link
              href="/register"
              className={`mb-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all hover:-translate-y-px ${ctaClass('semester')}`}
            >
              Assinar semestral
            </Link>

            <ul className="space-y-2.5">
              {baseFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Anual */}
          <div className={`relative rounded-3xl border bg-white p-7 transition-all dark:bg-slate-950 ${cardClass('annual')}`}>
            {isSelected('annual') && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Mais popular
                </span>
              </div>
            )}

            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-100 dark:bg-brand-green-950">
                <Sparkles className="h-5 w-5 text-brand-green-600 dark:text-brand-green-400" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Anual</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cobrado como R${annualTotal} por ano
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-brand-green-100 px-2.5 py-1 text-xs font-bold text-brand-green-700 dark:bg-brand-green-950 dark:text-brand-green-400">
                  -{annualDiscount}%
                </span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">R$</span>
                <span className="text-5xl font-extrabold leading-none text-slate-900 dark:text-white">
                  8<span className="text-3xl">,90</span>
                </span>
                <span className="mb-0.5 text-sm text-slate-500 dark:text-slate-400">/mês</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Economize R${annualSavings} em relação ao mensal
              </p>
            </div>

            <Link
              href="/register"
              className={`mb-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all hover:-translate-y-px ${ctaClass('annual')}`}
            >
              Assinar plano anual
            </Link>

            <ul className="space-y-2.5">
              {baseFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Garantias */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          {['Sem taxa de cancelamento', 'Dados 100% seguros', 'Suporte em português'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Check className="h-4 w-4 text-brand-green-500" />
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
