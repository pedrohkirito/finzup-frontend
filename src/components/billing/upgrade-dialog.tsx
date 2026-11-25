'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Copy, CreditCard, Loader2, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/finance/segmented-control';
import { api, ApiError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { PLAN_QUERY_KEYS } from '@/hooks/use-plan';
import type { PlanCatalogEntry, PlanCycle, UpgradeStartResponse, UpgradeStatus } from '@/types';

type Step = 'choose' | 'pix' | 'paid';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PlanCatalogEntry | null;
  cycle: PlanCycle;
  /** O usuário ainda não tem CPF/CNPJ (necessário para o PIX). */
  needsTaxId?: boolean;
  /** Para onde o checkout de cartão volta (padrão: página de planos). */
  returnTo?: 'planos' | 'assinatura';
  onPaid?: () => void;
}

export function UpgradeDialog({ open, onOpenChange, plan, cycle, needsTaxId, returnTo = 'planos', onPaid }: UpgradeDialogProps) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<'pix' | 'credit_card'>('pix');
  const [taxId, setTaxId] = useState('');
  const [step, setStep] = useState<Step>('choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<UpgradeStartResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const price = plan?.prices[cycle];

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      setStep('choose');
      setOrder(null);
      setError(null);
      setCopied(false);
    }
    onOpenChange(next);
  };

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const markPaid = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setStep('paid');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
      queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.myPlan }),
      queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.history }),
      queryClient.invalidateQueries({ queryKey: ['spaces'] }),
    ]);
    onPaid?.();
  };

  const startPolling = (orderId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const status = await api.get<UpgradeStatus>(`/billing/upgrade/${orderId}/status`);
        if (status.status === 'paid') await markPaid();
        else if (status.status === 'expired' || status.status === 'canceled' || attempts > 120) {
          if (pollRef.current) clearInterval(pollRef.current);
          setError('A cobrança expirou. Gere uma nova para continuar.');
          setStep('choose');
        }
      } catch {
        // tenta de novo no próximo ciclo
      }
    }, 4000);
  };

  const handleStart = async () => {
    if (!plan) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<UpgradeStartResponse>('/billing/upgrade', {
        tier: plan.tier,
        cycle,
        paymentMethod: method,
        returnTo,
        ...(needsTaxId && taxId.trim() ? { cpfCnpj: taxId.trim() } : {}),
      });
      setOrder(data);
      if (data.status === 'paid') {
        await markPaid();
      } else if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else if (data.pix) {
        setStep('pix');
        startPolling(data.orderId);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível iniciar o pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyPix = async () => {
    if (!order?.pix) return;
    try {
      await navigator.clipboard.writeText(order.pix.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {step === 'paid' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden />
            <DialogTitle>Plano {plan?.name} liberado!</DialogTitle>
            <DialogDescription>
              {plan?.features.includes('business_spaces')
                ? 'Agora você pode criar o espaço da sua empresa e separar o dinheiro dela do seu.'
                : 'Tudo pronto. Os recursos do novo plano já estão disponíveis.'}
            </DialogDescription>
            <Button className="mt-2" onClick={() => handleOpenChange(false)}>
              Continuar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{plan ? `Assinar ${plan.name}` : 'Assinar'}</DialogTitle>
              {price && (
                <DialogDescription>
                  {cycle === 'annual'
                    ? `${formatCurrency(price.value)} por ano (${formatCurrency(price.monthlyEquivalent)}/mês)`
                    : `${formatCurrency(price.value)} por mês`}
                  . Se você já assina outro plano, a assinatura anterior é cancelada quando este pagamento for confirmado.
                </DialogDescription>
              )}
            </DialogHeader>

            {step === 'choose' && (
              <div className="space-y-4">
                <SegmentedControl
                  ariaLabel="Forma de pagamento"
                  value={method}
                  onChange={setMethod}
                  className="w-full"
                  options={[
                    { value: 'pix', label: 'PIX' },
                    { value: 'credit_card', label: 'Cartão de crédito' },
                  ]}
                />
                {method === 'pix' && needsTaxId && (
                  <div className="space-y-1.5">
                    <Label htmlFor="upgrade-tax-id">CPF ou CNPJ</Label>
                    <Input
                      id="upgrade-tax-id"
                      inputMode="numeric"
                      placeholder="Só números"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Necessário para gerar a cobrança PIX no Asaas.</p>
                  </div>
                )}
                {method === 'credit_card' && (
                  <p className="flex items-start gap-2 text-xs text-slate-500">
                    <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    Você vai para a página segura do Asaas e volta para o Finzup depois do pagamento.
                  </p>
                )}
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                  </p>
                )}
              </div>
            )}

            {step === 'pix' && order?.pix && (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${order.pix.encodedImage}`}
                  alt="QR Code PIX"
                  className="h-48 w-48 rounded-xl bg-white p-2"
                />
                <Button variant="outline" size="sm" onClick={copyPix}>
                  <Copy className="h-4 w-4" /> {copied ? 'Código copiado!' : 'Copiar código PIX'}
                </Button>
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Esperando a confirmação do pagamento…
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {step === 'pix' ? 'Fechar' : 'Cancelar'}
              </Button>
              {step === 'choose' && (
                <Button onClick={handleStart} disabled={loading || !plan}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : method === 'pix' ? <QrCode className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  {method === 'pix' ? 'Gerar PIX' : 'Ir para o pagamento'}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
