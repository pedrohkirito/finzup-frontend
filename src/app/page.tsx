import type { Metadata } from 'next';
import { LandingPageClient } from '@/components/landing/landing-page-client';
import { Utmify } from '@/components/analytics/utmify';

export const metadata: Metadata = {
  title: 'Finzup — Método Finzup para sair das dívidas e ter liberdade financeira',
  description:
    'O Método Finzup, baseado no método de Dave Ramsey, já ajudou milhões de pessoas a saírem das dívidas no mundo. Conheça a plataforma e o Assistente de IA que trazem esse método para a sua realidade.',
  keywords:
    'sair das dívidas, método finzup, liberdade financeira, controle financeiro, quitar dívidas, dave ramsey, assistente de ia financeiro, app financeiro, orçamento pessoal',
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
    title: 'Finzup — Método Finzup para sair das dívidas e ter liberdade financeira',
    description:
      'O Método Finzup, baseado no método de Dave Ramsey, já ajudou milhões de pessoas a saírem das dívidas no mundo. Conheça a plataforma e o Assistente de IA que trazem esse método para a sua realidade.',
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
    title: 'Finzup — Método Finzup para sair das dívidas e ter liberdade financeira',
    description:
      'O Método Finzup, baseado no método de Dave Ramsey, já ajudou milhões de pessoas a saírem das dívidas no mundo. Conheça a plataforma e o Assistente de IA que trazem esse método para a sua realidade.',
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
