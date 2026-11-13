'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { HeroSection } from '@/components/landing/hero-section';
import { PainSymptomsSection } from '@/components/landing/pain-symptoms-section';
import { CommonMistakeSection } from '@/components/landing/common-mistake-section';
import { MethodSection } from '@/components/landing/method-section';
import { PlatformSection } from '@/components/landing/platform-section';
import { AiAssistantSection } from '@/components/landing/ai-assistant-section';
import { SocialProof } from '@/components/landing/social-proof';
import { Faq } from '@/components/landing/faq';
import { TrustStrip } from '@/components/landing/trust-strip';
import { PricingSection } from '@/components/landing/pricing-section';
import { LifeComparisonSection } from '@/components/landing/life-comparison-section';
import { ContactSection } from '@/components/landing/contact-section';
import { LandingCheckoutModal } from '@/components/landing/landing-checkout-modal';
import { Reveal } from '@/components/landing/reveal';
import { type BillingPlanId } from '@/constants/billing-plans';
import {
  trackInitiateCheckout,
  trackLandingCtaClick,
  type LandingCtaClick,
} from '@/lib/funnel-analytics';
import { trackPricingView } from '@/lib/meta-pixel';
import { useLandingEngagement } from '@/hooks/use-landing-engagement';
import { CHECKOUT_RETURN_ORDER_KEY, rememberMetaClick } from '@/lib/meta-attribution';
import { RefundNote } from '@/components/landing/refund-note';

interface ModalState {
  isOpen: boolean;
  initialPlan: BillingPlanId;
  returnOrderId?: string | null;
}

const CLOSED: ModalState = { isOpen: false, initialPlan: 'annual', returnOrderId: null };

export function LandingPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LandingPageClientInner />
    </Suspense>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  scrollTo(id);
}

function readStoredReturnOrder() {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(CHECKOUT_RETURN_ORDER_KEY);
  } catch {
    return null;
  }
}

