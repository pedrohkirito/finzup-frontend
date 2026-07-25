'use client';

import {
  ChevronRight,
  CreditCard,
  Heart,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const summaryCards = [
  {
    title: 'Receitas',
    value: 'R$ 8.500,00',
    itemCount: '4 itens',
    icon: TrendingUp,
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    delay: '0ms',
  },
  {
    title: 'Despesas',
    value: 'R$ 4.200,00',
    itemCount: '12 itens',
    icon: TrendingDown,
    accent: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/60',
    delay: '100ms',
  },
  {
    title: 'Doações',
    value: 'R$ 150,00',
    itemCount: '2 itens',
    icon: Heart,
    accent: 'text-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-950/60',
    delay: '200ms',
  },
  {
    title: 'Saldo',
    value: 'R$ 4.150,00',
    saldo: true,
    icon: Wallet,
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    delay: '300ms',
  },
  {
    title: 'Fatura Cartão',
    value: 'R$ 1.280,00',
    itemCount: '5 itens',
    icon: CreditCard,
    accent: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/60',
    delay: '400ms',
  },
];

export function LandingSummaryMock() {
  return (
    <div className="relative mx-auto max-w-6xl">
      <div
        className="pointer-events-none absolute -inset-4 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(3,182,230,0.14)_0%,transparent_68%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_center,rgba(3,182,230,0.12)_0%,transparent_68%)]"
        aria-hidden
      />

      <div className="mb-4 sm:hidden">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green-500" aria-hidden />
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resumo do mês
          </h3>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visão geral das suas finanças
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 shadow-2xl shadow-brand-500/10 ring-1 ring-brand-500/5 backdrop-blur sm:p-6 dark:border-slate-800 dark:bg-slate-900/85 dark:shadow-brand-500/5 dark:ring-white/5">
        <div className="mb-4 hidden items-end justify-between gap-4 sm:flex">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green-500" aria-hidden />
              <p className="text-[11px] font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-400">
                Ao vivo na conta
              </p>
            </div>
            <h3 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-white">
              Resumo do mês
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              Demonstração — veja como fica seu controle financeiro
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-brand-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-700 dark:border-brand-500/25 dark:bg-brand-950/40 dark:text-brand-300">
            Julho · 2026
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map(({ title, value, itemCount, saldo, icon: Icon, accent, bg, delay }) => (
            <Card
              key={title}
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700"
              style={{ animationDelay: delay }}
            >
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
                <div className={cn('rounded-lg p-2', bg)}>
                  <Icon className={cn('h-4 w-4', accent)} />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className={cn('text-2xl font-bold tracking-tight tabular-nums xl:text-xl 2xl:text-2xl', accent)}>
                  {value}
                </p>
                {itemCount != null && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                    {itemCount}
                    <ChevronRight className="h-3 w-3" />
                  </p>
                )}
                {saldo && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                    Ver composição
                    <ChevronRight className="h-3 w-3" />
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          <Card
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 sm:col-span-2 xl:col-span-5"
            style={{ animationDelay: '500ms' }}
          >
            <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
              <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/60">
                <PiggyBank className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-medium">Meta de Investimento</CardTitle>
                <p className="text-xs text-slate-400">3 aportes este mês</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                74%
              </span>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-2xl dark:text-white">
                    R$ 1.850,00
                  </p>
                  <p className="text-xs text-slate-400">investidos</p>
                </div>
                <p className="text-sm text-slate-500 tabular-nums">
                  Meta: <span className="font-medium text-slate-700 dark:text-slate-300">R$ 2.500,00</span>
                </p>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full w-[74%] animate-pulse rounded-full bg-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
