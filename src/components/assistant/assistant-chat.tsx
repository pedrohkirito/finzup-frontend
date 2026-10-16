'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, Sparkles, Check, ChevronDown } from 'lucide-react';
import { AssistantMessage } from '@/components/assistant/assistant-message';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api, ApiError } from '@/lib/api';
import type { User } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useMonthStore } from '@/hooks/use-month';
import { useMonthSummary } from '@/hooks/use-month-summary';
import { buildPageContextPayload } from '@/lib/assistant-page-context';
import { getBabyStepPageGuidance } from '@/lib/baby-step-page-guidance';
import { useBabySteps } from '@/hooks/use-baby-steps';
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
  assistantReplyShouldNotify,
  beginAssistantRequest,
  getAssistantChatSession,
  getServerAssistantChatSession,
  isAssistantRequestCurrent,
  setAssistantCredits,
  subscribeAssistantChatSession,
  updateAssistantChatSession,
  type ChatMessage,
} from '@/lib/assistant-chat-session';
import { cn } from '@/lib/utils';

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
  const { data: babySteps } = useBabySteps();
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
    babyStep: babySteps?.currentStep,
  });
  if (babySteps?.currentStep) {
    const stepGuidance = getBabyStepPageGuidance(screen.pageKey, babySteps.currentStep);
    if (stepGuidance) {
      screen.pageContext += `\n\nFoco do Baby Step ${babySteps.currentStep} nesta tela: ${stepGuidance}`;
      screen.pageContext += `\nPróxima ação do método: ${babySteps.nextAction.label}`;
    }
  }
  const session = useSyncExternalStore(
    subscribeAssistantChatSession,
    getAssistantChatSession,
    getServerAssistantChatSession,
  );
  const {
    messages,
    input,
    error,
    loading,
    lastAwaitingConfirmation,
    suggestionsHiddenForPage,
  } = session;
  const [credits, setCredits] = useState(user?.aiCredits?.balance ?? 0);
  const [suggestionsIntroOpen, setSuggestionsIntroOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const creditsRef = useRef(credits);
  creditsRef.current = credits;

  const onCreditsChangeRef = useRef(onCreditsChange);
  onCreditsChangeRef.current = onCreditsChange;

  useEffect(() => {
    const hidden = getAssistantChatSession().suggestionsHiddenForPage;
    if (hidden && hidden !== pageKey) {
      updateAssistantChatSession({ suggestionsHiddenForPage: null });
    }
  }, [pageKey]);

  useEffect(() => {
    if (!initialQuery) return;
    updateAssistantChatSession({ input: initialQuery });
  }, [initialQuery]);

  useEffect(() => {
    if (!user?.aiCredits) return;
    setCredits(user.aiCredits.balance);
    setAssistantCredits(user.aiCredits.balance);
    onCreditsChangeRef.current?.(user.aiCredits.balance);
  }, [user?.aiCredits]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!active || loading || credits <= 0) return;
    // No mobile, não focar o input ao abrir — evita abrir o teclado virtual.
    if (window.matchMedia('(max-width: 767px)').matches) return;
    inputRef.current?.focus();
  }, [active, loading, messages, credits]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const applyCredits = (balance: number) => {
    setAssistantCredits(balance);
    setCredits(balance);
    onCreditsChange?.(balance);
    queryClient.setQueryData<User>(['auth', 'me'], (current) => {
      if (!current?.aiCredits) return current;
      return {
        ...current,
        aiCredits: { ...current.aiCredits, balance },
      };
    });
  };

  const sendToApi = async (
    text: string,
    currentMessages: ChatMessage[],
    flowIntent?: FlowIntent,
    options?: { clearInput?: boolean; displayText?: string },
  ) => {
    if (getAssistantChatSession().loading) return;

    if (creditsRef.current <= 0) {
      updateAssistantChatSession({
        error: 'Seus créditos de IA acabaram. Eles renovam na próxima cobrança do plano.',
      });
      return;
    }

    if (!selectedMonthId && !['configuracoes', 'generic', 'simulador_investimentos'].includes(pageKey)) {
      updateAssistantChatSession({ error: 'Selecione um mês para continuar.' });
      return;
    }

    const requestId = beginAssistantRequest();
    const nextMessages: ChatMessage[] = [
      ...currentMessages,
      { role: 'user', content: options?.displayText ?? text },
    ];
    updateAssistantChatSession({
      messages: nextMessages,
      error: null,
      loading: true,
      unread: false,
      ...(options?.clearInput ? { input: '' } : {}),
    });

    if (options?.clearInput && inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

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

      if (!isAssistantRequestCurrent(requestId)) return;

      updateAssistantChatSession({
        messages: [...nextMessages, { role: 'assistant', content: result.reply }],
        lastAwaitingConfirmation: result.awaitingConfirmation ?? false,
        loading: false,
        unread: assistantReplyShouldNotify(),
      });
      applyCredits(result.creditsRemaining);

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
      if (!isAssistantRequestCurrent(requestId)) return;
      updateAssistantChatSession({
        loading: false,
        error: err instanceof ApiError ? err.message : 'Erro ao enviar mensagem.',
      });
    }
  };

  const handleOpeningAction = async (action: PageFlow['openingActions'][number]) => {
    if (action.intent === 'dismiss') {
      updateAssistantChatSession({ suggestionsHiddenForPage: pageKey });
      return;
    }

    const history = getAssistantChatSession().messages;
    await sendToApi(action.message, history, action.intent, { displayText: action.label });
  };

  const handleFixedSuggestion = async () => {
    if (!pageFlow?.suggestionAction) return;
    const history = getAssistantChatSession().messages;
    const intent: FlowIntent =
      pageKey === 'simulador_investimentos' ? 'register' : 'suggest';
    await sendToApi(pageFlow.suggestionAction.message, history, intent, {
      displayText: pageFlow.suggestionAction.label,
    });
  };

  const handleAnotherSuggestion = async () => {
    const history = getAssistantChatSession().messages;
    await sendToApi(buildAnotherSuggestionMessage(pageKey), history, 'suggest', {
      displayText: 'Pedir outra sugestão',
    });
  };

  const sendMessage = async (textOverride?: string) => {
    const current = getAssistantChatSession();
    const text = (textOverride ?? current.input).trim();
    if (!text || current.loading) return;
    await sendToApi(text, current.messages, undefined, { clearInput: !textOverride });
  };

  const suggestionsHidden = suggestionsHiddenForPage === pageKey;
  const showOpening = Boolean(pageFlow) && messages.length === 0 && !suggestionsHidden && !summaryLoading;
  const showSuggestionStrip = Boolean(pageFlow) && !showOpening && !(summaryLoading && messages.length === 0);

  const lastMessage = messages[messages.length - 1];
  const showConfirmButton =
    !loading &&
    credits > 0 &&
    lastMessage?.role === 'assistant' &&
    lastAwaitingConfirmation;

  return (
    <div className={cn('flex flex-col', compact ? 'h-full min-h-0' : 'h-[calc(100vh-10rem)]')}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className={cn('flex-1', compact ? 'p-4' : 'p-4 sm:p-6')}>
          <div className="space-y-4 sm:space-y-5">
            {summaryLoading && messages.length === 0 && pageKey !== 'generic' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
              </div>
            )}

            {showOpening && pageFlow && (
              <div className="space-y-4 py-1">
                {suggestionsIntroOpen && (
                  <div className="flex justify-start gap-2.5">
                    <div className="brand-gradient-bg mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-md shadow-brand-500/25 sm:flex">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    </div>
                    <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-white/[0.08] bg-white/[0.06] px-4 py-3.5 text-sm leading-relaxed text-slate-200 sm:max-w-[85%]">
                      {pageFlow.openingMessage}
                    </div>
                  </div>
                )}

                <div className={cn('space-y-2.5', suggestionsIntroOpen && 'sm:pl-9')}>
                  <button
                    type="button"
                    onClick={() => setSuggestionsIntroOpen((open) => !open)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {suggestionsIntroOpen ? 'Minimizar texto' : 'Mostrar texto'}
                    <ChevronDown
                      className={cn('h-3.5 w-3.5 transition-transform', suggestionsIntroOpen && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {pageFlow.openingActions.map((action, index) => (
                      <button
                        key={`${action.label}-${index}`}
                        type="button"
                        onClick={() => void handleOpeningAction(action)}
                        disabled={loading}
                        className={cn(
                          'inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-opacity disabled:opacity-50',
                          action.variant === 'primary'
                            ? 'brand-gradient-bg-r font-bold text-white shadow-md shadow-brand-500/25'
                            : 'border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200',
                        )}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                  {pageFlow.suggestionAction && (
                    <button
                      type="button"
                      onClick={() => void handleFixedSuggestion()}
                      disabled={loading || credits <= 0}
                      title={credits <= 0 ? 'Sem créditos' : undefined}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/20 disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {pageFlow.suggestionAction.label}
                    </button>
                  )}
                </div>
              </div>
            )}

            {credits <= 0 && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Seus créditos de IA acabaram. Eles renovam automaticamente na próxima cobrança do seu
                plano.
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start gap-2.5',
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="brand-gradient-bg mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-md shadow-brand-500/25 sm:flex">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[92%] sm:max-w-[85%]',
                    msg.role === 'user'
                      ? 'brand-gradient-bg rounded-2xl rounded-tr-md px-4 py-3 text-sm leading-relaxed text-white shadow-md shadow-brand-500/20'
                      : 'space-y-3',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="rounded-2xl rounded-tl-md border border-white/[0.08] bg-white/[0.06] px-4 py-3.5">
                      <AssistantMessage content={msg.content} />
                    </div>
                  ) : (
                    msg.content
                  )}
                  {showConfirmButton && i === messages.length - 1 && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void sendMessage('Confirmo')}
                        disabled={loading}
                        className="brand-gradient-bg-r inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => inputRef.current?.focus()}
                        className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
                      >
                        Ajustar valores
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2.5">
                <div className="brand-gradient-bg mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-md shadow-brand-500/25 sm:flex">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                  Pensando…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {error && (
          <p className="border-t border-white/[0.08] px-4 py-2 text-sm text-red-400">{error}</p>
        )}

        <div
          className={cn(
            'shrink-0 min-w-0 border-t border-white/[0.08] bg-white/[0.02]',
            compact
              ? 'p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'
              : 'p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4',
          )}
        >
          {showSuggestionStrip && pageFlow && (
            <div className="mb-2 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  Sugestões · {pageFlow.label}
                </p>
                <button
                  type="button"
                  onClick={() => setSuggestionsIntroOpen((open) => !open)}
                  className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-200"
                >
                  {suggestionsIntroOpen ? 'Minimizar' : 'Mostrar'}
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform', suggestionsIntroOpen && 'rotate-180')}
                    aria-hidden
                  />
                </button>
              </div>
              {suggestionsIntroOpen && (
                <p className="text-xs leading-relaxed text-slate-400">{pageFlow.openingMessage}</p>
              )}
              <div className="flex min-w-0 flex-wrap gap-2">
                {pageFlow.openingActions
                  .filter((action) => action.intent !== 'dismiss')
                  .map((action, index) => (
                    <button
                      key={`${action.label}-${index}`}
                      type="button"
                      onClick={() => void handleOpeningAction(action)}
                      disabled={loading || credits <= 0}
                      className="inline-flex max-w-full items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-left text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  ))}
                {pageFlow.suggestionAction && (
                  <button
                    type="button"
                    onClick={() => void handleFixedSuggestion()}
                    disabled={loading || credits <= 0}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-left text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/20 disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    {pageFlow.suggestionAction.label}
                  </button>
                )}
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleAnotherSuggestion()}
                    disabled={loading || credits <= 0}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-left text-xs font-medium text-brand-300 transition-colors hover:bg-brand-500/10 hover:text-brand-200 disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    Pedir outra sugestão
                  </button>
                )}
              </div>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => updateAssistantChatSession({ input: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              rows={1}
              placeholder={credits > 0 ? 'Digite sua mensagem…' : 'Sem créditos disponíveis'}
              disabled={loading || credits <= 0}
              className="max-h-40 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm leading-relaxed text-slate-100 outline-none placeholder:text-slate-500 focus:border-brand-500/50 focus:bg-white/[0.06] disabled:opacity-50 scrollbar-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || credits <= 0 || !input.trim()}
              className="brand-gradient-bg h-11 w-11 shrink-0 rounded-full text-white shadow-md shadow-brand-500/25 hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
