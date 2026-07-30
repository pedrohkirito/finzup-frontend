'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { SimulationYearProjection } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

function getCollapsedRows(yearly: SimulationYearProjection[]): SimulationYearProjection[] {
  const lastYear = yearly[yearly.length - 1]?.year;
  return yearly.filter(
    (row) => row.year <= 5 || row.year % 5 === 0 || row.year === lastYear,
  );
}

export function SimulationSummaryTable({ yearly }: { yearly: SimulationYearProjection[] }) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? yearly : getCollapsedRows(yearly);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Resumo ano a ano</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          className="text-slate-500"
        >
          {expanded ? (
            <>
              Menos detalhes <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Ver todos os anos <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
              <th className="pb-2 pr-4 font-medium">Ano</th>
              <th className="pb-2 pr-4 font-medium">Patrimônio</th>
              <th className="pb-2 pr-4 font-medium">Juros</th>
              <th className="pb-2 pr-4 font-medium">Total aportado</th>
              <th className="pb-2 pr-4 font-medium">Aporte/mês</th>
              <th className="pb-2 font-medium">Rentabilidade mensal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className="border-b border-slate-100 dark:border-slate-900">
                <td className="py-2 pr-4">{row.year}</td>
                <td className="py-2 pr-4 font-medium">{formatCurrency(row.balance)}</td>
                <td className="py-2 pr-4 text-emerald-600">{formatCurrency(row.interestEarned)}</td>
                <td className="py-2 pr-4">{formatCurrency(row.totalContributed)}</td>
                <td className="py-2 pr-4">{formatCurrency(row.monthlyContribution)}</td>
                <td className="py-2 text-emerald-600">{formatCurrency(row.monthlyInterest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
