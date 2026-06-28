import { Lock, RefreshCw, Shield, QrCode } from 'lucide-react';

const badges = [
  { icon: QrCode, text: 'PIX ou cartão de crédito' },
  { icon: RefreshCw, text: 'Cancele quando quiser' },
  { icon: Lock, text: 'Dados criptografados' },
  { icon: Shield, text: 'Pagamento via Asaas' },
];

export function TrustStrip() {
  return (
    <div className="border-y border-slate-200/70 bg-slate-50/80 py-4 dark:border-slate-800/70 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {badges.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Icon className="h-4 w-4 text-brand-green-500" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
