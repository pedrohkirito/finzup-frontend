import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CVM_CONSULTANT_REFERRAL =
  'Para escolher onde investir, procure um consultor de valores mobiliários registrado na CVM.';

/** Aviso da Resolução CVM 19: o Finzup não indica investimentos. */
export function CvmNotice({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-xs leading-relaxed text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/[0.07] dark:text-sky-200',
        className,
      )}
      role="note"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <p>
        {compact ? (
          <>Simulação educativa, com taxa hipotética. O Finzup não indica onde investir. </>
        ) : (
          <>
            <strong className="font-semibold">Simulação educativa.</strong> A rentabilidade é uma hipótese sua, não uma
            promessa. O Finzup ajuda com caixa, reserva, dívidas e metas, mas não indica produtos nem onde investir.{' '}
          </>
        )}
        {CVM_CONSULTANT_REFERRAL}{' '}
        <a
          href="https://www.gov.br/cvm/pt-br"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-sky-950 dark:hover:text-white"
        >
          Consultar registro na CVM
        </a>
      </p>
    </div>
  );
}

/** Aviso do CRC: o painel do dono é gerencial; escrituração e formalização são com o contador. */
export function AccountantNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300',
        className,
      )}
      role="note"
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <p>
        Este é um painel gerencial para você decidir o dia a dia da empresa. Escrituração, demonstrações contábeis,
        impostos e a formalização do pró-labore e das retiradas são feitas com o seu contador.
      </p>
    </div>
  );
}
