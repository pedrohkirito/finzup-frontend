import { BILLING_PLANS, type BillingPlanId } from '@/constants/billing-plans';
import { getKnownUserId, trackMixpanelEvent } from '@/lib/mixpanel';
import {
  trackMetaCustomEvent,
  trackInitiateCheckout as trackMetaInitiateCheckout,
  trackRegistrationComplete as trackMetaRegistrationComplete,
} from '@/lib/meta-pixel';

export interface LandingCtaClick {
  ctaLocation: string;
  ctaLabel: string;
  action: 'open_checkout' | 'scroll_to_pricing' | 'register';
  planId?: BillingPlanId;
}

export function trackLandingCtaClick({
  ctaLocation,
  ctaLabel,
  action,
  planId,
}: LandingCtaClick) {
  const params = {
    cta_location: ctaLocation,
    cta_label: ctaLabel,
    action,
    ...(planId ? { plan_id: planId } : {}),
  };

  trackMetaCustomEvent('LandingCTAClick', params);
  trackMixpanelEvent('landing_cta_clicked', {
    content_name: ctaLabel,
    ...params,
    ...(planId ? { plan: planId } : {}),
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
  const userId = getKnownUserId();
  trackMixpanelEvent('email_verified', {
    source: 'client',
    ...(userId ? { $insert_id: `email_verified_${userId}` } : {}),
  });
}

export function trackVerificationEmailResent() {
  trackMixpanelEvent('verification_email_resent');
}

export function trackVerifyEmailPollSuccess() {
  trackMixpanelEvent('verify_email_poll_success');
}

export function trackVerifyEmailRedirectToLogin() {
  trackMixpanelEvent('verify_email_redirect_to_login');
}

export function trackGoogleAuthStarted(mode: 'login' | 'register') {
  trackMixpanelEvent('google_auth_started', { mode });
}

export function trackGoogleAuthCompleted(mode: 'login' | 'register') {
  trackMixpanelEvent('google_auth_completed', { mode });
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

export function trackLandingCheckoutModalOpened(plan: BillingPlanId) {
  trackMixpanelEvent('landing_checkout_modal_opened', {
    initial_plan: plan,
  });
}

export function trackLandingCheckoutAccountCreated(plan: BillingPlanId) {
  const planConfig = BILLING_PLANS[plan];
  trackMixpanelEvent('landing_checkout_account_created', {
    plan,
    plan_label: planConfig.label,
  });
}
