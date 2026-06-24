import { BILLING_PLANS, type BillingPlanId } from '@/constants/billing-plans';
import type { UserBilling } from '@/types';
import { trackMixpanelEvent } from '@/lib/mixpanel';
import {
  trackInitiateCheckout as trackMetaInitiateCheckout,
  trackLead as trackMetaLead,
  trackRegistrationComplete as trackMetaRegistrationComplete,
  trackSubscriptionConversion as trackMetaSubscriptionConversion,
} from '@/lib/meta-pixel';

export function trackLead(contentName = 'Landing CTA', extra?: { ctaLocation?: string; plan?: BillingPlanId }) {
  trackMetaLead(contentName);
  trackMixpanelEvent('landing_cta_clicked', {
    content_name: contentName,
    ...(extra?.ctaLocation ? { cta_location: extra.ctaLocation } : {}),
    ...(extra?.plan ? { plan: extra.plan } : {}),
  });
}

export function trackRegistrationStarted() {
  trackMixpanelEvent('registration_started');
}

export function trackRegistrationComplete(marketingOptIn: boolean) {
  trackMetaRegistrationComplete();
  trackMixpanelEvent('registration_completed', { marketing_opt_in: marketingOptIn });
}

export function trackVerifyEmailPageViewed(hasToken: boolean) {
  trackMixpanelEvent('verify_email_page_viewed', { has_token: hasToken });
}

export function trackEmailVerified() {
  trackMixpanelEvent('email_verified');
}

export function trackSubscriptionPageViewed(trialExpired: boolean) {
  trackMixpanelEvent('subscription_page_viewed', { trial_expired: trialExpired });
}

export function trackInitiateCheckout(planId: BillingPlanId) {
  trackMetaInitiateCheckout(planId);
  const plan = BILLING_PLANS[planId];
  trackMixpanelEvent('checkout_initiated', {
    plan: planId,
    plan_label: plan.label,
    value_brl: plan.total,
  });
}

export function trackCheckoutCanceled() {
  trackMixpanelEvent('checkout_canceled');
}

export function trackTrialStarted(userId: string, billing: UserBilling) {
  trackMetaSubscriptionConversion(userId, billing);

  if (!billing.hasAccess || !billing.inTrial) return;

  const plan = billing.plan ? BILLING_PLANS[billing.plan] : null;
  trackMixpanelEvent('trial_started', {
    plan: billing.plan,
    plan_label: plan?.label,
    source: 'client',
    $insert_id: `trial_started_${userId}`,
  });
}
