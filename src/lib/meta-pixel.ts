import { BILLING_PLANS, type BillingPlanId } from '@/constants/billing-plans';

export type MetaEventParams = Record<string, unknown>;

interface MetaEventOptions {
  eventId?: string;
}

export interface MetaPurchase {
  eventId: string;
  currency: 'BRL';
  value: number;
  plan: BillingPlanId;
  paymentMethod: 'pix' | 'credit_card';
  chargeMode: 'recurrent' | 'installment';
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PURCHASE_STORAGE_KEY = 'finzup:meta:purchase-event-ids';
const MAX_STORED_PURCHASES = 100;
const META_TRACKING_PATHS = new Set(['/']);
const SENSITIVE_QUERY_PARAMS = new Set([
  'token',
  'email',
  'session_id',
  'orderid',
  'client_secret',
  'code',
]);

export function isMetaTrackingAllowed(pathname?: string) {
  if (typeof window === 'undefined' && !pathname) return false;
  return META_TRACKING_PATHS.has(pathname ?? window.location.pathname);
}

export function prepareMetaTrackingUrl(pathname?: string) {
  if (typeof window === 'undefined' || !isMetaTrackingAllowed(pathname)) return false;

  const url = new URL(window.location.href);
  let changed = false;

  for (const key of [...url.searchParams.keys()]) {
    if (!SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) continue;
    url.searchParams.delete(key);
    changed = true;
  }

  if (changed) {
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  return true;
}

function track(
  command: 'track' | 'trackCustom',
  event: string,
  params?: MetaEventParams,
  options?: MetaEventOptions,
) {
  if (
    typeof window === 'undefined' ||
    !isMetaTrackingAllowed() ||
    !window.fbq
  ) {
    return false;
  }

  const eventOptions = options?.eventId ? { eventID: options.eventId } : undefined;
  window.fbq(command, event, params ?? {}, eventOptions);
  return true;
}

export function trackMetaEvent(
  event: string,
  params?: MetaEventParams,
  options?: MetaEventOptions,
) {
  return track('track', event, params, options);
}

export function trackMetaCustomEvent(
  event: string,
  params?: MetaEventParams,
  options?: MetaEventOptions,
) {
  return track('trackCustom', event, params, options);
}

function getTrackedPurchaseIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(PURCHASE_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

export function trackPurchase(purchase: MetaPurchase) {
  const { eventId } = purchase;
  if (!eventId || getTrackedPurchaseIds().includes(eventId)) return false;
  const orderId = eventId.replace(/^finzup_purchase_/, '');
  const params = {
    ...getPlanParams(purchase.plan),
    currency: purchase.currency,
    value: purchase.value,
    order_id: orderId,
    plan: purchase.plan,
    payment_method: purchase.paymentMethod,
    charge_mode: purchase.chargeMode,
  };
  if (!trackMetaEvent('Purchase', params, { eventId })) return false;

  try {
    const ids = [...getTrackedPurchaseIds(), eventId].slice(-MAX_STORED_PURCHASES);
    window.localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // O evento ainda é enviado quando o storage está indisponível.
  }

  return true;
}

/** Dispara conversão após cadastro concluído com sucesso. */
export function trackRegistrationComplete() {
  trackMetaEvent('CompleteRegistration', {
    status: 'completed',
    content_name: 'Cadastro Finzup',
  });
}

/** Dispara ao iniciar o checkout. */
export function trackInitiateCheckout(planId: BillingPlanId) {
  trackMetaEvent('InitiateCheckout', getPlanParams(planId));
}

export function trackPricingView() {
  trackMetaEvent('ViewContent', {
    content_ids: Object.keys(BILLING_PLANS).map((planId) => `finzup_${planId}`),
    content_type: 'product_group',
  });
}

function getPlanParams(planId: BillingPlanId): MetaEventParams {
  const plan = BILLING_PLANS[planId];
  return {
    content_ids: [`finzup_${plan.id}`],
    content_type: 'product',
    content_name: `Finzup - Plano ${plan.label}`,
    currency: 'BRL',
    value: plan.total,
    num_items: 1,
  };
}
