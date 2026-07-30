'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { AssistantChat } from '@/components/assistant/assistant-chat';
import { AssistantTrigger } from '@/components/assistant/assistant-trigger';
import { AssistantPanelContent } from '@/components/assistant/assistant-panel-content';
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAssistantPageContext } from '@/lib/assistant-page-context';

type OpenAssistantOptions = {
  query?: string;
};

type AssistantContextValue = {
  open: boolean;
  openAssistant: (options?: OpenAssistantOptions) => void;
  closeAssistant: () => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error('useAssistant must be used within AssistantProvider');
  }
  return ctx;
}

export function useAssistantOptional() {
  return useContext(AssistantContext);
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageContext = getAssistantPageContext(pathname);
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [credits, setCredits] = useState<number | null>(null);

  const hideFab = pathname === '/dashboard/assistente';

  const openAssistant = useCallback((options?: OpenAssistantOptions) => {
    setInitialQuery(options?.query ?? '');
    setOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, openAssistant, closeAssistant }),
    [open, openAssistant, closeAssistant],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}

      {!hideFab && <AssistantTrigger variant="fab" />}

      <Dialog open={open} onOpenChange={setOpen}>
        <AssistantPanelContent>
          <DialogHeader className="relative shrink-0 border-b border-white/[0.08] px-4 py-3.5 pr-12 text-left sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="flex items-center gap-3 text-base font-semibold text-white">
                <div className="brand-gradient-bg relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md shadow-brand-500/30">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-brand-green-400" />
                </div>
                <span className="min-w-0 leading-tight">
                  Finzup Assistente
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-normal text-brand-green-400">
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-brand-green-400" />
                    <span className="truncate">
                      Online · {pageContext.label}
                      {credits !== null && ` · ${credits} créditos`}
                    </span>
                  </span>
                </span>
              </DialogTitle>
              <span className="mr-6 hidden shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase sm:inline">
                Seus dados
              </span>
            </div>
            <DialogDescription className="sr-only">
              Chat com assistente de IA da Finzup para a página {pageContext.label}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <AssistantChat
              initialQuery={initialQuery}
              compact
              active={open}
              onCreditsChange={setCredits}
            />
          </div>
        </AssistantPanelContent>
      </Dialog>
    </AssistantContext.Provider>
  );
}
