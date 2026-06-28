'use client';

import Link from 'next/link';
import { Sparkles, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAiSuggestionActions, useAiSuggestions } from '@/hooks/use-ai-suggestions';
import { useAssistant } from '@/providers/assistant-provider';

export function AiSuggestionsPanel() {
  const { data: suggestions, isLoading } = useAiSuggestions();
  const { dismiss, act } = useAiSuggestionActions();
  const { openAssistant } = useAssistant();

  if (isLoading || !suggestions?.length) return null;

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => (
        <Card
          key={suggestion.id}
          className={
            suggestion.tier === 'ai'
              ? 'border-brand-200 bg-brand-50/60 dark:border-brand-900 dark:bg-brand-950/30'
              : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50'
          }
        >
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {suggestion.tier === 'ai' ? (
                    <Sparkles className="h-4 w-4 text-brand-500" />
                  ) : (
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {suggestion.tier === 'ai' ? 'Sugestão da IA' : 'Dica do Finzup'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{suggestion.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{suggestion.body}</p>
              </div>
              <button
                type="button"
                onClick={() => void dismiss(suggestion.id)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Dispensar sugestão"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestion.ctaHref && suggestion.ctaLabel && (
                <Button asChild size="sm">
                  <Link
                    href={suggestion.ctaHref}
                    onClick={() => void act(suggestion.id)}
                  >
                    {suggestion.ctaLabel}
                  </Link>
                </Button>
              )}
              {suggestion.chatPrompt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void act(suggestion.id);
                    openAssistant({ query: suggestion.chatPrompt ?? undefined });
                  }}
                >
                  Conversar sobre isso
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