function LandingPageClientInner() {
  const searchParams = useSearchParams();
  useLandingEngagement();
  const [modal, setModal] = useState<ModalState>(() => {
    const checkoutParam = searchParams.get('checkout');
    const orderId = searchParams.get('orderId');

    if (checkoutParam === 'success' && orderId) {
      return { isOpen: true, initialPlan: 'annual', returnOrderId: orderId };
    }

    if (checkoutParam === '1') {
      return { isOpen: true, initialPlan: 'annual', returnOrderId: null };
    }

    return CLOSED;
  });
  const modalOpenRef = useRef(modal.isOpen);
  const pricingViewTrackedRef = useRef(false);
  const dismissedReturnRef = useRef(false);

  useEffect(() => {
    rememberMetaClick();
  }, []);

  useEffect(() => {
    if (searchParams.get('checkout') !== 'success' || dismissedReturnRef.current) return;

    const orderIdFromUrl = searchParams.get('orderId');
    if (orderIdFromUrl) {
      try {
        sessionStorage.setItem(CHECKOUT_RETURN_ORDER_KEY, orderIdFromUrl);
      } catch {
        // A URL ainda tem o pedido nesta visita.
      }
      return;
    }

    const orderId = readStoredReturnOrder();
    if (!orderId) return;
    modalOpenRef.current = true;
    setModal({ isOpen: true, initialPlan: 'annual', returnOrderId: orderId });
  }, [searchParams]);

  const openCheckout = useCallback((plan?: BillingPlanId, cta?: LandingCtaClick) => {
    if (modalOpenRef.current) return;

    const planId = plan ?? 'annual';
    modalOpenRef.current = true;
    trackLandingCtaClick(
      cta ?? {
        ctaLocation: 'landing',
        ctaLabel: 'Assinar agora',
        action: 'open_checkout',
        planId,
      },
    );
    trackInitiateCheckout(planId);
    setModal({ isOpen: true, initialPlan: planId, returnOrderId: null });
  }, []);

  const closeModal = useCallback(() => {
    modalOpenRef.current = false;
    dismissedReturnRef.current = true;
    try {
      sessionStorage.removeItem(CHECKOUT_RETURN_ORDER_KEY);
    } catch {
      // Nada a limpar se o storage estiver indisponível.
    }
    setModal(CLOSED);
  }, []);

  const trackPricingViewOnce = useCallback(() => {
    if (pricingViewTrackedRef.current) return;
    pricingViewTrackedRef.current = true;
    trackPricingView();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Finzup">
            <Logo variant="isologo" size={32} className="h-8 w-auto" priority />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#metodo" onClick={(e) => handleAnchorClick(e, 'metodo')} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Método
            </a>
            <a href="#plataforma" onClick={(e) => handleAnchorClick(e, 'plataforma')} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Plataforma
            </a>
            <a href="#faq" onClick={(e) => handleAnchorClick(e, 'faq')} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              FAQ
            </a>
            <a href="#pricing" onClick={(e) => handleAnchorClick(e, 'pricing')} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Planos
            </a>
          </nav>

          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Entrar
            </Link>
            <button
              type="button"
              onClick={() =>
                openCheckout('annual', {
                  ctaLocation: 'navbar',
                  ctaLabel: 'Começar agora',
                  action: 'open_checkout',
                  planId: 'annual',
                })
              }
              className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-4 py-2.5 pr-9 text-sm font-semibold sm:px-5 sm:py-3 sm:pr-10"
            >
              Começar agora
              <span className="btn-arrow-bg absolute right-2 sm:right-2.5"><ChevronRight className="h-3.5 w-3.5" /></span>
            </button>
          </div>
        </div>
      </header>

      {/* 1. Hero — dor clara */}
      <HeroSection
        onCheckout={() =>
          openCheckout('annual', {
            ctaLocation: 'hero',
            ctaLabel: 'Quero descobrir',
            action: 'open_checkout',
            planId: 'annual',
          })
        }
      />

      {/* 2. Reforço da dor */}
      <PainSymptomsSection />

      {/* 3. O erro que mantém a maioria das pessoas presa */}
      <CommonMistakeSection />

      {/* 4. A virada: o Método Finzup */}
      <MethodSection />

      {/* 5. A plataforma — o método na prática */}
      <PlatformSection />

      {/* 6. Assistente de IA */}
      <AiAssistantSection />

      {/* 7. Depoimentos */}
      <SocialProof />

      {/* 8. FAQ */}
      <Faq />

      {/* 9. Trust strip */}
      <TrustStrip />

      {/* 10. Preços */}
      <PricingSection id="pricing" onCta={openCheckout} onViewed={trackPricingViewOnce} />

      {/* 11. Sem Finzup vs. Com Finzup */}
      <LifeComparisonSection onCta={openCheckout} />

      {/* 12. CTA final */}
      <section data-landing-section="final_cta" className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-brand-50/40 to-brand-green-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950" />
          <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/15" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/2 -translate-x-1/4 rounded-full bg-brand-green-500/10 blur-3xl dark:bg-brand-green-500/15" />
          <div className="absolute right-0 bottom-0 h-[400px] w-[400px] translate-y-1/2 translate-x-1/4 rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-400/15" />
        </div>

        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Continue girando em círculo…
            <br />
            <span className="brand-gradient-text">ou saia da dívida de vez</span>.
          </h2>

          <button
            type="button"
            onClick={() =>
              openCheckout('annual', {
                ctaLocation: 'final_cta',
                ctaLabel: 'Assinar agora',
                action: 'open_checkout',
                planId: 'annual',
              })
            }
            className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-8 py-4 pr-12 text-base font-semibold"
          >
            Assinar agora
            <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
          </button>
          <RefundNote className="mt-4" />
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sem taxa de cancelamento · Acesso imediato</p>
        </Reveal>
      </section>

      {/* Suporte */}
      <ContactSection />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 pb-24 md:pb-12 dark:border-slate-800 dark:bg-slate-900">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Logo variant="isologo" size={28} className="h-7 w-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Finzup. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/politica-de-privacidade" className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Política de Privacidade
              </Link>
              <Link href="/termos-de-uso" className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Termos de Uso
              </Link>
              <Link href="/login" className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Entrar
              </Link>
            </div>
          </div>
        </Reveal>
      </footer>

      {/* CTA fixo mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <RefundNote className="mb-1.5 text-center text-[11px]" />
        <button
          type="button"
          onClick={() =>
            openCheckout('annual', {
              ctaLocation: 'mobile_sticky',
              ctaLabel: 'Assinar agora',
              action: 'open_checkout',
              planId: 'annual',
            })
          }
          className="btn-brand-gradient relative flex w-full items-center justify-center rounded-full px-6 py-4 pr-12 text-base font-semibold"
        >
          Assinar agora
          <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
        </button>
      </div>

      {/* Checkout Modal */}
      <LandingCheckoutModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        initialPlan={modal.initialPlan}
        returnOrderId={modal.returnOrderId}
      />
    </div>
  );
}
