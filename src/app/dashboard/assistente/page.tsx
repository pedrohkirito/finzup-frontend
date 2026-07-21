'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assistente IA</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pergunte sobre suas finanças com base nos dados da Finzup. Não é consultoria de investimentos.
          </p>
        </div>
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-right dark:border-brand-900 dark:bg-brand-950/40">
          <p className="text-xs text-slate-500 dark:text-slate-400">Créditos</p>
          <p className="text-lg font-bold text-brand-700 dark:text-brand-300">
            {user?.aiCredits?.balance ?? 0}
          </p>
        </div>
      </div>

      <AssistantChat initialQuery={initialQuery} />
    </div>
  );
}
