'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Lock, ShieldCheck } from 'lucide-react';
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout';
import { Button } from '@/components/ui/button';
import { CheckoutPlanSummary } from '@/components/billing/checkout-plan-summary';
import { SupportLink } from '@/components/layout/support-link';
import { type BillingPlanId } from '@/constants/billing-plans';
import { stripePromise } from '@/lib/stripe';

const checkoutAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#03b6e6',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorDanger: '#ef4444',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '10px',
    spacingUnit: '3px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid #03b6e6',
      boxShadow: '0 0 0 1px #03b6e6',
    },
    '.Label': {
      fontWeight: '500',
    },
  },
};

interface SubscriptionCheckoutProps {
  clientSecret: string;
  planId: BillingPlanId;
  onBack: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
  stepLabel?: string;
}

function SubscriptionCheckoutForm({
  planId,
  onBack,
  onSuccess,
  onError,
  stepLabel = 'Passo 2 de 2',
}: Omit<SubscriptionCheckoutProps, 'clientSecret'>) {
  const checkoutState = useCheckoutElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (checkoutState.type === 'loading') {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Preparando checkout seguro...</p>
      </div>
    );
  }

  if (checkoutState.type === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
        {checkoutState.error.message}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const confirmResult = await checkoutState.checkout.confirm({ redirect: 'if_required' });

    if (confirmResult.type === 'error') {
      onError(confirmResult.error.message);
      setIsSubmitting(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar e escolher outro plano
        </button>

        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-emerald-600 uppercase">
            {stepLabel}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Finalize sua assinatura
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
            Pagamento seguro via Stripe. A cobrança do plano escolhido é feita hoje.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <CheckoutPlanSummary planId={planId} />
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
            <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-brand-50/40 px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-brand-950/20">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Pagamento 100% seguro</p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  Processado pela Stripe, líder mundial em pagamentos online. Seus dados de cartão
                  nunca passam pelos nossos servidores.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <PaymentElement />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-500 py-6 text-base font-semibold shadow-lg shadow-brand-200/60 hover:bg-brand-600 hover:shadow-brand-300/50 dark:shadow-brand-900/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando com segurança...
              </>
            ) : (
              'Confirmar assinatura'
            )}
          </Button>

          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-brand-green-600" />
                Conexão criptografada
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-green-600" />
                PCI DSS via Stripe
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Ao continuar, você concorda com a cobrança recorrente do plano escolhido.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <SupportLink variant="header" className="text-slate-600" />
          </div>
        </div>
      </div>
    </form>
  );
}

export function SubscriptionCheckout({
  clientSecret,
  planId,
  onBack,
  onSuccess,
  onError,
  stepLabel,
}: SubscriptionCheckoutProps) {
  if (!stripePromise) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Chave pública do Stripe não configurada. Defina NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </div>
    );
  }

  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: { appearance: checkoutAppearance },
      }}
    >
      <SubscriptionCheckoutForm
        planId={planId}
        onBack={onBack}
        onSuccess={onSuccess}
        onError={onError}
        stepLabel={stepLabel}
      />
    </CheckoutElementsProvider>
  );
}
