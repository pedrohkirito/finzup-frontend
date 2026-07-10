'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, Sparkles, Check } from 'lucide-react';
import { AssistantMessage } from '@/components/assistant/assistant-message';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useMonthStore } from '@/hooks/use-month';
import { useMonthSummary } from '@/hooks/use-month-summary';
import { buildPageContextPayload } from '@/lib/assistant-page-context';
import {
  buildSnapshotFromSummary,
  buildAnotherSuggestionMessage,
  getPageFlow,
  invalidateQueriesAfterAiActions,
  resolvePageKey,
  type FlowIntent,
  type PageFlow,
  type PageSnapshot,
} from '@/lib/assistant-page-flows';
import { usePathname, useSearchParams } from 'next/navigation';
import { useInvestmentPageOptional } from '@/providers/investment-page-provider';
import {
  getInvestmentPageBridgeState,
  resolveInvestmentTabFromUrl,
  subscribeInvestmentPageBridgeState,
  syncInvestmentPageBridgeState,
} from '@/lib/investment-page-bridge';
import {
  getAssistantChatSessionKey,
  readAssistantChatSession,
  writeAssistantChatSession,
  type ChatMessage,
} from '@/lib/assistant-chat-session';

export type { ChatMessage };

type AssistantChatProps = {
  initialQuery?: string;
  compact?: boolean;
  active?: boolean;
  onCreditsChange?: (balance: number) => void;
};

