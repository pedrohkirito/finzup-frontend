'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useActiveSpaces } from '@/hooks/use-spaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Empresas (espaços PJ): resumo e atalho para a tela de empresas. Substitui o antigo liga/desliga PF/PJ. */
export function BusinessScopeCard() {
  const { businesses } = useActiveSpaces();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <div className="icon-chip bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
            <Building2 className="h-4 w-4" aria-hidden />
          </div>
          Empresas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {businesses.length
              ? `Você separa ${businesses.length === 1 ? '1 empresa' : `${businesses.length} empresas`} da vida pessoal: ${businesses
                  .map((b) => b.name)
                  .join(', ')}.`
              : 'Separe o dinheiro da sua empresa do seu: cada empresa tem lançamentos, categorias e limites próprios.'}
          </p>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/dashboard/empresas">{businesses.length ? 'Gerenciar empresas' : 'Adicionar empresa'}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
