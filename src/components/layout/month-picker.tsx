'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMonths, useMonthStore } from '@/hooks/use-month';
import { formatMonth } from '@/lib/utils';
import { useEffect } from 'react';

export function MonthPicker() {
  const { data: months } = useMonths();
  const { selectedMonthId, setSelectedMonthId } = useMonthStore();

  useEffect(() => {
    if (months?.length && !selectedMonthId) {
      const open = months.find((m) => m.status === 'open') || months[0];
      setSelectedMonthId(open.id);
    }
  }, [months, selectedMonthId, setSelectedMonthId]);

  const currentIndex = months?.findIndex((m) => m.id === selectedMonthId) ?? -1;
  const current = months?.[currentIndex];

  const goTo = (index: number) => {
    if (months && months[index]) setSelectedMonthId(months[index].id);
  };

  if (!current) return null;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" disabled={currentIndex <= 0} onClick={() => goTo(currentIndex - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[180px] text-center">
        <p className="font-semibold capitalize text-slate-900 dark:text-white">
          {formatMonth(current.year, current.month)}
        </p>
        {current.status === 'closed' && (
          <p className="text-xs text-slate-500">Mês fechado</p>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        disabled={!months || currentIndex >= months.length - 1}
        onClick={() => goTo(currentIndex + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
