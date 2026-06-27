import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const UTM_REGISTERED_KEY = 'finzup_mixpanel_utms_registered';
const USER_ID_KEY = 'finzup_mixpanel_user_id';
const ALIASED_USER_KEY = 'finzup_mixpanel_aliased_user';

let initialized = false;

function isEnabled() {
  return typeof window !== 'undefined' && Boolean(MIXPANEL_TOKEN);
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage indisponível
  }
}

function removeStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage indisponível
  }
}

export function getKnownUserId(): string | null {
  return readStorage(USER_ID_KEY);
}

export function initMixpanel() {
  if (!isEnabled() || initialized) return;
  mixpanel.init(MIXPANEL_TOKEN!, {
    track_pageview: false,
    persistence: 'localStorage',
  });
  initialized = true;
  registerUtmSuperProperties();

  const userId = getKnownUserId();
  if (userId) {
    mixpanel.identify(userId);
    registerSuperProperties({ user_id: userId });
  }
}

export function setKnownUserId(
  userId: string,
  traits?: { email?: string; name?: string },
  options?: { linkAnonymous?: boolean },
) {
  if (!isEnabled()) return;
  initMixpanel();

  const currentId = mixpanel.get_distinct_id();
  const alreadyAliased = readStorage(ALIASED_USER_KEY) === userId;

  if (options?.linkAnonymous && currentId !== userId && !alreadyAliased) {
    mixpanel.alias(userId);
    writeStorage(ALIASED_USER_KEY, userId);
  }

  mixpanel.identify(userId);
  writeStorage(USER_ID_KEY, userId);
  registerSuperProperties({ user_id: userId });

  if (traits) {
    mixpanel.people.set({
      ...(traits.email ? { $email: traits.email } : {}),
      ...(traits.name ? { $name: traits.name } : {}),
    });
  }
}

/** @deprecated Use setKnownUserId */
export function identifyUser(userId: string, traits?: { email?: string; name?: string }) {
  setKnownUserId(userId, traits);
}

export function trackMixpanelEvent(name: string, props?: Record<string, unknown>) {
  if (!isEnabled()) return;
  initMixpanel();

  const userId = getKnownUserId();
  if (userId && mixpanel.get_distinct_id() !== userId) {
    mixpanel.identify(userId);
  }

  mixpanel.track(name, {
    ...props,
    ...(userId ? { user_id: userId } : {}),
  });
}

export function registerSuperProperties(props: Record<string, unknown>) {
  if (!isEnabled()) return;
  initMixpanel();
  mixpanel.register(props);
}

export function resetMixpanel() {
  if (!isEnabled()) return;
  mixpanel.reset();
  removeStorage(USER_ID_KEY);
  removeStorage(ALIASED_USER_KEY);
  initialized = false;
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
