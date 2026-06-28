export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AssistantChatSession = {
  messages: ChatMessage[];
  input: string;
  flowStarted: boolean;
  lastAwaitingConfirmation: boolean;
  error: string | null;
};

const sessions = new Map<string, AssistantChatSession>();

function createEmptySession(): AssistantChatSession {
  return {
    messages: [],
    input: '',
    flowStarted: false,
    lastAwaitingConfirmation: false,
    error: null,
  };
}

export function getAssistantChatSessionKey(
  pathname: string,
  monthId: string | null | undefined,
) {
  return `${pathname}:${monthId ?? 'none'}`;
}

export function readAssistantChatSession(key: string): AssistantChatSession {
  const existing = sessions.get(key);
  if (existing) return existing;

  const fresh = createEmptySession();
  sessions.set(key, fresh);
  return fresh;
}

export function writeAssistantChatSession(
  key: string,
  patch: Partial<AssistantChatSession>,
) {
  const session = readAssistantChatSession(key);
  Object.assign(session, patch);
}
