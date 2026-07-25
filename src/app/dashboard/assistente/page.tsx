'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bot } from 'lucide-react';
import { AssistantChat } from '@/components/assistant/assistant-chat';
import { useAuth } from '@/hooks/use-auth';

export default function AssistentePage() {
  return (
    <Suspense fallback={null}>
      <AssistentePageContent />
    </Suspense>
  );
}

function AssistentePageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const { data: user } = useAuth();

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl" aria-hidden>
        <div className="absolute top-0 right-0 h-[360px] w-[360px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[280px] w-[280px] -translate-x-1/4 translate-y-1/4 rounded-full bg-brand-green-500/12 blur-3xl" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.07),rgba(255,255,255,0.02)),#020617] shadow-[0_30px_80px_-40px_rgba(3,182,230,0.45)]">
        <div className="relative border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
          <div className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-green-500 text-white shadow-md shadow-brand-500/30">
                <Bot className="h-4 w-4" aria-hidden />
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-brand-green-400" />
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-semibold text-white sm:text-base">Finzup Assistente</h1>
                <p className="flex items-center gap-1.5 text-[11px] text-brand-green-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green-400" />
                  Online · lê o seu mês agora
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase sm:inline">
                Seus dados
              </span>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-right">
                <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                  Créditos
                </p>
                <p className="text-sm font-bold text-white leading-none">
                  {user?.aiCredits?.balance ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <AssistantChat initialQuery={initialQuery} />
        </div>
      </div>
    </div>
  );
}
