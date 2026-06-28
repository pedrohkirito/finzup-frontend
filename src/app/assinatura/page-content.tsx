'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { PlanPicker } from '@/components/billing/plan-picker';
import { SubscriptionCheckout } from '@/components/billing/subscription-checkout';
import { Button } from '@/components/ui/button';
import { type BillingPlanId } from '@/constants/billing-plans';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import {
  trackCheckoutCanceled,
  trackInitiateCheckout,
  trackSubscriptionPageViewed,
  trackSubscriptionStarted,
} from '@/lib/funnel-analytics';

type CheckoutStep = 'plans' | 'checkout' | 'processing';

type CheckoutSessionResponse =
  | { mock: true }
  | { clientSecret: string; sessionId: string };

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
  const { data: user, isLoading, isError, refetch } = useAuth();

  const [step, setStep] = useState<CheckoutStep>('plans');
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanId | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<{
    clientSecret: string;
    sessionId: string;
  } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<BillingPlanId | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionIdParam = searchParams.get('session_id');
  const subscriptionPageTrackedRef = useRef(false);
  const processingStartedRef = useRef(false);

  const waitForAccess = useCallback(async () => {
    let attempts = 0;
    return new Promise<boolean>((resolve) => {
      const interval = setInterval(async () => {
        attempts += 1;
        const result = await refetch();
        if (result.data?.billing?.hasAccess) {
          clearInterval(interval);
          trackSubscriptionStarted(result.data.id, result.data.billing);
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

      if (sessionId) {
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
    if (!isLoading && user && !subscriptionPageTrackedRef.current) {
      subscriptionPageTrackedRef.current = true;
      trackSubscriptionPageViewed(user.billing?.trialExpired ?? false);
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace('/login');
    }
  }, [isLoading, isError, router]);

  useEffect(() => {
    if (!isLoading && user?.billing?.hasAccess) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!sessionIdParam || isLoading || !user || processingStartedRef.current) return;
    processingStartedRef.current = true;
    void startProcessing(sessionIdParam);
  }, [sessionIdParam, isLoading, user, startProcessing]);

  const handleSelectPlan = useCallback(
    async (plan: BillingPlanId) => {
      setErrorMessage(null);
      setCheckoutMessage(null);
      setLoadingPlan(plan);
      trackInitiateCheckout(plan);

      try {
        const data = await api.post<CheckoutSessionResponse>('/billing/checkout-session', { plan });

        if ('mock' in data) {
          setSelectedPlan(plan);
          await startProcessing();
          return;
        }

        setSelectedPlan(plan);
        setCheckoutSession({
          clientSecret: data.clientSecret,
          sessionId: data.sessionId,
        });
        setStep('checkout');
      } catch {
        setErrorMessage('Não foi possível iniciar o pagamento. Tente novamente.');
      } finally {
        setLoadingPlan(null);
      }
    },
    [startProcessing],
  );

  const handleCheckoutBack = useCallback(() => {
    trackCheckoutCanceled();
    setCheckoutSession(null);
    setSelectedPlan(null);
    setErrorMessage(null);
    setStep('plans');
  }, []);

  const handleCheckoutSuccess = useCallback(() => {
    void startProcessing(checkoutSession?.sessionId);
  }, [checkoutSession?.sessionId, startProcessing]);

  const handleCheckoutError = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
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

  if (step === 'checkout' && selectedPlan && checkoutSession) {
    return (
      <div className="space-y-6">
        {errorMessage && (
          <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            {errorMessage}
          </div>
        )}
        <SubscriptionCheckout
          clientSecret={checkoutSession.clientSecret}
          planId={selectedPlan}
          onBack={handleCheckoutBack}
          onSuccess={handleCheckoutSuccess}
          onError={handleCheckoutError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-xs font-semibold tracking-wide text-emerald-600 uppercase">
          Passo 3 de 3
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {trialExpired ? 'Sua assinatura expirou' : 'Escolha seu plano'}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Selecione um plano e pague com cartão. Acesso liberado após a confirmação.
        </p>
      </div>

      {checkoutMessage && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-200">
          {checkoutMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      <PlanPicker mode="subscribe" onSelectPlan={handleSelectPlan} loadingPlan={loadingPlan} compactHeader />

      <div className="flex justify-center border-t border-slate-200 pt-8 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={() => logout()}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
