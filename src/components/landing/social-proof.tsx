'use client';

import { ChevronRight, Star } from 'lucide-react';
import { type BillingPlanId } from '@/constants/billing-plans';
import { type LandingCtaClick } from '@/lib/funnel-analytics';

const testimonials: { quote: string; name: string; detail?: string }[] = [
  {
    quote:
      'Depois de inúmeros testes, finalmente cheguei numa solução que realmente me ajudou. Agora consigo saber exatamente para onde o meu dinheiro está indo — e o melhor: não preciso recomeçar do zero todo mês.',
    name: 'Pedro H.',
    detail: 'Usuário há 3 meses',
  },
  {
    quote:
      'Simples, bonito e fácil de usar. O design clean e minimalista fez até o controle financeiro virar prazeroso — pela primeira vez, organizei o dinheiro com vontade e continuo usando.',
    name: 'Raquel R.',
    detail: 'Usuária há 5 meses',
  },
];

interface SocialProofProps {
  onCta?: (plan?: BillingPlanId, cta?: LandingCtaClick) => void;
}

export function SocialProof({ onCta }: SocialProofProps) {
  return (
    <section className="border-y border-slate-200 bg-white py-16 sm:py-24 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold tracking-widest uppercase brand-gradient-text">
            Resultados reais
          </p>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Veja o que nossos clientes dizem
          </h2>
          <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Pessoas reais que pararam de recomeçar do zero todo mês.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <blockquote className="flex-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t.name}</p>
                  {t.detail && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.detail}</p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {onCta && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() =>
                onCta('annual', {
                  ctaLocation: 'social_proof',
                  ctaLabel: 'Assinar agora',
                  action: 'open_checkout',
                  planId: 'annual',
                })
              }
              className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-8 py-4 pr-12 text-sm font-semibold"
            >
              Assinar agora
              <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