export function AssistantChat({
  initialQuery = '',
  compact = false,
  active = true,
  onCreditsChange,
}: AssistantChatProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const investmentPage = useInvestmentPageOptional();
  const [investmentBridge, setInvestmentBridge] = useState(getInvestmentPageBridgeState);
  const { selectedMonthId } = useMonthStore();
  const { data: summary, isLoading: summaryLoading } = useMonthSummary(selectedMonthId);
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  const investmentTab =
    resolveInvestmentTabFromUrl(pathname, searchParams.get('tab')) ??
    investmentBridge.activeTab ??
    investmentPage.activeTab;
  const selectedSimulationId =
    investmentBridge.selectedSimulationId ?? investmentPage.selectedSimulationId;

  useEffect(() => subscribeInvestmentPageBridgeState(() => {
    setInvestmentBridge(getInvestmentPageBridgeState());
  }), []);

  const snapshot: PageSnapshot | null = summary
    ? buildSnapshotFromSummary(summary)
    : null;
  const pageFlow: PageFlow | null =
    snapshot !== null
      ? getPageFlow(pathname, snapshot, investmentTab)
      : null;
  const pageKey = resolvePageKey(pathname, investmentTab);
  const screen = buildPageContextPayload(pathname, {
    pageKey: pageKey === 'simulador_investimentos' ? 'simulador_investimentos' : undefined,
  });
  const sessionKey = getAssistantChatSessionKey(pathname, selectedMonthId);

  const [messages, setMessages] = useState<ChatMessage[]>(
    () => readAssistantChatSession(sessionKey).messages,
  );
  const [input, setInput] = useState(
    () => readAssistantChatSession(sessionKey).input || initialQuery,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    () => readAssistantChatSession(sessionKey).error,
  );
  const [credits, setCredits] = useState(user?.aiCredits?.balance ?? 0);
  const [flowStarted, setFlowStarted] = useState(
    () => readAssistantChatSession(sessionKey).flowStarted,
  );
  const [lastAwaitingConfirmation, setLastAwaitingConfirmation] = useState(
    () => readAssistantChatSession(sessionKey).lastAwaitingConfirmation,
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextPersistRef = useRef(false);

  useEffect(() => {
    const session = readAssistantChatSession(sessionKey);
    setMessages(session.messages);
    setInput(session.input);
    setFlowStarted(session.flowStarted);
    setLastAwaitingConfirmation(session.lastAwaitingConfirmation);
    setError(session.error);
    skipNextPersistRef.current = true;
  }, [sessionKey]);

  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    writeAssistantChatSession(sessionKey, {
      messages,
      input,
      flowStarted,
      lastAwaitingConfirmation,
      error,
    });
  }, [sessionKey, messages, input, flowStarted, lastAwaitingConfirmation, error]);

  useEffect(() => {
    if (!initialQuery) return;
    setInput(initialQuery);
    setFlowStarted(true);
  }, [initialQuery]);

  useEffect(() => {
    if (user?.aiCredits) {
      setCredits(user.aiCredits.balance);
      onCreditsChange?.(user.aiCredits.balance);
    }
  }, [user?.aiCredits, onCreditsChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!active || loading || credits <= 0) return;
    inputRef.current?.focus();
  }, [active, loading, messages, credits]);

  const sendToApi = async (
    text: string,
    currentMessages: ChatMessage[],
    flowIntent?: FlowIntent,
  ) => {
    if (credits <= 0) {
      setError('Seus créditos de IA acabaram. Eles renovam na próxima cobrança do plano.');
      return;
    }

    if (!selectedMonthId && !['configuracoes', 'generic', 'simulador_investimentos'].includes(pageKey)) {
      setError('Selecione um mês para continuar.');
      return;
    }

    setError(null);
    setLoading(true);

    const nextMessages: ChatMessage[] = [...currentMessages, { role: 'user', content: text }];

    try {
      const result = await api.post<{
        reply: string;
        creditsRemaining: number;
        creditsDebited: number;
        awaitingConfirmation?: boolean;
        actionsExecuted?: { type: string; name: string; amount?: number; simulationId?: string }[];
      }>('/ai/chat', {
        message: text,
        history: currentMessages,
        pageContext: screen.pageContext,
        pageLabel: screen.pageLabel,
        pageKey: screen.pageKey,
        monthId: selectedMonthId ?? undefined,
        simulationId: selectedSimulationId ?? undefined,
        pageSnapshot: snapshot ?? undefined,
        ...(flowIntent ? { flowIntent } : {}),
      });

      setMessages([...nextMessages, { role: 'assistant', content: result.reply }]);
      setLastAwaitingConfirmation(result.awaitingConfirmation ?? false);
      setCredits(result.creditsRemaining);
      onCreditsChange?.(result.creditsRemaining);

      if (result.actionsExecuted?.length) {
        const createdSimulation = result.actionsExecuted.find(
          (action) =>
            action.type === 'create_investment_simulation' ||
            action.type === 'update_investment_simulation',
        );

        if (createdSimulation?.simulationId) {
          syncInvestmentPageBridgeState({
            activeTab: 'simulador',
            selectedSimulationId: createdSimulation.simulationId,
          });
        }

        for (const key of invalidateQueriesAfterAiActions(pageKey, result.actionsExecuted)) {
          await queryClient.invalidateQueries({ queryKey: key, refetchType: 'all' });
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao enviar mensagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpeningAction = async (action: PageFlow['openingActions'][number]) => {
    if (action.intent === 'dismiss') {
      setFlowStarted(true);
      setMessages([
        {
          role: 'assistant',
          content: pageFlow?.suggestionAction
            ? `Ok! Se precisar, use **${pageFlow.suggestionAction.label}** ou digite sua pergunta abaixo.`
            : 'Ok! Se precisar, digite sua pergunta abaixo.',
        },
      ]);
      return;
    }

    setFlowStarted(true);
    const userMsg: ChatMessage = { role: 'user', content: action.label };
    setMessages([userMsg]);
    await sendToApi(action.message, [], action.intent);
  };

  const handleFixedSuggestion = async () => {
    if (!pageFlow?.suggestionAction) return;
    setFlowStarted(true);
    const label = pageFlow.suggestionAction.label;
    const userMsg: ChatMessage = { role: 'user', content: label };
    const prevMessages = messages;
    setMessages([...prevMessages, userMsg]);
    const intent: FlowIntent =
      pageKey === 'simulador_investimentos' ? 'register' : 'suggest';
    await sendToApi(pageFlow.suggestionAction.message, prevMessages, intent);
  };

  const handleAnotherSuggestion = async () => {
    setFlowStarted(true);
    const label = 'Pedir outra sugestão';
    const message = buildAnotherSuggestionMessage(pageKey);
    const userMsg: ChatMessage = { role: 'user', content: label };
    const prevMessages = messages;
    setMessages([...prevMessages, userMsg]);
    await sendToApi(message, prevMessages, 'suggest');
  };

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    if (!flowStarted) setFlowStarted(true);
    if (!textOverride) setInput('');

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    await sendToApi(text, messages);
  };

  const showOpening = pageFlow && !flowStarted && messages.length === 0 && !summaryLoading;

  const lastMessage = messages[messages.length - 1];
  const showConfirmButton =
    !loading &&
    credits > 0 &&
    lastMessage?.role === 'assistant' &&
    lastAwaitingConfirmation;

  return (
    <div className={`flex flex-col ${compact ? 'h-full min-h-0' : 'h-[calc(100vh-8rem)]'}`}>
      <div
        className={`flex flex-1 flex-col overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 ${
          compact ? 'min-h-0 rounded-none border-0 bg-transparent dark:bg-transparent' : 'rounded-2xl'
        }`}
      >
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
          {summaryLoading && pageKey !== 'generic' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          )}
          {showOpening && (
            <div className="space-y-4 py-2">
              <div className="rounded-2xl border border-brand-200/80 bg-brand-50/50 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/30">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {pageFlow.openingMessage}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {pageFlow.openingActions.map((action, index) => (
                    <Button
                      key={`${action.label}-${index}`}
                      type="button"
                      size="sm"
                      variant={action.variant === 'primary' ? 'default' : 'outline'}
                      className={action.variant === 'primary' ? 'bg-brand-500 hover:bg-brand-600' : ''}
                      onClick={() => void handleOpeningAction(action)}
                      disabled={loading}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
                {pageFlow.suggestionAction && (
                  <Button
                    type="button"
                    size="default"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => void handleFixedSuggestion()}
                    disabled={loading || credits <= 0}
                    title={credits <= 0 ? 'Sem créditos' : undefined}
                  >
                    <Sparkles className="h-4 w-4" />
                    {pageFlow.suggestionAction.label}
                  </Button>
                )}
              </div>
            </div>
          )}

          {credits <= 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              Seus créditos de IA acabaram. Eles renovam automaticamente na próxima cobrança do seu plano.
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-sm leading-relaxed text-white'
                    : 'border border-slate-200/80 bg-white py-3.5 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <AssistantMessage content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
              {showConfirmButton && i === messages.length - 1 && (
                <Button
                  type="button"
                  size="sm"
                  className="mt-2 gap-1.5 bg-brand-500 hover:bg-brand-600"
                  onClick={() => void sendMessage('Confirmo')}
                  disabled={loading}
                >
                  <Check className="h-3.5 w-3.5" />
                  Confirmar cadastro
                </Button>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900">
                <Loader2 className="h-4 w-4 animate-spin" />
                Pensando…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {error && (
          <p className="border-t border-slate-100 px-4 py-2 text-sm text-red-500 dark:border-slate-800">
            {error}
          </p>
        )}

        <div className={`shrink-0 border-t border-slate-200 dark:border-slate-800 ${compact ? 'p-3' : 'p-4'}`}>
          {flowStarted && pageFlow?.suggestionAction && (
            <div className="mb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs text-brand-600 hover:text-brand-700"
                onClick={() => void handleAnotherSuggestion()}
                disabled={loading || credits <= 0}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Pedir outra sugestão
              </Button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={credits > 0 ? 'Digite sua mensagem…' : 'Sem créditos disponíveis'}
              disabled={loading || credits <= 0}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <Button type="submit" size="icon" disabled={loading || credits <= 0 || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
