import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const UTM_REGISTERED_KEY = 'finzup_mixpanel_utms_registered';

let initialized = false;

function isEnabled() {
  return typeof window !== 'undefined' && Boolean(MIXPANEL_TOKEN);
}

export function initMixpanel() {
  if (!isEnabled() || initialized) return;
  mixpanel.init(MIXPANEL_TOKEN!, {
    track_pageview: false,
    persistence: 'localStorage',
  });
  initialized = true;
  registerUtmSuperProperties();
}

export function trackMixpanelEvent(name: string, props?: Record<string, unknown>) {
  if (!isEnabled()) return;
  initMixpanel();
  mixpanel.track(name, props);
}

export function identifyUser(userId: string, traits?: { email?: string; name?: string }) {
  if (!isEnabled()) return;
  initMixpanel();
  mixpanel.identify(userId);
  if (traits) {
    mixpanel.people.set({
      ...(traits.email ? { $email: traits.email } : {}),
      ...(traits.name ? { $name: traits.name } : {}),
    });
  }
}

export function registerSuperProperties(props: Record<string, unknown>) {
  if (!isEnabled()) return;
  initMixpanel();
  mixpanel.register(props);
}

export function resetMixpanel() {
  if (!isEnabled()) return;
  mixpanel.reset();
}

function registerUtmSuperProperties() {
  try {
    if (sessionStorage.getItem(UTM_REGISTERED_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
    const utms: Record<string, string> = {};

    for (const key of utmKeys) {
      const value = params.get(key);
      if (value) utms[key] = value;
    }

    if (Object.keys(utms).length > 0) {
      registerSuperProperties(utms);
    }

    sessionStorage.setItem(UTM_REGISTERED_KEY, '1');
  } catch {
    // sessionStorage indisponível
  }
}
