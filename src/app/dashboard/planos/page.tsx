'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Crown, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PlanCatalogGrid } from '@/components/billing/plan-catalog';
import { UpgradeDialog } from '@/components/billing/upgrade-dialog';
import { BillingHistoryCard } from '@/components/billing/billing-history';
import { useAuth } from '@/hooks/use-auth';
import { PLAN_QUERY_KEYS, useMyPlan, usePlanCatalog } from '@/hooks/use-plan';
import { api } from '@/lib/api';
import type { PlanCatalogEntry, PlanCycle, UpgradeStatus } from '@/types';

function PlanosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const { data: catalog, isPending } = usePlanCatalog();
  const { data: myPlan } = useMyPlan();
  const [choice, setChoice] = useState<{ plan: PlanCatalogEntry; cycle: PlanCycle } | null>(null);
  const [returnMessage, setReturnMessage] = useState<string | null>(() => {
    const result = searchParams.get('upgrade');
    if (!result) return null;
    if (result === 'success' && searchParams.get('orderId')) return 'Confirmando seu pagamento…';
    return result === 'expired' ? 'O pagamento expirou. Tente de novo.' : 'Pagamento não concluído.';
  });
  const handledReturn = useRef(false);

  // Volta do checkout de cartão do Asaas: confirma o pagamento e libera o plano.
  useEffect(() => {
    const result = searchParams.get('upgrade');
    const orderId = searchParams.get('orderId');
    if (result !== 'success' || !orderId || handledReturn.current) return;
    handledReturn.current = true;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const status = await api.get<UpgradeStatus>(`/billing/upgrade/${orderId}/status`);
        if (status.status === 'paid') {
          clearInterval(interval);
          await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
          await queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.myPlan });
          await queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.history });
          setReturnMessage('Pagamento confirmado. Seu novo plano já está liberado!');
          router.replace('/dashboard/planos');
        } else if (attempts >= 30) {
          clearInterval(interval);
          setReturnMessage('O pagamento ainda está em processamento. Atualize a página em alguns minutos.');
        }
      } catch {
        // tenta de novo
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [searchParams, queryClient, router]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Crown className="h-6 w-6 text-amber-500" aria-hidden /> Planos
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {myPlan ? (
            <>
              Você está no <strong className="text-slate-900 dark:text-white">{myPlan.planName}</strong>
              {myPlan.cycle ? ` (${myPlan.cycle === 'annual' ? 'anual' : 'mensal'})` : ''}.
            </>
          ) : (
            'Escolha o plano ideal para você.'
          )}
        </p>
      </div>

      {returnMessage && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200">
          {returnMessage}
        </div>
      )}

      {isPending || !catalog ? (
        <Card>
          <CardContent className="flex items-center gap-2 p-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando planos…
          </CardContent>
        </Card>
      ) : (
        <PlanCatalogGrid
          catalog={catalog}
          currentTier={myPlan?.effectiveTier}
          currentCycle={myPlan?.cycle}
          onChoose={(plan, cycle) => setChoice({ plan, cycle })}
        />
      )}

      <BillingHistoryCard />

      <UpgradeDialog
        key={choice ? `${choice.plan.tier}-${choice.cycle}` : 'none'}
        open={!!choice}
        onOpenChange={(open) => !open && setChoice(null)}
        plan={choice?.plan ?? null}
        cycle={choice?.cycle ?? 'monthly'}
        needsTaxId={!user?.cpf}
      />
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={null}>
      <PlanosContent />
    </Suspense>
  );
}
