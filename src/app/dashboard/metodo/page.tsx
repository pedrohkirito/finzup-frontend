'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  CircleOff,
  SlidersHorizontal,
} from 'lucide-react';
import { MethodConfigCard } from '@/components/baby-steps/method-config-card';
import { formatCurrency } from '@/lib/utils';
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Método Finzup
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Um passo de cada vez, do seu jeito: as etapas e os princípios são opcionais e ajustáveis.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href="#configurar">
            <SlidersHorizontal className="h-4 w-4" /> Configurar
          </a>
        </Button>
      </div>

      <Card className="brand-gradient-border">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="brand-gradient-text text-xs font-bold uppercase tracking-wide">
              Você está aqui
            </p>
            <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {current ? `Baby Step ${current.step} — ${current.title}` : 'Nenhuma etapa ligada'}
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
          Jornada ({state.steps.filter((s) => s.enabled).length} de {state.steps.length} etapas ligadas)
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
              step.status === 'disabled' &&
                'border-dashed border-slate-200 opacity-60 dark:border-white/[0.08] dark:opacity-50',
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
              {step.status === 'disabled' && (
                <span className="icon-chip bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-500">
                  <CircleOff className="h-4 w-4" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Passo {step.step}: {step.status === 'disabled' ? step.shortTitle : step.title}
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
                  Desbloqueia após concluir o passo atual — o método não pula etapas ligadas.
                </p>
              )}
              {step.status === 'disabled' && (
                <p className="text-xs text-slate-500">
                  Desligada por você — o Método pula esta etapa.{' '}
                  <a href="#configurar" className="font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400">
                    Religar
                  </a>
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
            <p className="font-medium text-slate-900 dark:text-white">
              {state.metrics.investTargetPercent != null ? `Investir ${state.metrics.investTargetPercent}%` : 'Aportes'}
            </p>
            <p className="text-slate-500 dark:text-slate-400">Investimentos → Aportes</p>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Metas do mês</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sobre a renda pessoal de {formatCurrency(state.goals.income)}, com os princípios e etapas que você mantém ligados.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.goals.items.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma fatia fixa ligada: a renda inteira fica livre para o seu plano.</p>
          )}
          {state.goals.items.map((g) => {
            const done = g.key === 'tithe' ? state.metrics.donationsTotal : g.key === 'invest' ? state.metrics.totalInvested : null;
            const pct = done != null && g.amount > 0 ? Math.min(100, Math.round((done / g.amount) * 100)) : null;
            return (
              <div key={g.key} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {g.label} <span className="font-normal text-slate-500">· {g.percent}%</span>
                  </span>
                  <span className="tabular-nums text-slate-700 dark:text-slate-200">
                    {done != null ? `${formatCurrency(done)} de ` : ''}
                    {formatCurrency(g.amount)}
                  </span>
                </div>
                {pct != null && <Progress value={pct} className="h-1.5 [&>div]:brand-gradient-bg-r" />}
              </div>
            );
          })}
          <div className="flex items-baseline justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-white/[0.04]">
            <span className="text-slate-600 dark:text-slate-300">Livre para custo de vida e o resto do plano ({state.goals.freePercent}%)</span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatCurrency(state.goals.freeAmount)}</span>
          </div>
          {state.config.principles.some((p) => p.key === 'no_credit_card' && p.enabled) && (
            <p className="text-xs text-slate-500 dark:text-slate-400">Princípio ligado: não usar cartão de crédito.</p>
          )}
        </CardContent>
      </Card>

      <MethodConfigCard state={state} />
    </div>
  );
}
