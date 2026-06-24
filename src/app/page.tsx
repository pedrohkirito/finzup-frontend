import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  Target,
  Heart,
  BarChart3,
  Shield,
  Smartphone,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LandingSummaryMock } from '@/components/landing/summary-mock';
import { ContactSection } from '@/components/landing/contact-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { TRIAL_DAYS } from '@/constants/billing';

export const metadata: Metadata = {
  title: 'Finzup — Controle Financeiro Pessoal Inteligente',
  description:
    `Organize suas finanças pessoais com o Finzup. Teste grátis por ${TRIAL_DAYS} dias. Controle receitas, despesas, investimentos e orçamentos em um só lugar.`,
  keywords:
    'controle financeiro, finanças pessoais, orçamento pessoal, controle de gastos, gestão financeira, app financeiro, investimentos pessoais',
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
    title: 'Finzup — Controle Financeiro Pessoal Inteligente',
    description:
      `Organize suas finanças pessoais com o Finzup. Teste grátis por ${TRIAL_DAYS} dias. Controle receitas, despesas, investimentos e orçamentos em um só lugar.`,
    siteName: 'Finzup',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finzup — Controle Financeiro Pessoal Inteligente',
    description: 'Organize suas finanças pessoais com o Finzup.',
  },
};

const features = [
  {
    icon: TrendingUp,
    title: 'Controle de Receitas',
    description:
      'Registre e categorize todas as suas fontes de renda. Acompanhe o crescimento da sua renda ao longo do tempo com facilidade.',
    colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    icon: Receipt,
    title: 'Gestão de Despesas',
    description:
      'Monitore todos os seus gastos com categorização inteligente e receba alertas quando se aproximar dos limites definidos.',
    colorClass: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  },
  {
    icon: Target,
    title: 'Orçamentos',
    description:
      'Defina metas de gastos por categoria e acompanhe em tempo real se você está dentro do que foi planejado.',
    colorClass: 'bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
  },
  {
    icon: PiggyBank,
    title: 'Investimentos',
    description:
      'Registre seus investimentos e acompanhe a evolução do seu patrimônio de forma simples e visual.',
    colorClass: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  },
  {
    icon: Heart,
    title: 'Doações',
    description:
      'Gerencie suas doações e contribuições, mantendo um histórico completo e organizado das suas contribuições.',
    colorClass: 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Detalhados',
    description:
      'Visualize sua saúde financeira com relatórios e gráficos claros que facilitam a tomada de decisões.',
    colorClass: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
  },
];

const whyFinzup = [
  { icon: Zap, text: 'Interface intuitiva e fácil de usar desde o primeiro acesso' },
  { icon: Shield, text: 'Seus dados protegidos com segurança e privacidade total' },
  { icon: Smartphone, text: 'Acesse de qualquer dispositivo, a qualquer hora e lugar' },
  { icon: BarChart3, text: 'Relatórios visuais para entender sua situação financeira' },
  { icon: CheckCircle2, text: 'Sem taxas escondidas — preço justo e totalmente transparente' },
];

export default function Home() {
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
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Recursos
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Preços
            </a>
            <a
              href="#contato"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Contato
            </a>
          </nav>

          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-200/50 sm:px-5 dark:hover:shadow-brand-900/50"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Fundo com gradientes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
          <div className="absolute top-0 right-0 h-[700px] w-[700px] -translate-y-1/3 translate-x-1/4 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4 rounded-full bg-brand-green-400/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <Zap className="h-3.5 w-3.5" />
              {TRIAL_DAYS} dias grátis para experimentar
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:text-6xl lg:text-7xl dark:text-white">
              Suas finanças,{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-green-500 bg-clip-text text-transparent">
                finalmente organizadas
              </span>
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-slate-600 sm:mb-10 sm:text-xl dark:text-slate-400">
              Controle receitas, despesas, investimentos e orçamentos em um só lugar. Teste grátis por{' '}
              {TRIAL_DAYS} dias — cancele quando quiser, sem cobrança imediata.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-200/60 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-300/50 dark:shadow-brand-900/50"
              >
                Começar {TRIAL_DAYS} dias grátis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
              >
                Ver planos e preços
              </a>
            </div>
          </div>

          <LandingSummaryMock />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:mb-4 sm:text-4xl dark:text-white">
              Tudo que você precisa para cuidar do seu dinheiro
            </h2>
            <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
              Recursos completos para uma gestão financeira pessoal eficiente e sem complicação.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-brand-800"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.colorClass}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que Finzup */}
      <section className="bg-white py-16 sm:py-24 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:mb-6 sm:text-4xl dark:text-white">
                Por que escolher o{' '}
                <span className="bg-gradient-to-r from-brand-500 to-brand-green-500 bg-clip-text text-transparent">
                  Finzup?
                </span>
              </h2>
              <p className="mb-6 text-base leading-relaxed text-slate-600 sm:mb-8 sm:text-lg dark:text-slate-400">
                Criado para brasileiros que querem simplificar a vida financeira sem abrir mão de
                funcionalidades poderosas e de um design agradável.
              </p>
              <ul className="space-y-4">
                {whyFinzup.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 rounded-full bg-brand-green-100 p-1.5 dark:bg-brand-green-950">
                      <Icon className="h-4 w-4 text-brand-green-600 dark:text-brand-green-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-brand-200/60 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lg dark:shadow-brand-900/50"
                >
                  Começar {TRIAL_DAYS} dias grátis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Cards flutuantes decorativos */}
            <div className="relative hidden lg:block">
              <div className="relative space-y-4">
                <div className="ml-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Orçamento de Alimentação</p>
                      <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">R$1.200,00</p>
                    </div>
                    <span className="rounded-full bg-brand-green-100 px-3 py-1 text-xs font-bold text-brand-green-700 dark:bg-brand-green-950 dark:text-brand-green-400">
                      72% usado
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[72%] rounded-full bg-brand-green-500" />
                  </div>
                </div>

                <div className="mr-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950">
                      <PiggyBank className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Investimentos este mês</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">R$1.850,00</p>
                    </div>
                  </div>
                </div>

                <div className="ml-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
                        <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Receita total</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">R$8.500,00</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-green-600 dark:text-brand-green-400">↑ 12%</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-brand-400/10 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-brand-green-400/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Seção de preços */}
      <PricingSection />

      <ContactSection />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900">
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
              <Link
                href="/politica-de-privacidade"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/termos-de-uso"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Termos de Uso
              </Link>
              <Link
                href="/login"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
