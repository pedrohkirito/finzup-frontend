'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { PlanPicker } from '@/components/billing/plan-picker';
import { Button } from '@/components/ui/button';
import { type BillingPlanId } from '@/constants/billing-plans';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { api } from '@/lib/api';

export default function AssinaturaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const { data: user, isLoading, isError, refetch } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<BillingPlanId | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkoutStatus = searchParams.get('checkout');

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace('/login');
    }
  }, [isLoading, isError, router]);

  useEffect(() => {
    if (!isLoading && user?.billing.hasAccess) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (checkoutStatus === 'canceled') {
      setCheckoutMessage('Cadastro cancelado. Escolha um plano para iniciar o teste gratuito.');
      return;
    }

    if (checkoutStatus !== 'success') return;

    setCheckoutMessage('Cartão cadastrado! Estamos ativando seu teste gratuito...');

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      const result = await refetch();
      if (result.data?.billing.hasAccess) {
        clearInterval(interval);
        queryClient.invalidateQueries();
        router.replace('/dashboard');
      } else if (attempts >= 15) {
        clearInterval(interval);
        setCheckoutMessage(
          'Pagamento em processamento. Atualize a página em alguns instantes ou entre em contato com o suporte.',
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [checkoutStatus, refetch, router, queryClient]);

  const handleSelectPlan = useCallback(async (plan: BillingPlanId) => {
    setErrorMessage(null);
    setCheckoutMessage(null);
    setLoadingPlan(plan);

    try {
      const { url } = await api.post<{ url: string }>('/billing/checkout-session', { plan });
      window.location.href = url;
    } catch {
      setErrorMessage('Não foi possível iniciar o pagamento. Tente novamente.');
      setLoadingPlan(null);
    }
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (user.billing.hasAccess) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user.billing.trialExpired ? 'Sua assinatura expirou' : 'Comece seu teste gratuito'}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Olá, {user.name.split(/\s+/)[0]}. Escolha um plano e cadastre o cartão — a cobrança só começa após{' '}
            {user.billing.trialDays} dias.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => logout()}>
          Sair da conta
        </Button>
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
    </div>
  );
}
