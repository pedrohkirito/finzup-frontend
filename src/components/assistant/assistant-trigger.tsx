'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAssistant } from '@/providers/assistant-provider';
import { cn } from '@/lib/utils';

type AssistantTriggerProps = {
  variant?: 'header' | 'fab';
  className?: string;
};

export function AssistantActivityMark({
  loading,
  unread,
  className,
}: {
  loading: boolean;
  unread: boolean;
  className?: string;
}) {
  if (!loading && !unread) return null;

  return (
    <span className={cn('absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5', className)}>
      <span
        className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-80',
          loading ? 'bg-white' : 'bg-brand-green-400',
        )}
      />
      <span
        className={cn(
          'relative inline-flex h-3.5 w-3.5 rounded-full',
          loading ? 'bg-white' : 'bg-brand-green-400',
        )}
      />
    </span>
  );
}

export function AssistantTrigger({ variant = 'header', className }: AssistantTriggerProps) {
  const { openAssistant, loading, unread } = useAssistant();
  const showUnread = unread && !loading;
  const label = loading ? 'Pensando…' : showUnread ? 'Nova resposta' : 'Assistente IA';

  if (variant === 'fab') {
    return (
      <button
        type="button"
        onClick={() => openAssistant()}
        className={cn(
          'brand-gradient-bg-r fixed z-50 hidden items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-brand-500/40 ring-2 ring-brand-300/40 transition-transform hover:scale-[1.03] hover:opacity-95 active:scale-[0.98] md:flex',
          'bottom-6 right-6',
          loading && 'ring-white/70',
          className,
        )}
        aria-label={loading ? 'Assistente pensando' : showUnread ? 'Assistente tem uma nova resposta' : 'Abrir assistente de IA'}
        aria-busy={loading}
      >
        {loading && (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-white/25" />
        )}
        {loading ? (
          <Loader2 className="relative h-5 w-5 shrink-0 animate-spin" />
        ) : (
          <Sparkles className="relative h-5 w-5 shrink-0" />
        )}
        <span className="relative">{label}</span>
        <AssistantActivityMark loading={loading} unread={showUnread} />
      </button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={() => openAssistant()}
      aria-busy={loading}
      className={cn(
        'brand-gradient-bg-r relative h-9 shrink-0 gap-1.5 px-3 font-semibold text-white shadow-md shadow-brand-500/25 hover:opacity-90 sm:h-10 sm:gap-2 sm:px-4',
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      <span className="text-xs sm:text-sm">{label}</span>
      <AssistantActivityMark loading={loading} unread={showUnread} />
    </Button>
  );
}
