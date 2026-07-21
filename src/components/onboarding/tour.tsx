'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BABY_STEPS_ENABLED } from '@/lib/feature-flags';

const steps = [
  {
    title: 'Cadastre suas receitas',
    description:
      'Adicione salário, freelances e outras fontes de renda. Marque "Repetir todo mês" para copiar automaticamente.',
    href: '/dashboard/receitas',
    cta: 'Ir para Receitas',
  },
  {
    title: 'Ajuste suas despesas',
    description:
      'Preencha despesas fixas e cadastre parcelamentos para ter uma visão real do seu mês.',
    href: '/dashboard/despesas',
    cta: 'Ir para Despesas',
  },
  ...(BABY_STEPS_ENABLED
    ? [{
        title: 'Descubra seu Baby Step',
        description:
          'Informe sua reserva e veja em qual passo do Método Finzup você está — e qual a próxima ação.',
        href: '/dashboard/metodo',
        cta: 'Ver o Método',
      }]
    : [{
        title: 'Defina sua meta de investimento',
        description: 'Quanto você quer guardar este mês? Acompanhe o progresso no resumo.',
        href: '/dashboard/investimentos',
        cta: 'Ir para Investimentos',
      }]),
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem('finzup-onboarding-done');
    if (!done) setVisible(true);
  }, []);

  if (!visible) return null;

  const current = steps[step];

  const finish = () => {
    localStorage.setItem('finzup-onboarding-done', 'true');
    setVisible(false);
  };

  return (
    <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
      <CardHeader>
        <CardTitle className="text-emerald-800 dark:text-emerald-200">
          Bem-vindo ao Finzup! ({step + 1}/{steps.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">{current.title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{current.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={current.href}>{current.cta}</Link>
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="outline" onClick={() => setStep(step + 1)}>Próximo</Button>
          ) : (
            <Button variant="outline" onClick={finish}>Concluir tour</Button>
          )}
          <Button variant="ghost" onClick={finish}>Pular</Button>
        </div>
      </CardContent>
    </Card>
  );
}
