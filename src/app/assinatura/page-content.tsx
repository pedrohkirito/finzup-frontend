'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { PlanCatalogGrid } from '@/components/billing/plan-catalog';
import { UpgradeDialog } from '@/components/billing/upgrade-dialog';
import { Button } from '@/components/ui/button';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { usePlanCatalog } from '@/hooks/use-plan';
import { api, ApiError } from '@/lib/api';
import type { PlanCatalogEntry, PlanCycle, UpgradeStatus } from '@/types';

type CheckoutStep = 'plans' | 'processing';

type CheckoutSessionStatus = {
  status: string;
  paymentStatus: string;
  subscriptionStatus: string | null;
};

const PROCESSING_MESSAGE = 'Confirmando seu pagamento...';
const PROCESSING_TIMEOUT_MESSAGE =
  'Pagamento em processamento. Atualize a página em alguns instantes ou entre em contato com o suporte.';

function isCheckoutComplete(status: CheckoutSessionStatus) {
  if (status.status === 'complete') return true;
  return status.subscriptionStatus === 'trialing' || status.subscriptionStatus === 'active';
}

export default function AssinaturaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const { data: user, isPending, isFetching, error, refetch } = useAuth();
  const sentToDashboard = useRef(false);
  const sessionExpired = error instanceof ApiError && error.status === 401;

  const { data: catalog } = usePlanCatalog();
  const [step, setStep] = useState<CheckoutStep>('plans');
  const [choice, setChoice] = useState<{ plan: PlanCatalogEntry; cycle: PlanCycle } | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    const result = searchParams.get('upgrade');
    if (result === 'expired') return 'O pagamento expirou. Tente de novo.';
    if (result === 'canceled') return 'Pagamento não concluído.';
    return null;
  });

  // session_id: retorno legado do Stripe. upgrade/orderId: retorno do checkout de cartão do Asaas.
  const sessionIdParam = searchParams.get('session_id');
  const upgradeParam = searchParams.get('upgrade');
  const orderIdParam = searchParams.get('orderId');
  const processingStartedRef = useRef(false);

  const waitForAccess = useCallback(async () => {
    let attempts = 0;
    return new Promise<boolean>((resolve) => {
      const interval = setInterval(async () => {
        attempts += 1;
        const result = await refetch();
        if (result.data?.billing?.hasAccess) {
          clearInterval(interval);
          queryClient.invalidateQueries();
          router.replace('/dashboard');
          resolve(true);
        } else if (attempts >= 15) {
          clearInterval(interval);
          setCheckoutMessage(PROCESSING_TIMEOUT_MESSAGE);
          setStep('plans');
          resolve(false);
        }
      }, 2000);
    });
  }, [queryClient, refetch, router]);

  const startProcessing = useCallback(
    async (sessionId?: string) => {
      setStep('processing');
      setCheckoutMessage(PROCESSING_MESSAGE);
      setErrorMessage(null);

      if (sessionId?.startsWith('asaas:')) {
        const orderId = sessionId.slice('asaas:'.length);
        let paid = false;
        for (let attempt = 0; attempt < 20 && !paid; attempt += 1) {
          try {
            const status = await api.get<UpgradeStatus>(`/billing/upgrade/${orderId}/status`);
            paid = status.status === 'paid';
            if (status.status === 'expired' || status.status === 'canceled') break;
          } catch {
            // tenta de novo
          }
          if (!paid) await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        if (!paid) {
          setCheckoutMessage(PROCESSING_TIMEOUT_MESSAGE);
          setStep('plans');
          return;
        }
      } else if (sessionId) {
        try {
          const status = await api.get<CheckoutSessionStatus>(
            `/billing/checkout-session/${sessionId}/status`,
          );
          if (!isCheckoutComplete(status)) {
            setCheckoutMessage(PROCESSING_TIMEOUT_MESSAGE);
            setStep('plans');
            return;
          }
        } catch {
          setErrorMessage('Não foi possível verificar o pagamento. Tente novamente.');
          setStep('plans');
          return;
        }
      }

      await waitForAccess();
    },
    [waitForAccess],
  );

  useEffect(() => {
    if (
      sessionExpired ||
      isPending ||
      isFetching ||
      !user?.billing?.hasAccess ||
      sentToDashboard.current
    ) {
      return;
    }
    sentToDashboard.current = true;
    router.replace('/dashboard');
  }, [sessionExpired, isPending, isFetching, user, router]);

  useEffect(() => {
    if (isPending || !user || processingStartedRef.current) return;
    const target = sessionIdParam ?? (upgradeParam === 'success' && orderIdParam ? `asaas:${orderIdParam}` : null);
    if (!target) return;
    const timer = setTimeout(() => {
      if (processingStartedRef.current) return;
      processingStartedRef.current = true;
      void startProcessing(target);
    }, 0);
    return () => clearTimeout(timer);
  }, [sessionIdParam, upgradeParam, orderIdParam, isPending, user, startProcessing]);

  if (isPending || !user) {
    const unauthorized = error instanceof ApiError && error.status === 401;
    if (!isPending && error && !unauthorized) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">Não foi possível carregar sua conta.</p>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const billing = user.billing;
  const hasAccess = billing?.hasAccess ?? false;
  const trialExpired = billing?.trialExpired ?? false;

  if (hasAccess) {
    return null;
  }

  if (step === 'processing') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
          {checkoutMessage ?? PROCESSING_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-xs font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
          Passo 3 de 3
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {trialExpired ? 'Sua assinatura expirou' : 'Escolha seu plano'}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Escolha o plano, pague com PIX ou cartão pelo Asaas e o acesso é liberado na confirmação.
        </p>
      </div>

      {checkoutMessage && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200">
          {checkoutMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {catalog ? (
        <PlanCatalogGrid
          catalog={catalog}
          tiers={['free', 'essencial', 'dono']}
          onChoose={(plan, cycle) => setChoice({ plan, cycle })}
        />
      ) : (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      )}

      <UpgradeDialog
        key={choice ? `${choice.plan.tier}-${choice.cycle}` : 'none'}
        open={!!choice}
        onOpenChange={(open) => !open && setChoice(null)}
        plan={choice?.plan ?? null}
        cycle={choice?.cycle ?? 'monthly'}
        needsTaxId={!user.cpf}
        returnTo="assinatura"
        onPaid={() => {
          setChoice(null);
          void startProcessing();
        }}
      />

      <div className="flex justify-center border-t border-slate-200 pt-8 dark:border-white/[0.08]">
        <Button type="button" variant="outline" onClick={() => logout()}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
