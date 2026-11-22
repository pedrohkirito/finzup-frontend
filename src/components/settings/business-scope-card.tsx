'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Briefcase } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Liga/desliga a separação PF/PJ. Desligar só esconde: nada é apagado. */
export function BusinessScopeCard() {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const enabled = !!user?.businessEnabled;
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me', { businessEnabled: !enabled });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <div className="icon-chip bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
            <Briefcase className="h-4 w-4" aria-hidden />
          </div>
          Finanças da empresa (PJ)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
            <p>
              Separe o que é pessoal (PF) do que é da empresa (PJ). Cada lançamento ganha a opção PF/PJ e a visão
              geral, os relatórios e o fluxo de caixa mostram PF, PJ ou o consolidado.
            </p>
            {enabled && (
              <p className="text-xs">
                Desligar só esconde a opção: os lançamentos PJ continuam salvos e contando no consolidado.
              </p>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Separar finanças PF e PJ"
            disabled={saving || !user}
            onClick={toggle}
            className={cn(
              'relative mt-0.5 inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50',
              enabled ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-slate-200 dark:bg-white/[0.12]',
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
                enabled ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
