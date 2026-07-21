'use client';

import { useEffect, useState } from 'react';
import { PiggyBank } from 'lucide-react';
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
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <CurrencyInput id={id} value={value} onChange={onChange} placeholder="0,00" />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

type EmergencyFundCardProps = {
  state: BabyStepState;
};

export function EmergencyFundCard({ state }: EmergencyFundCardProps) {
  const update = useUpdateBabyStepSettings();
  const [balance, setBalance] = useState(state.metrics.emergencyFundBalance || 0);
  const [target, setTarget] = useState(state.metrics.emergencyFundTarget || 0);

  useEffect(() => {
    setBalance(state.metrics.emergencyFundBalance || 0);
    setTarget(state.metrics.emergencyFundTarget || 0);
  }, [state.metrics.emergencyFundBalance, state.metrics.emergencyFundTarget]);

  const save = () => {
    void update.mutateAsync({
      emergencyFundBalance: balance || 0,
      emergencyFundTarget: target || null,
    });
  };

  const step1Progress = Math.min(
    100,
    (state.metrics.emergencyFundBalance / state.metrics.step1Ideal) * 100,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-brand-600" />
          <CardTitle>Reserva de emergência</CardTitle>
        </div>
        <CardDescription>
          Informe quanto você tem guardado em local líquido. Passo 1: R${' '}
          {state.metrics.step1Min.toLocaleString('pt-BR')} a R${' '}
          {state.metrics.step1Ideal.toLocaleString('pt-BR')}. Passo 3: ~{' '}
          {state.metrics.reserveTargetMonths} meses do custo de vida.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500">Saldo atual</p>
            <p className="text-lg font-semibold">{formatCurrency(state.metrics.emergencyFundBalance)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500">Meta da reserva</p>
            <p className="text-lg font-semibold">{formatCurrency(state.metrics.emergencyFundTarget)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500">Meses cobertos</p>
            <p className="text-lg font-semibold">{state.metrics.reserveMonths.toFixed(1)}</p>
          </div>
        </div>
        <Progress value={step1Progress} className="[&>div]:bg-brand-500" />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField
            id="fund-balance"
            label="Saldo da reserva"
            value={balance}
            onChange={setBalance}
            hint="Conta separada / fácil de resgatar"
          />
          <MoneyField
            id="fund-target"
            label="Meta da reserva — opcional"
            value={target}
            onChange={setTarget}
            hint={
              state.metrics.monthlyCostOfLiving > 0
                ? `Sugerido: ${formatCurrency(state.metrics.monthlyCostOfLiving * state.metrics.reserveTargetMonths)} (3× custo de vida)`
                : 'Deixe zerado para calcular automaticamente'
            }
          />
        </div>
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? 'Salvando…' : 'Salvar reserva'}
        </Button>
      </CardContent>
    </Card>
  );
}
