'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Landmark, Loader2, RefreshCw, Unplug } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useHasFeature } from '@/hooks/use-plan';
import { useActiveSpaces } from '@/hooks/use-spaces';
import { useBankAccounts } from '@/hooks/use-bank-accounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import type { PaymentMethod } from '@/types';
import type { PluggyConnectProps } from 'react-pluggy-connect';

const PluggyWidget = dynamic(
  () => import('@/components/open-finance/pluggy-widget').then((mod) => mod.PluggyWidget),
  { ssr: false },
);

type Account = {
  id: string;
  type: 'BANK' | 'CREDIT';
  name: string;
  numberMasked: string | null;
  balance: number;
  currencyCode: string;
  spaceId: string | null;
  bankAccountId: string | null;
  paymentMethodId: string | null;
  linked: boolean;
  reviewImportId: string | null;
  updatedAfterCommit: number;
  deletedAfterCommit: number;
};

type Item = {
  id: string;
  connectorName: string | null;
  status: string;
  errorCode: string | null;
  consentExpiresAt: string | null;
  lastSyncAt: string | null;
  accounts: Account[];
};

type ConnectSession = {
  accessToken: string;
  connectorIds: number[];
  products: PluggyConnectProps['products'];
};

type LinkChoice = { spaceId: string; mode: 'create' | 'existing'; targetId: string };

const STATUS_LABEL: Record<string, string> = {
  UPDATED: 'Atualizada',
  UPDATING: 'Atualizando',
  LOGIN_ERROR: 'Precisa autorizar de novo',
  WAITING_USER_INPUT: 'Aguardando você',
  WAITING_USER_ACTION: 'Aguardando você no banco',
  OUTDATED: 'Desatualizada',
};

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Não foi possível concluir. Tente de novo.';
}

