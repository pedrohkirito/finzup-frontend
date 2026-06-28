import { BILLING_PLANS, type BillingPlanId } from '@/constants/billing-plans';
import type { UserBilling } from '@/types';

const START_TRIAL_STORAGE_KEY = 'finzup_meta_start_trial';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (params) {
    window.fbq?.('track', event, params);
    return;
  }
  window.fbq?.('track', event);
}

/** Dispara conversão após cadastro concluído com sucesso. */
export function trackRegistrationComplete() {
  trackMetaEvent('CompleteRegistration', {
    status: 'completed',
    content_name: 'Cadastro Finzup',
  });
}

/** Dispara ao clicar em um CTA da landing que leva ao cadastro. */
export function trackLead(contentName = 'Landing CTA') {
  trackMetaEvent('Lead', { content_name: contentName });
}

/** Dispara ao iniciar o checkout (redirecionamento para a Stripe). */
export function trackInitiateCheckout(planId: BillingPlanId) {
  trackMetaEvent('InitiateCheckout', getPlanParams(planId));
}

function hasTrackedStartTrial(userId: string): boolean {
  try {
    return sessionStorage.getItem(START_TRIAL_STORAGE_KEY) === userId;
  } catch {
    return false;
  }
}

function markStartTrialTracked(userId: string) {
  try {
    sessionStorage.setItem(START_TRIAL_STORAGE_KEY, userId);
  } catch {
    // sessionStorage indisponível (modo privado, etc.)
  }
}

function getPlanParams(planId: BillingPlanId | null) {
  if (!planId) return {};

  const plan = BILLING_PLANS[planId];
  return {
    content_name: plan.label,
    currency: 'BRL',
    value: 0,
    predicted_ltv: plan.total,
  };
}

/** Dispara conversão após assinatura confirmada (inclui início do teste gratuito). */
export function trackSubscriptionConversion(userId: string, billing: UserBilling) {
  if (!billing.hasAccess || hasTrackedStartTrial(userId)) return;

  const params = getPlanParams(billing.plan);

  if (billing.inTrial && billing.billingProvider === 'stripe') {
    trackMetaEvent('StartTrial', params);
  } else {
    trackMetaEvent('Subscribe', {
      ...params,
      value: billing.plan ? BILLING_PLANS[billing.plan].total : 0,
    });
  }

  markStartTrialTracked(userId);
}
