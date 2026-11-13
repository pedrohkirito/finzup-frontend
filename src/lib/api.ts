const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SUBSCRIPTION_REDIRECT_KEY = 'finzup:subscription-redirect-at';
const REDIRECT_COOLDOWN_MS = 8_000;

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

type InternalRequestInit = RequestInit & {
  retryOnUnauthorized?: boolean;
};

let refreshInFlight: Promise<boolean> | null = null;
let loginRedirectStarted = false;
let subscriptionRedirectStarted = false;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isSessionExpiredError(body: ErrorBody) {
  const code = body.error?.code;
  if (code === 'SESSION_EXPIRED') return true;
  if (code !== 'UNAUTHORIZED') return false;
  const message = body.error?.message ?? '';
  return message === 'Não autorizado' || message.startsWith('Sessão expirada');
}

function redirectToLogin() {
  if (typeof window === 'undefined' || loginRedirectStarted) return;
  const path = window.location.pathname;
  if (!path.startsWith('/dashboard') && !path.startsWith('/assinatura')) return;
  loginRedirectStarted = true;
  window.location.replace('/login');
}

function redirectToSubscription() {
  if (typeof window === 'undefined' || subscriptionRedirectStarted) return;
  if (window.location.pathname.startsWith('/assinatura')) return;

  const now = Date.now();
  try {
    const last = Number(sessionStorage.getItem(SUBSCRIPTION_REDIRECT_KEY) || 0);
    if (now - last < REDIRECT_COOLDOWN_MS) return;
    sessionStorage.setItem(SUBSCRIPTION_REDIRECT_KEY, String(now));
  } catch {
    // sessionStorage indisponível: a trava em memória evita a rajada nesta aba
  }

  subscriptionRedirectStarted = true;
  window.location.replace('/assinatura');
}

function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

async function request<T>(path: string, options: InternalRequestInit = {}): Promise<T> {
  const { retryOnUnauthorized = true, ...fetchOptions } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  const json = (await res.json().catch(() => ({}))) as ErrorBody & { data?: T };

  if (!res.ok) {
    const sessionExpired = isSessionExpiredError(json);

    if (sessionExpired && retryOnUnauthorized && !path.startsWith('/auth/')) {
      const refreshed = await refreshSession();
      if (refreshed) {
        return request<T>(path, { ...options, retryOnUnauthorized: false });
      }
      redirectToLogin();
    } else if (sessionExpired && !retryOnUnauthorized) {
      redirectToLogin();
    }

    if (res.status === 402) {
      redirectToSubscription();
    }

    throw new ApiError(
      res.status,
      json.error?.code || 'UNKNOWN',
      json.error?.message || 'Erro na requisição',
      json.error,
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
