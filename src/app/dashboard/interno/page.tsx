'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CircleAlert, CircleDashed, Gauge, Loader2, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { PLAN_TIER_LABELS } from '@/hooks/use-plan';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AdminCreatedUser, AdminMetrics, AdminUser, PlanTier, ValidationSignal } from '@/types';

function fmt(value: number | null, unit: 'count' | 'percent' = 'count') {
  if (value === null || value === undefined) return '—';
  return unit === 'percent' ? `${value.toLocaleString('pt-BR')}%` : value.toLocaleString('pt-BR');
}

const STATUS = {
  ok: { icon: CheckCircle2, className: 'text-emerald-500', label: 'Na meta' },
  attention: { icon: CircleAlert, className: 'text-amber-500', label: 'Abaixo da meta' },
  no_data: { icon: CircleDashed, className: 'text-slate-400', label: 'Sem dados' },
} as const;

function SignalCard({ signal }: { signal: ValidationSignal }) {
  const status = STATUS[signal.status];
  const Icon = status.icon;
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{signal.label}</p>
          <Icon className={cn('h-5 w-5 shrink-0', status.className)} aria-label={status.label} />
        </div>
        <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{fmt(signal.value, signal.unit)}</p>
        <p className="text-xs text-slate-500">Meta: {signal.target}</p>
        <p className="text-xs text-slate-500">{signal.detail}</p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{value}</p>
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function CreateUser() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [tier, setTier] = useState<PlanTier>('essencial');
  const [months, setMonths] = useState('1');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMessage(null);
    setError(null);
    if (name.trim().split(/\s+/).filter(Boolean).length < 2) {
      setError('Informe o nome completo.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }
    const parsedMonths = Number(months);
    if (!Number.isInteger(parsedMonths) || parsedMonths < 1 || parsedMonths > 24) {
      setError('Informe de 1 a 24 meses.');
      return;
    }
    setBusy(true);
    try {
      const created = await api.post<AdminCreatedUser>('/admin/users', {
        name: name.trim(),
        email: email.trim(),
        cpf: cpf.trim() || undefined,
        tier,
        months: parsedMonths,
      });
      setName('');
      setEmail('');
      setCpf('');
      setMonths('1');
      setMessage(
        created.emailSent
          ? `${created.email} criado no ${PLAN_TIER_LABELS[created.planTier]}. O e-mail para definir a senha vale 7 dias.`
          : `${created.email} foi criado, mas o e-mail não saiu. Busque a pessoa abaixo e use Enviar senha.`,
      );
      await queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o usuário.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4 text-brand-500" aria-hidden />
          Criar usuário
        </CardTitle>
        <p className="text-sm text-slate-500">
          A conta nasce sem senha, com o plano liberado. A pessoa recebe um e-mail para criar a senha e entrar.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-user-name">Nome completo</Label>
            <Input id="new-user-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-user-email">E-mail</Label>
            <Input id="new-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-user-cpf">CPF ou CNPJ</Label>
            <Input id="new-user-cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="Opcional" autoComplete="off" />
          </div>
          <div className="grid grid-cols-[1fr_5rem] gap-2">
            <div className="space-y-1.5">
              <Label>Plano</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as PlanTier)}>
                <SelectTrigger aria-label="Plano do novo usuário">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PLAN_TIER_LABELS) as PlanTier[]).map((t) => (
                    <SelectItem key={t} value={t}>{PLAN_TIER_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-user-months">Meses</Label>
              <Input
                id="new-user-months"
                type="number"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(e.target.value)}
              />
            </div>
          </div>
        </div>
        {message && <p className="text-sm text-brand-600 dark:text-brand-300">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={() => void submit()} disabled={busy || !email.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Criar e enviar e-mail
        </Button>
      </CardContent>
    </Card>
  );
}

function PlanChanger() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<AdminUser[] | null>(null);
  const [tiers, setTiers] = useState<Record<string, PlanTier>>({});
  const [months, setMonths] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    setMessage(null);
    if (q.trim().length < 3) {
      setMessage('Digite pelo menos 3 letras do nome ou e-mail.');
      return;
    }
    setResults(await api.get<AdminUser[]>(`/admin/users?q=${encodeURIComponent(q.trim())}`));
  };

  const apply = async (user: AdminUser) => {
    const tier = tiers[user.id] ?? user.planTier;
    setBusy(true);
    setMessage(null);
    try {
      await api.post(`/admin/users/${user.id}/plan`, { tier, months: Number(months[user.id] ?? 1) });
      setMessage(`${user.email} agora está no ${PLAN_TIER_LABELS[tier]}.`);
      await search();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Não foi possível trocar o plano.');
    } finally {
      setBusy(false);
    }
  };

  const sendAccess = async (user: AdminUser) => {
    setBusy(true);
    setMessage(null);
    try {
      await api.post(`/admin/users/${user.id}/access-email`);
      setMessage(`E-mail para definir a senha enviado para ${user.email}. Vale 7 dias.`);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Não foi possível enviar o e-mail.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trocar plano de um usuário</CardTitle>
        <p className="text-sm text-slate-500">Para CFO de bolso e Conselho (vendidos por contato) ou ajustes do suporte.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="Nome ou e-mail" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void search()} />
          <Button variant="outline" onClick={search}>
            <Search className="h-4 w-4" /> Buscar
          </Button>
        </div>
        {message && <p className="text-sm text-brand-600 dark:text-brand-300">{message}</p>}
        {results && results.length === 0 && <p className="text-sm text-slate-500">Ninguém encontrado.</p>}
        <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {results?.map((u) => (
            <li key={u.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{u.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {u.email} · {PLAN_TIER_LABELS[u.effectiveTier]}
                  {u.effectiveTier !== u.planTier ? ` (contratado: ${PLAN_TIER_LABELS[u.planTier]})` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Select value={tiers[u.id] ?? u.planTier} onValueChange={(v) => setTiers((t) => ({ ...t, [u.id]: v as PlanTier }))}>
                  <SelectTrigger className="w-40" aria-label="Plano">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PLAN_TIER_LABELS) as PlanTier[]).map((t) => (
                      <SelectItem key={t} value={t}>{PLAN_TIER_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="w-20"
                  type="number"
                  min={1}
                  max={24}
                  aria-label="Meses"
                  value={months[u.id] ?? '1'}
                  onChange={(e) => setMonths((m) => ({ ...m, [u.id]: e.target.value }))}
                />
                <Button onClick={() => apply(u)} disabled={busy}>Aplicar</Button>
                <Button variant="outline" onClick={() => sendAccess(u)} disabled={busy}>Enviar senha</Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function InternoPage() {
  const { data: user } = useAuth();
  const { data, isPending, error } = useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () => api.get<AdminMetrics>('/admin/metrics'),
    enabled: !!user?.isAdmin,
  });

  if (user && !user.isAdmin) {
    return <p className="text-sm text-slate-500">Esta página é só para a equipe Finzup.</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Gauge className="h-6 w-6 text-brand-500" aria-hidden /> Painel interno
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sinais de validação da turma fundadora e uso do app.
          {data && ` Atualizado em ${new Date(data.generatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.`}
        </p>
      </div>

      {isPending && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error instanceof ApiError ? error.message : 'Erro ao carregar.'}</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.signals.map((s) => (
              <SignalCard key={s.key} signal={s} />
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Usuários e planos</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Total" value={fmt(data.users.total)} />
              <Stat label="Novos em 7 dias" value={fmt(data.users.new7d)} />
              <Stat label="Novos em 30 dias" value={fmt(data.users.new30d)} />
              <Stat label="Donos pagantes" value={fmt(data.users.payingDono)} />
              <Stat label="Com empresa" value={fmt(data.users.withBusiness)} />
              <Stat
                label="Por plano"
                value={Object.values(data.users.byEffectiveTier).map((n) => `${n}`).join(' / ') || '—'}
                hint={Object.keys(data.users.byEffectiveTier).map((t) => PLAN_TIER_LABELS[t as PlanTier]).join(' / ')}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Engajamento</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Ativos na semana" value={fmt(data.engagement.wau)} />
                <Stat label="Ativos no mês" value={fmt(data.engagement.mau)} />
                <Stat label="Ativação (30 dias)" value={fmt(data.engagement.activationRate30d, 'percent')} hint="Receita e despesa cadastradas" />
                <Stat
                  label="Voltou após 7 dias"
                  value={fmt(data.engagement.retentionD7.rate, 'percent')}
                  hint={`${data.engagement.retentionD7.retained} de ${data.engagement.retentionD7.eligible}`}
                />
                <Stat
                  label="Voltou após 30 dias"
                  value={fmt(data.engagement.retentionD30.rate, 'percent')}
                  hint={`${data.engagement.retentionD30.retained} de ${data.engagement.retentionD30.eligible}`}
                />
                <Stat label="Ativados (total)" value={fmt(data.engagement.activatedTotal)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">IA e atividade (30 dias)</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Mensagens à IA" value={fmt(data.ai.messages30d)} hint={`${fmt(data.ai.messages7d)} em 7 dias`} />
                <Stat label="Usuários da IA" value={fmt(data.ai.users30d)} hint={`${fmt(data.ai.messagesPerUser30d)} msg/usuário`} />
                <Stat label="Lançamentos" value={fmt(data.activity.entries30d)} hint={`${fmt(data.ai.entriesByAiShare30d, 'percent')} pela IA`} />
                <Stat label="Importações" value={fmt(data.activity.imports30d)} />
                <Stat
                  label="Check-ins respondidos"
                  value={fmt(data.activity.checkinResponseRate30d, 'percent')}
                  hint={`${data.activity.checkinsAnswered30d} de ${data.activity.checkinsSent30d}`}
                />
                <Stat label="Upgrades" value={fmt(data.activity.upgrades30d)} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {user?.isAdmin && (
        <div className="space-y-4">
          <CreateUser />
          <PlanChanger />
        </div>
      )}
    </div>
  );
}
