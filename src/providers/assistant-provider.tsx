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
          <DialogHeader className="shrink-0 border-b border-slate-200 px-4 py-3 pr-12 text-left dark:border-slate-800">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-brand-500" />
              Assistente IA
            </DialogTitle>
            <DialogDescription className="sr-only">
              Chat com assistente de IA do Finzup para a página {pageContext.label}
            </DialogDescription>
            <p className="mt-0.5 text-xs text-slate-500" aria-hidden>
              Contexto: {pageContext.label}
              {credits !== null && ` · ${credits} créditos`}
            </p>
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
