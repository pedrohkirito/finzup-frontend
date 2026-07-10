'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { SimulationProjection } from '@/types';
import { Target, TrendingUp, Wallet } from 'lucide-react';

export function SimulationGoalCard({
  projection,
  goalAmount,
}: {
  projection: SimulationProjection;
  goalAmount: number | null;
}) {
  const hasGoal = goalAmount !== null && goalAmount > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {hasGoal && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
              <Target className="h-4 w-4" />
              Tempo para a meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projection.goalReachedLabel ? (
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {projection.goalReachedLabel}
              </p>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Meta de {formatCurrency(goalAmount)} não é atingida em 30 anos com este plano.
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">Meta: {formatCurrency(goalAmount)}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            Patrimônio em 30 anos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatCurrency(projection.finalBalance)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4 text-slate-500" />
            Total aportado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatCurrency(projection.totalContributed)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Juros acumulados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-emerald-600">
            {formatCurrency(projection.totalInterest)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
