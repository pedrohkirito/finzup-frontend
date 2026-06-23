import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

type LegalSection = {
  title: string;
  content: React.ReactNode;
};

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalPageLayout({ title, lastUpdated, sections }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} className="h-8 w-8" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">Finzup</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Última atualização: {lastUpdated}</p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
              <div className="mt-3 space-y-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-slate-200 pt-8 dark:border-slate-800">
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/politica-de-privacidade" className="hover:text-slate-900 dark:hover:text-white">
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="hover:text-slate-900 dark:hover:text-white">
              Termos de Uso
            </Link>
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Página inicial
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
