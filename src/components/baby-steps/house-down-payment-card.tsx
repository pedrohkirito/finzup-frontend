'use client';

import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { useUpdateBabyStepSettings } from '@/hooks/use-baby-steps';
import { formatCurrency } from '@/lib/utils';
import type { BabyStepState } from '@/types';

function MoneyField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <CurrencyInput id={id} value={value} onChange={onChange} placeholder="0,00" />
    </div>
  );
}

type HouseDownPaymentCardProps = {
  state: BabyStepState;
};

export function HouseDownPaymentCard({ state }: HouseDownPaymentCardProps) {
  const update = useUpdateBabyStepSettings();
  const [target, setTarget] = useState(state.metrics.houseDownPaymentTarget || 0);
  const [saved, setSaved] = useState(state.metrics.houseDownPaymentSaved || 0);

  useEffect(() => {
    setTarget(state.metrics.houseDownPaymentTarget || 0);
    setSaved(state.metrics.houseDownPaymentSaved || 0);
  }, [state.metrics.houseDownPaymentTarget, state.metrics.houseDownPaymentSaved]);

  const save = () => {
    void update.mutateAsync({
      houseDownPaymentTarget: target || null,
      houseDownPaymentSaved: saved || 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="icon-chip bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Home className="h-5 w-5" />
          </span>
          <CardTitle>Entrada da casa (Passo 5)</CardTitle>
        </div>
        <CardDescription>
          Meta de entrada (~20%) + custos (~4–8%). Preserve a reserva e mantenha o máximo possível
          investido.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.metrics.hasHomeFinancing && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/20 dark:bg-amber-500/[0.08]">
            Financiamento ativo detectado. Foque nos investimentos do mês + amortizar com a sobra.
            <ul className="mt-2 space-y-1">
              {state.metrics.homeFinancings.map((f) => (
                <li key={f.id} className="flex justify-between gap-2">
                  <span>{f.name}</span>
                  <span className="font-medium">{formatCurrency(f.remainingBalance)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {state.metrics.houseDownPaymentTarget != null && state.metrics.houseDownPaymentTarget > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="tabular-nums">
                {formatCurrency(state.metrics.houseDownPaymentSaved)} de{' '}
                {formatCurrency(state.metrics.houseDownPaymentTarget)}
              </span>
              <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {state.metrics.houseDownPaymentProgress}%
              </span>
            </div>
            <Progress
              value={state.metrics.houseDownPaymentProgress}
              className="h-2.5 [&>div]:bg-amber-500"
            />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField
            id="house-target"
            label="Meta da entrada + custos"
            value={target}
            onChange={setTarget}
          />
          <MoneyField
            id="house-saved"
            label="Já guardado"
            value={saved}
            onChange={setSaved}
          />
        </div>
        <Button onClick={save} disabled={update.isPending} className="w-full sm:w-auto">
          {update.isPending ? 'Salvando…' : 'Salvar meta da casa'}
        </Button>
      </CardContent>
    </Card>
  );
}
