'use client';

import { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatCurrency, cn } from '@/lib/utils';
import type { FinancialPlan, PlanSummary } from '@/types';

interface PlanComparisonProps {
  plans: FinancialPlan[];
}

const MAX_COMPARE = 3;

export function PlanComparison({ plans }: PlanComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    plans.slice(0, Math.min(2, plans.length)).map((p) => p.id),
  );

  useEffect(() => {
    setSelectedIds((current) => {
      const valid = current.filter((id) => plans.some((p) => p.id === id));
      if (valid.length >= 2) return valid;
      return plans.slice(0, Math.min(2, plans.length)).map((p) => p.id);
    });
  }, [plans]);

  const summaries = useQueries({
    queries: selectedIds.map((id) => ({
      queryKey: ['plans', id, 'summary'],
      queryFn: () => api.get<PlanSummary>(`/plans/${id}/summary`),
      enabled: !!id,
    })),
  });

  if (plans.length < 2) return null;

  const togglePlan = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((x) => x !== id);
      }
      if (current.length >= MAX_COMPARE) {
        return [...current.slice(1), id];
      }
      return [...current, id];
    });
  };

  type Row = {
    label: string;
    getValue: (summary: PlanSummary) => string;
    highlightBalance?: boolean;
  };

  const rows: Row[] = [
    { label: 'Receita', getValue: (s) => formatCurrency(s.totalIncome) },
    { label: 'Despesas', getValue: (s) => formatCurrency(s.totalExpenses) },
    { label: 'Doações', getValue: (s) => formatCurrency(s.totalDonations) },
    { label: 'Investimentos', getValue: (s) => formatCurrency(s.totalInvestments) },
    { label: 'Saldo', getValue: (s) => formatCurrency(s.balance), highlightBalance: true },
    { label: 'Taxa de poupança', getValue: (s) => `${(s.savingsRate * 100).toFixed(1)}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comparar cenários</CardTitle>
        <p className="text-sm text-slate-500">Selecione até {MAX_COMPARE} cenários para comparar lado a lado.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center gap-2">
              <Checkbox
                id={`compare-${plan.id}`}
                checked={selectedIds.includes(plan.id)}
                onCheckedChange={() => togglePlan(plan.id)}
              />
              <Label htmlFor={`compare-${plan.id}`} className="cursor-pointer text-sm">
                {plan.name}
              </Label>
            </div>
          ))}
        </div>

        {selectedIds.length >= 2 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08]">
                  <th className="py-2 pr-4 text-left font-medium text-slate-500 dark:text-slate-400">Métrica</th>
                  {selectedIds.map((id) => {
                    const plan = plans.find((p) => p.id === id);
                    return (
                      <th key={id} className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                        {plan?.name}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 dark:border-white/[0.06]">
                    <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">{row.label}</td>
                    {selectedIds.map((id, index) => {
                      const summary = summaries[index]?.data;
                      if (!summary) {
                        return (
                          <td key={id} className="px-3 py-2.5 text-right text-slate-400">
                            —
                          </td>
                        );
                      }
                      return (
                        <td
                          key={id}
                          className={cn(
                            'px-3 py-2.5 text-right font-medium',
                            row.highlightBalance && summary.balance >= 0 && 'text-emerald-600 dark:text-emerald-400',
                            row.highlightBalance && summary.balance < 0 && 'text-red-600 dark:text-red-400',
                          )}
                        >
                          {row.getValue(summary)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
