import type { Metadata } from 'next';
import { LandingPageClient } from '@/components/landing/landing-page-client';
import { Utmify } from '@/components/analytics/utmify';

export const metadata: Metadata = {
  title: 'Finzup — Controle Financeiro Pessoal com IA',
  description:
    'Tenha controle financeiro pessoal com a Finzup. Organize receitas e despesas, automatize lançamentos e use a IA para economizar e planejar seu dinheiro.',
  keywords:
    'controle financeiro, finanças pessoais, orçamento pessoal, controle de gastos, gestão financeira, app financeiro, investimentos pessoais, recorrência automática',
  authors: [{ name: 'Finzup' }],
  creator: 'Finzup',
  publisher: 'Finzup',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://finzup.com.br',
    title: 'Finzup — Controle Financeiro Pessoal com IA',
    description:
      'Tenha controle financeiro pessoal com a Finzup. Organize receitas e despesas, automatize lançamentos e use a IA para economizar e planejar seu dinheiro.',
    siteName: 'Finzup',
    images: [
      {
        url: '/images/finzup_isologo.png',
        width: 1407,
        height: 391,
        alt: 'Finzup — Controle Financeiro Pessoal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finzup — Controle Financeiro Pessoal com IA',
    description:
      'Tenha controle financeiro pessoal com a Finzup. Organize receitas e despesas, automatize lançamentos e use a IA para economizar e planejar seu dinheiro.',
    images: ['/images/finzup_isologo.png'],
  },
};

export default function Home() {
  return (
    <>
      <Utmify />
      <LandingPageClient />
    </>
  );
}
