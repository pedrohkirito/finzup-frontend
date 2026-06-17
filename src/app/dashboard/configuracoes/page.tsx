'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { changePasswordSchema } from '@/lib/validators';
import { formatCpf } from '@/lib/cpf';
import { paymentMethodTypeLabels, paymentMethodTypeStyles } from '@/lib/payment-method-types';
import { useAuth } from '@/hooks/use-auth';
import { PasswordRequirements } from '@/components/auth/password-requirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddPaymentMethodDialog } from '@/components/payment-methods/add-payment-method-dialog';
import type { PaymentMethod } from '@/types';
import {
  ArrowLeftRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Crown,
  Lock,
  MoreHorizontal,
  Plus,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const planLabels: Record<string, string> = {
  monthly: 'Mensal',
  semester: 'Semestral',
  annual: 'Anual',
};

const statusLabels: Record<string, string> = {
  none: 'Sem assinatura',
  active: 'Ativa',
  trialing: 'Em teste',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelada',
  unpaid: 'Não paga',
};

const methodTypeIcons: Record<PaymentMethod['type'], typeof CreditCard> = {
  credit: CreditCard,
  debit: CreditCard,
  pix: Smartphone,
  cash: Banknote,
  transfer: ArrowLeftRight,
  other: MoreHorizontal,
};

// Barra lateral colorida por tipo (igual ao padrão receitas/despesas)
const methodTypeBars: Record<PaymentMethod['type'], string> = {
  credit:   'bg-violet-500',
  pix:      'bg-brand-green-500',
  cash:     'bg-brand-green-500',
  debit:    'bg-brand-500',
  transfer: 'bg-brand-500',
  other:    'bg-slate-400',
};

function getBillingStatusBadge(status: string, inTrial: boolean) {
  if (inTrial) return { label: 'Teste gratuito', className: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300' };
  switch (status) {
    case 'active':   return { label: 'Ativa',    className: 'border-brand-green-200 bg-brand-green-50 text-brand-green-700 dark:border-brand-green-800 dark:bg-brand-green-950/60 dark:text-brand-green-300' };
    case 'past_due':
    case 'unpaid':   return { label: statusLabels[status], className: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300' };
    case 'canceled': return { label: 'Cancelada', className: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    default:         return { label: statusLabels[status] ?? status, className: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  }
}


export default function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [billingLoading, setBillingLoading] = useState(false);
  const { data: user } = useAuth();

  const { data: methods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get<PaymentMethod[]>('/payment-methods'),
  });

  const passwordForm = useForm({ resolver: zodResolver(changePasswordSchema) });
  const newPassword = passwordForm.watch('newPassword') ?? '';

  const billingBadge = getBillingStatusBadge(user?.billing?.status ?? 'none', !!user?.billing?.inTrial);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  const handleDeleteMethod = async () => {
    if (!deleteTarget) return;
    setDeletingMethod(true);
    try {
      await api.delete(`/payment-methods/${deleteTarget.id}`);
      await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setDeleteTarget(null);
    } finally {
      setDeletingMethod(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Configurações</h1>
        <p className="text-sm text-slate-500">Perfil, segurança e métodos de pagamento</p>
      </div>

      {/* ── Perfil ── */}
      <Card>
        <CardContent className="p-0">
          {/* Cabeçalho do perfil */}
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || '—'}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm text-slate-500">{user?.email || '—'}</p>
              {user?.emailVerifiedAt && (
                <Badge className="border-brand-green-200 bg-brand-green-50 text-brand-green-700 dark:border-brand-green-800 dark:bg-brand-green-950/60 dark:text-brand-green-300">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>
          </div>

          {/* Campos de detalhe */}
          <div className="grid divide-y divide-slate-100 text-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-slate-800">
            <div className="px-5 py-4">
              <p className="mb-0.5 text-xs font-medium text-slate-400">CPF</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{user?.cpf ? formatCpf(user.cpf) : '—'}</p>
            </div>
            {memberSince && (
              <div className="px-5 py-4">
                <p className="mb-0.5 text-xs font-medium text-slate-400">Membro desde</p>
                <p className="font-medium capitalize text-slate-800 dark:text-slate-200">{memberSince}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Métodos de pagamento ── */}
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Métodos de pagamento</CardTitle>
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setAddMethodOpen(true)}>
            <Plus className="h-4 w-4" />
            Adicionar método
          </Button>
        </CardHeader>
        <CardContent className="space-y-0 px-0 pb-0">
          {methods?.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Nenhum método cadastrado</p>
              <p className="mt-1 text-xs text-slate-500">Cadastre cartões, PIX e outras formas para classificar suas despesas.</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => setAddMethodOpen(true)}>
                <Plus className="h-4 w-4" />
                Cadastrar primeiro método
              </Button>
            </div>
          )}

          {methods && (() => {
            const typeOrder: PaymentMethod['type'][] = ['credit', 'debit', 'pix', 'transfer', 'cash', 'other'];
            const sorted = [...methods].sort(
              (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type),
            );
            return sorted.map((m, i) => {
              const Icon = methodTypeIcons[m.type];
              const style = paymentMethodTypeStyles[m.type];
              const bar = methodTypeBars[m.type];
              const isLast = i === sorted.length - 1;
              return (
                <div
                  key={m.id}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4',
                    !isLast && 'border-b border-slate-100 dark:border-slate-800',
                  )}
                >
                  {/* ícone colorido */}
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', style.iconBg)}>
                    <Icon className={cn('h-5 w-5', style.iconText)} />
                  </div>

                  {/* nome + tipo */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                    <p className={cn('text-xs font-medium', style.iconText)}>{paymentMethodTypeLabels[m.type]}</p>
                  </div>

                  {/* ações */}
                  <div className="flex shrink-0 items-center gap-1">
                    {m.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300">
                        <Star className="h-3 w-3 fill-current" />
                        Padrão
                      </span>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" className="text-xs text-slate-600 dark:text-slate-400"
                          onClick={async () => {
                            await api.patch(`/payment-methods/${m.id}/default`);
                            await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
                          }}>
                          Tornar padrão
                        </Button>
                        <Button size="icon" variant="ghost"
                          onClick={() => setDeleteTarget(m)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </CardContent>
      </Card>

      <AddPaymentMethodDialog open={addMethodOpen} onOpenChange={setAddMethodOpen} />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover método de pagamento</DialogTitle>
            <DialogDescription>
              Remover{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {deleteTarget?.name}
              </span>
              ? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deletingMethod}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteMethod} disabled={deletingMethod}>
              {deletingMethod ? 'Removendo…' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Alterar senha ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            Alterar senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(async (data) => {
              await api.patch('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
              });
              setPasswordMessage('Senha alterada com sucesso!');
              passwordForm.reset();
            })}
            className="max-w-sm space-y-4"
          >
            <div className="space-y-2">
              <Label>Senha atual</Label>
              <Input type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
            </div>
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
            </div>
            {newPassword.length > 0 && <PasswordRequirements password={newPassword} />}
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input type="password" autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
            </div>
            {passwordMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-brand-green-200 bg-brand-green-50 px-3 py-2.5 text-sm text-brand-green-700 dark:border-brand-green-800 dark:bg-brand-green-950/60 dark:text-brand-green-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {passwordMessage}
              </div>
            )}
            <Button type="submit">Salvar nova senha</Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Assinatura ── */}
      <Card className="border-brand-100 bg-brand-50/50 dark:border-brand-900/60 dark:bg-brand-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/60">
              <Crown className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            </div>
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-100 bg-white px-5 py-4 dark:border-brand-900/60 dark:bg-slate-900/60">
            <div>
              <p className="text-xs font-medium text-slate-500">Status</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', billingBadge.className)}>
                  {billingBadge.label}
                </span>
                {user?.billing?.inTrial && (
                  <span className="text-xs text-slate-500">
                    {user.billing.daysLeftInTrial} dia{user.billing.daysLeftInTrial === 1 ? '' : 's'} até a primeira cobrança
                  </span>
                )}
              </div>
            </div>
            {user?.billing?.plan && (
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500">Plano</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {planLabels[user.billing.plan] ?? user.billing.plan}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!user?.billing?.hasActiveSubscription ? (
              <Button onClick={() => router.push('/assinatura')}>
                <Sparkles className="h-4 w-4" />
                Iniciar teste grátis
              </Button>
            ) : (
              <Button variant="outline" disabled={billingLoading}
                onClick={async () => {
                  setBillingLoading(true);
                  try {
                    const { url } = await api.post<{ url: string }>('/billing/portal-session');
                    window.location.href = url;
                  } finally {
                    setBillingLoading(false);
                  }
                }}>
                Gerenciar assinatura
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
