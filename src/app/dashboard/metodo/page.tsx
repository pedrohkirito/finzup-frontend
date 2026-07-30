'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBabySteps } from '@/hooks/use-baby-steps';
import { useAssistant } from '@/providers/assistant-provider';
import { cn } from '@/lib/utils';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';

export default function MetodoPage() {
  const { data: state, isLoading } = useBabySteps();
  const { openAssistant } = useAssistant();

  if (!BABY_STEPS_ENABLED) {
    redirect('/dashboard');
  }

  if (isLoading || !state) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const current = state.steps.find((s) => s.status === 'current');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          Método Finzup
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Os Baby Steps são o caminho oficial — um passo de cada vez. A ação acontece nas telas do
          app.
        </p>
      </div>

      <Card className="brand-gradient-border">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="brand-gradient-text text-xs font-bold uppercase tracking-wide">
              Você está aqui
            </p>
            <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Baby Step {state.currentStep}
              {current ? ` — ${current.title}` : ''}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Faça agora: {state.nextAction.label}
            </p>
            <div className="mt-2 flex max-w-xs items-center gap-3">
              <Progress value={state.progressPercent} className="h-2.5 [&>div]:brand-gradient-bg-r" />
              <span className="shrink-0 text-sm font-bold tabular-nums text-brand-600 dark:text-brand-400">
                {state.progressPercent}%
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={state.nextAction.href}>
                {state.nextAction.label}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            {state.nextAction.chatPrompt && (
              <Button
                variant="outline"
                onClick={() => openAssistant({ query: state.nextAction.chatPrompt })}
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Pedir plano à IA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Jornada dos 6 passos
        </h2>
        {state.steps.map((step) => (
          <div
            key={step.step}
            className={cn(
              'flex gap-3 rounded-2xl border p-4',
              step.status === 'current' &&
                'brand-gradient-border shadow-sm dark:shadow-lg dark:shadow-brand-500/10',
              step.status === 'completed' &&
                'border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]',
              step.status === 'locked' &&
                'border-slate-200 bg-slate-50/50 opacity-75 dark:border-white/[0.06] dark:bg-white/[0.02] dark:opacity-60',
            )}
          >
            <div className="shrink-0">
              {step.status === 'completed' && (
                <span className="icon-chip bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              )}
              {step.status === 'current' && (
                <span className="icon-chip brand-gradient-bg text-sm font-bold text-white shadow-sm">
                  {step.step}
                </span>
              )}
              {step.status === 'locked' && (
                <span className="icon-chip bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Passo {step.step}: {step.shortTitle}
                </p>
                {step.status === 'current' && (
                  <span className="brand-gradient-bg rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Atual
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
              {step.status === 'current' && (
                <Progress
                  value={step.progressPercent}
                  className="mt-2 max-w-sm [&>div]:brand-gradient-bg-r"
                />
              )}
              {step.status === 'locked' && (
                <p className="text-xs text-slate-500">
                  Desbloqueia após concluir o passo atual — o método não pula etapas.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {state.blockers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">O que ainda trava o avanço</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {state.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Onde fazer cada parte</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <Link
            href="/dashboard/investimentos?tab=reserva"
            className="rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
          >
            <p className="font-medium text-slate-900 dark:text-white">Reserva de emergência</p>
            <p className="text-slate-500 dark:text-slate-400">Investimentos → Reserva</p>
          </Link>
          <Link
            href="/dashboard/despesas"
            className="rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
          >
            <p className="font-medium text-slate-900 dark:text-white">Bola de neve de dívidas</p>
            <p className="text-slate-500 dark:text-slate-400">Despesas (quando houver dívidas)</p>
          </Link>
          <Link
            href="/dashboard/investimentos?tab=casa"
            className="rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
          >
            <p className="font-medium text-slate-900 dark:text-white">Entrada da casa</p>
            <p className="text-slate-500 dark:text-slate-400">Investimentos → Casa</p>
          </Link>
          <Link
            href="/dashboard/investimentos?tab=aportes"
            className="rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
          >
            <p className="font-medium text-slate-900 dark:text-white">Investir 15%</p>
            <p className="text-slate-500 dark:text-slate-400">Investimentos → Aportes</p>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Princípios (valem em todos os passos)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
            Dízimo: {state.metrics.tithePercentOfIncome.toFixed(1)}% da renda (meta 10%)
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
            Investir: {state.metrics.investmentPercentOfIncome.toFixed(1)}% da renda (meta ≥15%)
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04] sm:col-span-2">
            Lazer 10% e sem cartão de crédito — pilares do método em qualquer fase.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
