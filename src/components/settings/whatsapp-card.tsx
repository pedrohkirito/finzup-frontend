'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, ExternalLink, Loader2, MessageCircle, Smartphone } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { useStartWhatsAppLink, useUnlinkWhatsApp, useUpdateWhatsApp, useWhatsApp } from '@/hooks/use-whatsapp';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { maskPhoneInput, normalizePhoneDigits } from '@/lib/phone';
import type { WhatsAppLinkStart } from '@/types';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const EXAMPLES = ['gastei 45,90 no mercado', 'posso fazer uma retirada de 3 mil?', 'resumo', '🎙️ ou mande um áudio'];

function useCountdown(until: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  if (!until) return null;
  const ms = Math.max(0, new Date(until).getTime() - now);
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
}

export function WhatsAppCard() {
  const { data } = useWhatsApp();
  const start = useStartWhatsAppLink();
  const update = useUpdateWhatsApp();
  const unlink = useUnlinkWhatsApp();
  const [phone, setPhone] = useState('');
  const [pending, setPending] = useState<WhatsAppLinkStart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const link = data?.link;
  const countdown = useCountdown(link?.status === 'pending' ? link.codeExpiresAt : null);
  const expired = countdown === '0:00';

  const begin = async () => {
    setError(null);
    try {
      setPending(await start.mutateAsync(phone));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível gerar o código.');
    }
  };

  return (
    <Card id="whatsapp">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base">
          <div className="icon-chip bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <MessageCircle className="h-4 w-4" aria-hidden />
          </div>
          WhatsApp
          {link?.status === 'verified' && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Vinculado</span>
          )}
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">Lance gastos por texto ou áudio, pergunte se pode fazer uma retirada e receba alertas e o check-in da semana.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        ) : !data.featureEnabled ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">A IA no WhatsApp faz parte do Dono App.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/planos">Ver planos</Link>
            </Button>
          </div>
        ) : link?.status === 'verified' ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <Smartphone className="h-4 w-4 text-slate-400" /> {link.phoneMasked}
              </p>
              <Button variant="ghost" size="sm" className="text-red-500" disabled={unlink.isPending} onClick={() => window.confirm('Desvincular este número do Finzup?') && unlink.mutate()}>
                Desvincular
              </Button>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox className="mt-0.5" checked={link.alertsEnabled} onCheckedChange={(v) => update.mutate({ alertsEnabled: v === true })} aria-label="Alertas" />
                <span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">Alertas</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">Retirada acima do limite, caixa da empresa abaixo da reserva, caixa pessoal negativo.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <Checkbox className="mt-0.5" checked={link.weeklyCheckinEnabled} onCheckedChange={(v) => update.mutate({ weeklyCheckinEnabled: v === true })} aria-label="Check-in semanal" />
                <span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">Check-in semanal</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">Resumo da semana e lembrete para mandar os gastos.</span>
                </span>
              </label>
              {link.weeklyCheckinEnabled && (
                <div className="grid grid-cols-2 gap-2 pl-7">
                  <Select value={String(link.checkinWeekday)} onValueChange={(v) => update.mutate({ checkinWeekday: Number(v) })}>
                    <SelectTrigger aria-label="Dia do check-in">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((d, i) => (
                        <SelectItem key={d} value={String(i)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={String(link.checkinHour)} onValueChange={(v) => update.mutate({ checkinHour: Number(v) })}>
                    <SelectTrigger aria-label="Hora do check-in">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h}h
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Experimente mandar</p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((e) => (
                  <span key={e} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : link?.status === 'pending' && !expired ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Para provar que o número {link.phoneMasked} é seu, mande esta mensagem do seu WhatsApp {data.businessNumber ? 'para o Finzup' : 'para o número do Finzup'}:
            </p>
            {pending ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <span className="font-mono text-xl font-bold tracking-widest text-emerald-700 dark:text-emerald-300">{pending.messageText}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Copiar código"
                  onClick={async () => {
                    await navigator.clipboard?.writeText(pending.messageText).catch(() => undefined);
                    setCopied(true);
                  }}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-amber-600 dark:text-amber-400">O código só aparece na hora em que é gerado. Gere um novo para ver.</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {pending?.waLink && (
                <Button asChild>
                  <a href={pending.waLink} target="_blank" rel="noreferrer">
                    Abrir o WhatsApp <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {phone ? (
                <Button variant="outline" onClick={begin} disabled={start.isPending}>
                  Gerar novo código
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => { setPending(null); unlink.mutate(); }} disabled={unlink.isPending}>
                Trocar número
              </Button>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguardando sua mensagem · expira em {countdown}
              </span>
            </div>
          </div>
        ) : (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              void begin();
            }}
          >
            <Label htmlFor="wa-phone">Seu número com DDD</Label>
            <div className="flex gap-2">
              <Input
                id="wa-phone"
                inputMode="tel"
                placeholder="(11) 99999-8888"
                value={phone}
                onChange={(e) => setPhone(maskPhoneInput(e.target.value))}
                autoComplete="tel"
              />
              <Button type="submit" disabled={normalizePhoneDigits(phone).length < 10 || start.isPending || !data.configured}>
                {start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Vincular'}
              </Button>
            </div>
            {!data.configured && <p className="text-xs text-amber-600 dark:text-amber-400">O número oficial do Finzup no WhatsApp ainda não foi ativado neste ambiente.</p>}
            {expired && <p className="text-xs text-slate-500">O código anterior expirou. Gere um novo.</p>}
          </form>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
