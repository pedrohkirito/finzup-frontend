import type { PageKey } from '@/lib/assistant-page-context';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  /** Pedido completo enviado ao modelo quando a bolha mostra um rótulo curto. */
  prompt?: string;
};

export type AssistantChatSession = {
  messages: ChatMessage[];
  input: string;
  suggestionsHiddenForPage: PageKey | null;
  lastAwaitingConfirmation: boolean;
  error: string | null;
  loading: boolean;
  unread: boolean;
};

export type AssistantStatus = {
  loading: boolean;
  unread: boolean;
  credits: number | null;
};

const listeners = new Set<() => void>();
const statusListeners = new Set<() => void>();

function createEmptySession(): AssistantChatSession {
  return {
    messages: [],
    input: '',
    suggestionsHiddenForPage: null,
    lastAwaitingConfirmation: false,
    error: null,
    loading: false,
    unread: false,
  };
}

let session = createEmptySession();
let status: AssistantStatus = { loading: false, unread: false, credits: null };
const serverSession = createEmptySession();
const serverStatus: AssistantStatus = { loading: false, unread: false, credits: null };

let requestSeq = 0;

type AssistantSurface = {
  panelOpen: boolean;
  pathname: string;
};

let surface: AssistantSurface = { panelOpen: false, pathname: '' };

export function setAssistantSurface(next: AssistantSurface) {
  surface = next;
}

export function assistantReplyShouldNotify() {
  return !surface.panelOpen && surface.pathname !== '/dashboard/assistente';
}

export function subscribeAssistantChatSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAssistantChatSession() {
  return session;
}

export function getServerAssistantChatSession() {
  return serverSession;
}

export function subscribeAssistantStatus(listener: () => void) {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

export function getAssistantStatus() {
  return status;
}

export function getServerAssistantStatus() {
  return serverStatus;
}

function publishStatus(next: AssistantStatus) {
  if (
    next.loading === status.loading &&
    next.unread === status.unread &&
    next.credits === status.credits
  ) {
    return;
  }

  status = next;
  statusListeners.forEach((listener) => listener());
}

export function updateAssistantChatSession(patch: Partial<AssistantChatSession>) {
  session = { ...session, ...patch };
  listeners.forEach((listener) => listener());
  publishStatus({
    loading: session.loading,
    unread: session.unread,
    credits: status.credits,
  });
}

export function setAssistantCredits(credits: number) {
  publishStatus({ ...status, credits });
}

export function markAssistantSeen() {
  if (!session.unread) return;
  updateAssistantChatSession({ unread: false });
}

export function beginAssistantRequest() {
  requestSeq += 1;
  return requestSeq;
}

export function isAssistantRequestCurrent(id: number) {
  return id === requestSeq;
}

export function resetAssistantChatSession() {
  requestSeq += 1;
  session = createEmptySession();
  listeners.forEach((listener) => listener());
  publishStatus({ loading: false, unread: false, credits: null });
}
