'use client';

import { useState, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { HeroSection } from '@/components/landing/hero-section';
import { LandingSummaryMock } from '@/components/landing/summary-mock';
import { TrustStrip } from '@/components/landing/trust-strip';
import { PricingSection } from '@/components/landing/pricing-section';
import { PainTruthSection } from '@/components/landing/pain-truth-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FeatureShowcase } from '@/components/landing/feature-showcase';
import { CostComparisonSection } from '@/components/landing/cost-comparison-section';
import { SocialProof } from '@/components/landing/social-proof';
import { Faq } from '@/components/landing/faq';
import { ContactSection } from '@/components/landing/contact-section';
import { LandingCheckoutModal } from '@/components/landing/landing-checkout-modal';
import { type BillingPlanId } from '@/constants/billing-plans';
import {
  trackInitiateCheckout,
  trackLandingCtaClick,
  type LandingCtaClick,
} from '@/lib/funnel-analytics';
import { trackPricingView } from '@/lib/meta-pixel';

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

function LandingPageClientInner() {
  const searchParams = useSearchParams();
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
            <a href="#pricing" onClick={(e) => handleAnchorClick(e, 'pricing')} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Planos
            </a>
            <a href="#como-funciona" onClick={(e) => handleAnchorClick(e, 'como-funciona')} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Como funciona
            </a>
            <a href="#features" onClick={(e) => handleAnchorClick(e, 'features')} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Recursos
            </a>
            <a href="#faq" onClick={(e) => handleAnchorClick(e, 'faq')} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Entrar
            </Link>
            <a
              href="#pricing"
              onClick={(e) => {
                trackLandingCtaClick({
                  ctaLocation: 'navbar',
                  ctaLabel: 'Começar agora',
                  action: 'scroll_to_pricing',
                });
                handleAnchorClick(e, 'pricing');
              }}
              className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-4 py-2.5 pr-9 text-sm font-semibold sm:px-5 sm:py-3 sm:pr-10"
            >
              Começar agora
              <span className="btn-arrow-bg absolute right-2 sm:right-2.5"><ChevronRight className="h-3.5 w-3.5" /></span>
            </a>
          </div>
        </div>
      </header>

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Demo */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <LandingSummaryMock />
      </div>

      {/* 3. Trust strip */}
      <TrustStrip />

      {/* 4. Preços #1 — logo acima do fold inferior */}
      <PricingSection id="pricing" onCta={openCheckout} onViewed={trackPricingViewOnce} />

      {/* 5. A verdade que ninguém te conta */}
      <PainTruthSection onCta={openCheckout} />

      {/* 6. Como funciona */}
      <HowItWorks />

      {/* 7. Recursos em tabs */}
      <FeatureShowcase />

      {/* 8. Faça as contas */}
      <CostComparisonSection onCta={openCheckout} />

      {/* 9. Prova social / Depoimentos */}
      <SocialProof onCta={openCheckout} />

      {/* 10. Preços #2 */}
      <PricingSection
        id="pricing-compact"
        onCta={openCheckout}
        onViewed={trackPricingViewOnce}
        compact
      />

      {/* 11. Suporte */}
      <ContactSection />

      {/* 12. FAQ */}
      <Faq />

      {/* 13. CTA final */}
      <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/2 -translate-x-1/4 rounded-full bg-brand-green-500/15 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-[400px] w-[400px] translate-y-1/2 translate-x-1/4 rounded-full bg-brand-400/15 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300">
            Comece hoje mesmo
          </div>

          <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Seu dinheiro não precisa{' '}
            <span className="brand-gradient-text">sumir no escuro</span>
          </h2>

          <p className="mb-10 text-lg text-slate-400 sm:text-xl">
            Assine hoje e pare de recomeçar do zero todo mês.{' '}
            <span className="font-semibold text-slate-200">Cancele quando quiser.</span>
          </p>

          <div className="flex flex-col items-center gap-3">
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
            <p className="text-sm text-slate-500">Sem taxa de cancelamento · Acesso imediato</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 pb-24 md:pb-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <Logo size={28} className="h-7 w-7" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">Finzup</span>
            </div>
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
        </div>
      </footer>

      {/* CTA fixo mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-950/95">
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
