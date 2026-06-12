'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMonths, useMonthStore } from '@/hooks/use-month';
import { formatMonth } from '@/lib/utils';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function MonthPicker({ compact = false }: { compact?: boolean }) {
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
    <div className={cn('flex items-center gap-1.5 sm:gap-2', compact && 'shrink-0')}>
      <Button
        variant="outline"
        size="icon"
        className={cn(compact && 'h-8 w-8')}
        disabled={currentIndex <= 0}
        onClick={() => goTo(currentIndex - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className={cn('text-center', compact ? 'min-w-[7.5rem]' : 'min-w-[10rem] sm:min-w-[11rem]')}>
        <p className={cn('font-semibold capitalize text-slate-900 dark:text-white', compact ? 'text-sm' : 'text-base')}>
          {formatMonth(current.year, current.month)}
        </p>
        {current.status === 'closed' && (
          <p className="text-[10px] text-slate-500 sm:text-xs">Mês fechado</p>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className={cn(compact && 'h-8 w-8')}
        disabled={!months || currentIndex >= months.length - 1}
        onClick={() => goTo(currentIndex + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
