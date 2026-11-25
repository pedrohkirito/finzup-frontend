'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, ApiError } from '@/lib/api';
import { changePasswordSchema, updateProfileSchema } from '@/lib/validators';
import { formatTaxId, maskCpfInput } from '@/lib/cpf';
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
import { SupportChannels } from '@/components/layout/support-channels';
import { DueDaySelect } from '@/components/payment-methods/due-day-select';
import { BankAccountsCard } from '@/components/settings/bank-accounts-card';
import { BusinessScopeCard } from '@/components/settings/business-scope-card';
import { WhatsAppCard } from '@/components/settings/whatsapp-card';
import type { PaymentMethod, User as UserProfile } from '@/types';
import {
  ArrowLeftRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Crown,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { z } from 'zod';

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

type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

function getBillingStatusBadge(status: string, inTrial: boolean, cancelAtPeriodEnd = false) {
  if (cancelAtPeriodEnd) {
    return {
      label: 'Cancelamento agendado',
      className:
        'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-slate-300',
    };
  }
  if (inTrial) return { label: 'Teste gratuito', className: 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300' };
  switch (status) {
    case 'active':   return { label: 'Ativa',    className: 'border-brand-green-200 bg-brand-green-50 text-brand-green-700 dark:border-brand-green-800 dark:bg-brand-green-950/60 dark:text-brand-green-300' };
    case 'past_due':
    case 'unpaid':   return { label: statusLabels[status], className: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300' };
    case 'canceled': return { label: 'Cancelada', className: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-slate-300' };
    default:         return { label: statusLabels[status] ?? status, className: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-slate-300' };
  }
}


function formatPeriodEnd(date: string | null | undefined) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}


export default function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { data: user } = useAuth();
  const canEditCpf = !user?.cpf;

  const { data: methods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get<PaymentMethod[]>('/payment-methods'),
  });

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: '', cpf: '' },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      name: user.name ?? '',
      cpf: user.cpf ? formatTaxId(user.cpf) : '',
    });
  }, [user, profileForm]);

  const passwordForm = useForm({ resolver: zodResolver(changePasswordSchema) });
  const newPassword = passwordForm.watch('newPassword') ?? '';

  const billingBadge = getBillingStatusBadge(
    user?.billing?.status ?? 'none',
    !!user?.billing?.inTrial && user?.billing?.billingProvider === 'stripe',
    !!user?.billing?.cancelAtPeriodEnd,
  );
  const periodEndLabel = formatPeriodEnd(user?.billing?.currentPeriodEnd);
  const canCancelSubscription =
    user?.billing?.hasActiveSubscription &&
    !user?.billing?.cancelAtPeriodEnd;

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

  const startEditingProfile = () => {
    profileForm.reset({
      name: user?.name ?? '',
      cpf: user?.cpf ? formatTaxId(user.cpf) : '',
    });
    setProfileMessage('');
    setProfileError('');
    setEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    profileForm.reset({
      name: user?.name ?? '',
      cpf: user?.cpf ? formatTaxId(user.cpf) : '',
    });
    setProfileError('');
    setEditingProfile(false);
  };

  const handleUpdateProfile = async (data: UpdateProfileValues) => {
    setProfileMessage('');
    setProfileError('');
    try {
      const payload: { name: string; cpf?: string } = {
        name: data.name.trim(),
      };
      if (canEditCpf && data.cpf?.trim()) {
        payload.cpf = data.cpf;
      }

      const updated = await api.patch<UserProfile>('/users/me', payload);
      queryClient.setQueryData(['auth', 'me'], updated);
      profileForm.reset({
        name: updated.name,
        cpf: updated.cpf ? formatTaxId(updated.cpf) : '',
      });
      setEditingProfile(false);
      setProfileMessage('Perfil atualizado com sucesso!');
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : 'Erro ao atualizar perfil.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">Configurações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Perfil, segurança e métodos de pagamento</p>
      </div>

      {/* ── Perfil ── */}
      <Card>
        <CardContent className="p-0">
          {!editingProfile ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/[0.06]">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="icon-chip bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <User className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || '—'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || '—'}</p>
                      {user?.emailVerifiedAt && (
                        <Badge className="border-brand-green-200 bg-brand-green-50 text-brand-green-700 dark:border-brand-green-500/25 dark:bg-brand-green-500/10 dark:text-brand-green-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={startEditingProfile}>
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>

              <div className="grid divide-y divide-slate-100 text-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-white/[0.06]">
                <div className="px-5 py-4">
                  <p className="mb-0.5 text-xs font-medium text-slate-400">CPF/CNPJ</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {user?.cpf ? formatTaxId(user.cpf) : '—'}
                  </p>
                </div>
                {memberSince && (
                  <div className="px-5 py-4">
                    <p className="mb-0.5 text-xs font-medium text-slate-400">Membro desde</p>
                    <p className="font-medium capitalize text-slate-800 dark:text-slate-200">{memberSince}</p>
                  </div>
                )}
              </div>

              {profileMessage && (
                <div className="border-t border-slate-100 px-5 py-3 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2 rounded-lg border border-brand-green-200 bg-brand-green-50 px-3 py-2.5 text-sm text-brand-green-700 dark:border-brand-green-500/25 dark:bg-brand-green-500/10 dark:text-brand-green-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {profileMessage}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-5 py-4">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="icon-chip bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <User className="h-4 w-4" aria-hidden />
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">Editar perfil</p>
              </div>

              <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="max-w-sm space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Nome completo</Label>
                  <Input
                    id="profile-name"
                    autoComplete="name"
                    {...profileForm.register('name')}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">E-mail</Label>
                  <Input
                    id="profile-email"
                    value={user?.email || ''}
                    disabled
                    readOnly
                    className="bg-slate-50 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-cpf">CPF/CNPJ</Label>
                  {canEditCpf ? (
                    <>
                      <Input
                        id="profile-cpf"
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        autoComplete="off"
                        {...profileForm.register('cpf', {
                          onChange: (event) => {
                            event.target.value = maskCpfInput(event.target.value);
                          },
                        })}
                      />
                      {profileForm.formState.errors.cpf && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {profileForm.formState.errors.cpf.message}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Depois de salvo, não poderá ser alterado.
                      </p>
                    </>
                  ) : (
                    <Input
                      id="profile-cpf"
                      value={user?.cpf ? formatTaxId(user.cpf) : ''}
                      disabled
                      readOnly
                      className="bg-slate-50 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400"
                    />
                  )}
                </div>

                {profileError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                    {profileError}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    {profileForm.formState.isSubmitting ? 'Salvando…' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditingProfile}
                    disabled={profileForm.formState.isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Métodos de pagamento ── */}
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="icon-chip bg-brand-green-50 text-brand-green-600 dark:bg-brand-green-500/15 dark:text-brand-green-400">
              <CreditCard className="h-4 w-4" aria-hidden />
            </div>
            Métodos de pagamento
          </CardTitle>
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setAddMethodOpen(true)}>
            <Plus className="h-4 w-4" />
            Adicionar método
          </Button>
        </CardHeader>
        <CardContent className="space-y-0 px-0 pb-0">
          {methods?.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.06]">
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
                    'flex items-center gap-4 px-6 py-4 transition-colors dark:hover:bg-white/[0.03]',
                    !isLast && 'border-b border-slate-100 dark:border-white/[0.06]',
                  )}
                >
                  {/* ícone colorido */}
                  <div className={cn('icon-chip', style.iconBg)}>
                    <Icon className={cn('h-5 w-5', style.iconText)} />
                  </div>

                  {/* nome + tipo */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                    <p className={cn('text-xs font-medium', style.iconText)}>{paymentMethodTypeLabels[m.type]}</p>
                    {m.type === 'credit' && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <DueDaySelect
                          compact
                          kind="closing"
                          value={m.closingDay}
                          onChange={async (closingDay) => {
                            await api.patch(`/payment-methods/${m.id}`, { closingDay });
                            await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
                            await queryClient.invalidateQueries({ queryKey: ['months'] });
                            await queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
                          }}
                        />
                        <DueDaySelect
                          compact
                          value={m.dueDay}
                          onChange={async (dueDay) => {
                            await api.patch(`/payment-methods/${m.id}`, { dueDay });
                            await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
                            await queryClient.invalidateQueries({ queryKey: ['months'] });
                            await queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* ações */}
                  <div className="flex shrink-0 items-center gap-1">
                    {m.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-brand-300">
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
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          onClick={() => setDeleteTarget(m)}>
                          <Trash2 className="h-4 w-4" />
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

      {/* ── Contas bancárias e PF/PJ ── */}
      <BankAccountsCard />
      <BusinessScopeCard />
      <WhatsAppCard />

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
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="icon-chip bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
              <Lock className="h-4 w-4" aria-hidden />
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
              <div className="flex items-center gap-2 rounded-lg border border-brand-green-200 bg-brand-green-50 px-3 py-2.5 text-sm text-brand-green-700 dark:border-brand-green-500/25 dark:bg-brand-green-500/10 dark:text-brand-green-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {passwordMessage}
              </div>
            )}
            <Button type="submit">Salvar nova senha</Button>
          </form>
        </CardContent>
      </Card>

      {/* ── Assinatura ── */}
      <Card className="border-brand-100 bg-brand-50/50 dark:border-brand-500/20 dark:bg-brand-500/[0.06]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="icon-chip bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Crown className="h-4 w-4" aria-hidden />
            </div>
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-100 bg-white px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <div>
              <p className="text-xs font-medium text-slate-500">Status</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', billingBadge.className)}>
                  {billingBadge.label}
                </span>
                {user?.billing?.inTrial && user?.billing?.billingProvider === 'stripe' && (
                  <span className="text-xs text-slate-500">
                    {user.billing.cancelAtPeriodEnd
                      ? `${user.billing.daysLeftInTrial} dia${user.billing.daysLeftInTrial === 1 ? '' : 's'} de teste restantes · assinatura cancelada`
                      : `${user.billing.daysLeftInTrial} dia${user.billing.daysLeftInTrial === 1 ? '' : 's'} até a primeira cobrança`}
                  </span>
                )}
                {!user?.billing?.inTrial && user?.billing?.cancelAtPeriodEnd && periodEndLabel && (
                  <span className="text-xs text-slate-500">
                    Acesso até {periodEndLabel}
                  </span>
                )}
              </div>
            </div>
            {(user?.plan || user?.billing?.plan) && (
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500">Plano</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {user?.plan?.name ?? 'Finzup'}
                  {user?.billing?.plan && (
                    <span className="font-normal text-slate-500"> · {planLabels[user.billing.plan] ?? user.billing.plan}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!user?.billing?.hasActiveSubscription ? (
              <Button
                className="brand-gradient-bg-r text-white shadow-md shadow-brand-500/25 hover:opacity-90"
                onClick={() => router.push('/assinatura')}
              >
                <Sparkles className="h-4 w-4" />
                Assinar agora
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push('/dashboard/planos')}>
                  <Crown className="h-4 w-4" />
                  Ver planos e cobranças
                </Button>
                {canCancelSubscription && (
                  <Button variant="ghost" onClick={() => setCancelDialogOpen(true)}>
                    Cancelar assinatura
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar assinatura</DialogTitle>
            <DialogDescription>
              Para cancelar sua assinatura, entre em contato com nosso time pelo WhatsApp ou e-mail.
              Nossa equipe vai te ajudar com o processo.
            </DialogDescription>
          </DialogHeader>

          <SupportChannels />

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