function formatWhen(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export default function OpenFinancePage() {
  const canUse = useHasFeature('statement_import');
  const queryClient = useQueryClient();
  const { spaces } = useActiveSpaces();
  const { data: bankAccounts } = useBankAccounts();
  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get<PaymentMethod[]>('/payment-methods'),
    enabled: canUse,
  });
  const items = useQuery({
    queryKey: ['open-finance-items'],
    queryFn: () => api.get<Item[]>('/open-finance/items'),
    enabled: canUse,
    retry: false,
  });
  const [session, setSession] = useState<ConnectSession | null>(null);
  const [choices, setChoices] = useState<Record<string, LinkChoice>>({});
  const [message, setMessage] = useState<string | null>(null);

  const connect = useMutation({
    mutationFn: () => api.post<ConnectSession>('/open-finance/connect-token'),
    onSuccess: (data) => {
      setMessage(null);
      setSession(data);
    },
    onError: (err) => setMessage(errorMessage(err)),
  });

  const register = useMutation({
    mutationFn: (pluggyItemId: string) => api.post<Item>('/open-finance/items', { pluggyItemId }),
    onSuccess: async () => {
      setSession(null);
      await queryClient.invalidateQueries({ queryKey: ['open-finance-items'] });
    },
    onError: (err) => setMessage(errorMessage(err)),
  });

  const link = useMutation({
    mutationFn: (input: { itemId: string; accounts: Array<Record<string, unknown>> }) =>
      api.post<Item>(`/open-finance/items/${input.itemId}/link`, { accounts: input.accounts }),
    onSuccess: async () => {
      setMessage(null);
      await queryClient.invalidateQueries({ queryKey: ['open-finance-items'] });
      await queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      await queryClient.invalidateQueries({ queryKey: ['open-finance-holdings'] });
    },
    onError: (err) => setMessage(errorMessage(err)),
  });

  const refresh = useMutation({
    mutationFn: (id: string) => api.post<Item>(`/open-finance/items/${id}/refresh`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['open-finance-items'] });
    },
    onError: (err) => setMessage(errorMessage(err)),
  });

  const disconnect = useMutation({
    mutationFn: (id: string) => api.delete(`/open-finance/items/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['open-finance-items'] });
      await queryClient.invalidateQueries({ queryKey: ['open-finance-holdings'] });
    },
    onError: (err) => setMessage(errorMessage(err)),
  });

  const configuredError = items.error instanceof ApiError && items.error.code === 'PLUGGY_NOT_CONFIGURED';

  const submitLink = (item: Item) => {
    const pending = item.accounts.filter((account) => !account.linked);
    const accounts = pending.map((account) => {
      const choice = choices[account.id] ?? {
        spaceId: spaces.find((space) => space.kind === 'personal')?.id ?? '',
        mode: 'create' as const,
        targetId: '',
      };
      return {
        id: account.id,
        spaceId: choice.spaceId,
        create: choice.mode === 'create',
        ...(account.type === 'BANK' && choice.mode === 'existing' ? { bankAccountId: choice.targetId } : {}),
        ...(account.type === 'CREDIT' && choice.mode === 'existing' ? { paymentMethodId: choice.targetId } : {}),
      };
    });
    if (accounts.some((account) => !account.spaceId || (!account.create && !account.bankAccountId && !account.paymentMethodId))) {
      setMessage('Escolha o espaço e a conta ou o cartão de cada conexão.');
      return;
    }
    link.mutate({ itemId: item.id, accounts });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Landmark className="h-6 w-6 text-brand-500" aria-hidden /> Open Finance
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A Finzup só lê saldos, transações, faturas e investimentos. Nada é pago nem transferido. As compras confirmadas caem na{' '}
          <Link href="/dashboard/importar" className="text-brand-600 underline dark:text-brand-400">
            conferência de extratos
          </Link>
          .
        </p>
      </div>

      {!canUse ? (
        <UpgradePrompt
          title="Open Finance faz parte do Dono App"
          description="Conecte seus bancos e cartões. As transações entram na conferência de extrato para você confirmar antes de virar lançamento."
        />
      ) : configuredError ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-500">O Open Finance ainda não está ligado neste ambiente.</CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => connect.mutate()} disabled={connect.isPending || !!session}>
              {connect.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
              Conectar banco
            </Button>
          </div>
          {message && <p className="text-sm text-red-500">{message}</p>}
          {session && (
            <PluggyWidget
              connectToken={session.accessToken}
              connectorIds={session.connectorIds}
              products={session.products}
              onSuccess={(itemId) => register.mutate(itemId)}
              onClose={() => setSession(null)}
            />
          )}

          {items.isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <ul className="space-y-4">
              {(items.data ?? []).map((item) => {
                const pending = item.accounts.filter((account) => !account.linked);
                return (
                  <li key={item.id}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between gap-3 text-base">
                          <span>{item.connectorName || 'Banco'}</span>
                          <span className="text-xs font-normal text-slate-400">{STATUS_LABEL[item.status] ?? item.status}</span>
                        </CardTitle>
                        <p className="text-xs text-slate-400">
                          {item.lastSyncAt ? `Sincronizado em ${formatWhen(item.lastSyncAt)}` : 'Ainda sem sincronização'}
                          {item.consentExpiresAt ? ` · consentimento até ${formatWhen(item.consentExpiresAt)}` : ''}
                        </p>
                        {item.errorCode && <p className="text-xs text-amber-600">O banco pediu uma nova autorização ({item.errorCode}).</p>}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {item.accounts.map((account) => (
                            <li key={account.id} className="rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-white/[0.06]">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-medium">{account.name}</p>
                                  <p className="text-xs text-slate-400">
                                    {account.type === 'CREDIT' ? 'Cartão' : 'Conta'}
                                    {account.numberMasked ? ` · ${account.numberMasked}` : ''}
                                    {account.linked ? '' : ' · falta ligar à Finzup'}
                                  </p>
                                </div>
                                <p className="shrink-0 tabular-nums">{formatCurrency(account.balance)}</p>
                              </div>
                              {(account.updatedAfterCommit > 0 || account.deletedAfterCommit > 0) && (
                                <p className="mt-1 text-xs text-amber-600">
                                  {account.updatedAfterCommit > 0 ? `${account.updatedAfterCommit} lançamento(s) mudaram depois de confirmados. ` : ''}
                                  {account.deletedAfterCommit > 0 ? `${account.deletedAfterCommit} sumiram no banco depois de confirmados.` : ''}
                                  O lançamento na Finzup foi mantido.
                                </p>
                              )}
                              {account.reviewImportId && (
                                <Link
                                  href={`/dashboard/importar?import=${account.reviewImportId}`}
                                  className="mt-1 inline-block text-xs text-brand-600 underline dark:text-brand-400"
                                >
                                  Revisar movimentos
                                </Link>
                              )}
                              {!account.linked && (
                                <AccountLinkFields
                                  account={account}
                                  spaces={spaces.map((space) => ({ id: space.id, name: space.name }))}
                                  bankAccounts={(bankAccounts ?? []).map((bank) => ({ id: bank.id, name: bank.name }))}
                                  cards={(paymentMethods ?? []).filter((method) => method.type === 'credit').map((method) => ({ id: method.id, name: method.name }))}
                                  value={
                                    choices[account.id] ?? {
                                      spaceId: spaces.find((space) => space.kind === 'personal')?.id ?? spaces[0]?.id ?? '',
                                      mode: 'create',
                                      targetId: '',
                                    }
                                  }
                                  onChange={(value) => setChoices((current) => ({ ...current, [account.id]: value }))}
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-2">
                          {pending.length > 0 && (
                            <Button size="sm" onClick={() => submitLink(item)} disabled={link.isPending}>
                              Ligar contas
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => refresh.mutate(item.id)} disabled={refresh.isPending}>
                            <RefreshCw className="h-4 w-4" /> Atualizar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => disconnect.mutate(item.id)} disabled={disconnect.isPending}>
                            <Unplug className="h-4 w-4" /> Desconectar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
          {items.data && items.data.length === 0 && (
            <p className="text-sm text-slate-500">Nenhum banco conectado. A autorização acontece no app do banco.</p>
          )}
        </>
      )}
    </div>
  );
}

function AccountLinkFields({
  account,
  spaces,
  bankAccounts,
  cards,
  value,
  onChange,
}: {
  account: Account;
  spaces: Array<{ id: string; name: string }>;
  bankAccounts: Array<{ id: string; name: string }>;
  cards: Array<{ id: string; name: string }>;
  value: LinkChoice;
  onChange: (value: LinkChoice) => void;
}) {
  const targets = account.type === 'CREDIT' ? cards : bankAccounts;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>Espaço</Label>
        <Select value={value.spaceId} onValueChange={(spaceId) => onChange({ ...value, spaceId })}>
          <SelectTrigger>
            <SelectValue placeholder="Espaço" />
          </SelectTrigger>
          <SelectContent>
            {spaces.map((space) => (
              <SelectItem key={space.id} value={space.id}>
                {space.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{account.type === 'CREDIT' ? 'Cartão na Finzup' : 'Conta na Finzup'}</Label>
        <Select
          value={value.mode === 'create' ? 'create' : value.targetId}
          onValueChange={(next) => onChange(next === 'create' ? { ...value, mode: 'create', targetId: '' } : { ...value, mode: 'existing', targetId: next })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create">{account.type === 'CREDIT' ? 'Criar cartão' : 'Criar conta'}</SelectItem>
            {targets.map((target) => (
              <SelectItem key={target.id} value={target.id}>
                {target.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
