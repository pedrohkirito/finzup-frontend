import type { Metadata } from 'next';
import { LandingPageClient } from '@/components/landing/landing-page-client';
import { Utmify } from '@/components/analytics/utmify';

export const metadata: Metadata = {
  title: 'Finzup — Pare de recomeçar do zero todo mês',
  description:
    'Cadastre receitas, despesas fixas e orçamentos uma vez. O Finzup repete tudo automaticamente no mês seguinte. PIX ou cartão — cancele quando quiser.',
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
    title: 'Finzup — Pare de recomeçar do zero todo mês',
    description:
      'Cadastre uma vez. O Finzup repete tudo no próximo mês automaticamente. PIX ou cartão via Asaas.',
    siteName: 'Finzup',
    images: [
      {
        url: '/images/finzup_icon.png',
        width: 512,
        height: 512,
        alt: 'Finzup — Controle Financeiro Pessoal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finzup — Pare de recomeçar do zero todo mês',
    description:
      'Cadastre uma vez. O Finzup repete tudo no próximo mês automaticamente. Planos a partir de R$ 16,49/mês.',
    images: ['/images/finzup_icon.png'],
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
