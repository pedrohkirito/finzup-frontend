'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormCurrencyInput, CurrencyInput } from '@/components/ui/currency-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projectInvestmentSimulation } from '@/lib/investment-simulation-engine';
import { useAssistantOptional } from '@/providers/assistant-provider';
import type { InvestmentSimulation, SimulationSuggestions } from '@/types';
import { Sparkles } from 'lucide-react';
import { SimulationProjectionChart } from './simulation-projection-chart';
import { SimulationGoalCard } from './simulation-goal-card';
import { SimulationSummaryTable } from './simulation-summary-table';
import { CvmNotice } from '@/components/legal/regulatory-notice';

type FormState = {
  purpose: string;
  initialAmount: number;
  monthlyContribution: number;
  annualYieldPercent: number;
  annualContributionIncreasePercent: number;
  annualAdditionalContribution: number;
  goalAmount: number | null;
};

interface SimulationEditorProps {
  simulation: InvestmentSimulation;
  suggestions?: SimulationSuggestions;
}

export function SimulationEditor({ simulation, suggestions }: SimulationEditorProps) {
  const queryClient = useQueryClient();
  const assistant = useAssistantOptional();
  const [form, setForm] = useState<FormState>(() => toFormState(simulation));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(toFormState(simulation));
    setDirty(false);
  }, [simulation]);

  const projection = useMemo(
    () =>
      projectInvestmentSimulation({
        initialAmount: form.initialAmount,
        monthlyContribution: form.monthlyContribution,
        annualYieldPercent: form.annualYieldPercent,
        annualContributionIncreasePercent: form.annualContributionIncreasePercent,
        annualAdditionalContribution: form.annualAdditionalContribution,
        goalAmount: form.goalAmount,
      }),
    [form],
  );

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/investment-simulations/${simulation.id}`, {
        purpose: form.purpose.trim() || null,
        initialAmount: form.initialAmount,
        monthlyContribution: form.monthlyContribution,
        annualYieldPercent: form.annualYieldPercent,
        annualContributionIncreasePercent: form.annualContributionIncreasePercent,
        annualAdditionalContribution: form.annualAdditionalContribution,
        goalAmount: form.goalAmount,
      });
      await queryClient.invalidateQueries({ queryKey: ['investment-simulations'] });
      await queryClient.invalidateQueries({ queryKey: ['investment-simulations', simulation.id] });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const applySuggestions = () => {
    if (!suggestions) return;
    setForm((prev) => ({
      ...prev,
      initialAmount: suggestions.suggestedInitialAmount || prev.initialAmount,
      monthlyContribution:
        suggestions.suggestedMonthlyContribution || prev.monthlyContribution,
    }));
    setDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {suggestions &&
            (suggestions.suggestedInitialAmount > 0 ||
              suggestions.suggestedMonthlyContribution > 0) && (
              <Button type="button" variant="outline" size="sm" onClick={applySuggestions}>
                Usar sugestões do meu perfil
              </Button>
            )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              assistant?.openAssistant({
                query:
                  'Quero planejar uma meta de investimento. Me faça perguntas para entender meu objetivo antes de montar o plano.',
              })
            }
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Planejar com IA
          </Button>
        </div>
        <Button onClick={handleSave} disabled={!dirty || saving} className="w-full sm:w-auto">
          {saving ? 'Salvando…' : 'Salvar simulação'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parâmetros da simulação</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Finalidade da meta</Label>
            <Input
              placeholder="Ex: Aposentadoria, viagem, reserva de emergência…"
              value={form.purpose}
              onChange={(e) => updateField('purpose', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Valor já investido</Label>
            <CurrencyInput
              value={form.initialAmount}
              onChange={(v) => updateField('initialAmount', v)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label>Aporte mensal</Label>
            <CurrencyInput
              value={form.monthlyContribution}
              onChange={(v) => updateField('monthlyContribution', v)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <Label>Rentabilidade anual hipotética (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={form.annualYieldPercent}
              onChange={(e) => updateField('annualYieldPercent', Number(e.target.value))}
            />
            <p className="text-xs text-slate-500">Use a taxa que quiser testar. Não é indicação nem promessa de rendimento.</p>
          </div>
          <div className="space-y-2">
            <Label>Aumento anual dos aportes (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={form.annualContributionIncreasePercent}
              onChange={(e) =>
                updateField('annualContributionIncreasePercent', Number(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Aporte anual adicional</Label>
            <CurrencyInput
              value={form.annualAdditionalContribution}
              onChange={(v) => updateField('annualAdditionalContribution', v)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Meta (opcional)</Label>
            <CurrencyInput
              value={form.goalAmount ?? 0}
              onChange={(v) => updateField('goalAmount', v > 0 ? v : null)}
              placeholder="Quanto quer acumular?"
            />
          </div>
        </CardContent>
      </Card>

      <CvmNotice />

      <SimulationGoalCard projection={projection} goalAmount={form.goalAmount} />
      <SimulationProjectionChart
        monthly={projection.monthly}
        monthsToGoal={projection.monthsToGoal}
        goalReachedLabel={projection.goalReachedLabel}
      />
      <SimulationSummaryTable yearly={projection.yearly} />
    </div>
  );
}

function toFormState(simulation: InvestmentSimulation): FormState {
  return {
    purpose: simulation.purpose ?? '',
    initialAmount: Number(simulation.initialAmount),
    monthlyContribution: Number(simulation.monthlyContribution),
    annualYieldPercent: Number(simulation.annualYieldPercent),
    annualContributionIncreasePercent: Number(simulation.annualContributionIncreasePercent),
    annualAdditionalContribution: Number(simulation.annualAdditionalContribution),
    goalAmount: simulation.goalAmount !== null ? Number(simulation.goalAmount) : null,
  };
}
