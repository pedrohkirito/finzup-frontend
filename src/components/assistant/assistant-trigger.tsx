'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAssistant } from '@/providers/assistant-provider';
import { cn } from '@/lib/utils';

type AssistantTriggerProps = {
  variant?: 'header' | 'fab';
  className?: string;
};

export function AssistantTrigger({ variant = 'header', className }: AssistantTriggerProps) {
  const { openAssistant } = useAssistant();

  if (variant === 'fab') {
    return (
      <button
        type="button"
        onClick={() => openAssistant()}
        className={cn(
          'brand-gradient-bg-r fixed z-50 hidden items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-brand-500/40 ring-2 ring-brand-300/40 transition-transform hover:scale-[1.03] hover:opacity-95 active:scale-[0.98] md:flex',
          'bottom-6 right-6',
          className,
        )}
        aria-label="Abrir assistente de IA"
      >
        <Sparkles className="h-5 w-5 shrink-0" />
        <span>Assistente IA</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={() => openAssistant()}
      className={cn(
        'brand-gradient-bg-r h-9 shrink-0 gap-1.5 px-3 font-semibold text-white shadow-md shadow-brand-500/25 hover:opacity-90 sm:h-10 sm:gap-2 sm:px-4',
        className,
      )}
    >
      <Sparkles className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Assistente IA</span>
    </Button>
  );
}
