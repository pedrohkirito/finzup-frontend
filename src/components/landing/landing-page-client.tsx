'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
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
import { trackLead } from '@/lib/funnel-analytics';

interface ModalState {
  isOpen: boolean;
  initialPlan: BillingPlanId;
  skipPlanStep: boolean;
}

const CLOSED: ModalState = { isOpen: false, initialPlan: 'annual', skipPlanStep: false };

export function LandingPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LandingPageClientInner />
    </Suspense>
  );
}

function LandingPageClientInner() {
  const searchParams = useSearchParams();
  const [modal, setModal] = useState<ModalState>(CLOSED);

  const openCheckout = useCallback((plan?: BillingPlanId, skipPlanStep = false) => {
    trackLead('Landing CTA', { plan });
    setModal({ isOpen: true, initialPlan: plan ?? 'annual', skipPlanStep });
  }, []);

  const closeModal = useCallback(() => setModal(CLOSED), []);

  useEffect(() => {
    if (searchParams.get('checkout') === '1') {
      openCheckout('annual', true);
    }
  }, [searchParams, openCheckout]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} className="h-8 w-8" priority />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Finzup</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#como-funciona" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Como funciona
            </a>
            <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Recursos
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Preços
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
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
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-200/50 sm:px-5 dark:hover:shadow-brand-900/50"
            >
              Começar agora
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
      <PricingSection id="pricing" onCta={openCheckout} />

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
      <PricingSection id="pricing-compact" onCta={openCheckout} compact />

      {/* 11. Suporte */}
      <ContactSection />

      {/* 12. FAQ */}
      <Faq />

      {/* 13. CTA final */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-green-500 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Seu dinheiro não precisa sumir no escuro
          </h2>
          <p className="mb-8 text-base text-white/90 sm:text-lg">
            Assine hoje e pare de recomeçar do zero todo mês. Cancele quando quiser.
          </p>
          <button
            type="button"
            onClick={() => openCheckout()}
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-600 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Assinar agora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
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
          onClick={() => openCheckout()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-200/60 transition-colors hover:bg-brand-600 dark:shadow-brand-900/50"
        >
          Assinar agora
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Checkout Modal */}
      <LandingCheckoutModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        initialPlan={modal.initialPlan}
        skipPlanStep={modal.skipPlanStep}
      />
    </div>
  );
}
