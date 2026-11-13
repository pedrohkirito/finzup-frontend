'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  X,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Check,
  Copy,
  Lock,
  CreditCard,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ANNUAL_INSTALLMENT,
  BILLING_PLANS,
  type BillingPlanId,
  type CardChargeMode,
  formatBRL,
} from '@/constants/billing-plans';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { glassOverlayClassName, glassSurfaceClassName } from '@/lib/glass';
import { cpfSchema, emailSchema, fullNameSchema } from '@/lib/validators';
import { maskCpfInput } from '@/lib/cpf';
import {
  trackLandingCheckoutModalOpened,
} from '@/lib/funnel-analytics';
import { setKnownUserId } from '@/lib/mixpanel';
import {
  trackPurchase,
  type MetaPurchase,
} from '@/lib/meta-pixel';
import {
  CHECKOUT_RETURN_ORDER_KEY,
  getMetaBrowserContext,
  metaContextHeaders,
} from '@/lib/meta-attribution';

type ModalStep = 'checkout' | 'pix' | 'waiting' | 'success';
type PaymentMethod = 'pix' | 'credit_card';

const checkoutSchema = z
  .object({
    name: z.string().optional(),
    cpf: z.string().optional(),
    email: z.string().optional(),
    paymentMethod: z.enum(['pix', 'credit_card']),
    cardChargeMode: z.enum(['recurrent', 'installment']),
    marketingOptIn: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== 'pix') return;

    const nameResult = fullNameSchema.safeParse(data.name);
    if (!nameResult.success) {
      ctx.addIssue({
        code: 'custom',
        message: nameResult.error.issues[0]?.message ?? 'Nome inválido',
        path: ['name'],
      });
    }

    const cpfResult = cpfSchema.safeParse(data.cpf);
    if (!cpfResult.success) {
      ctx.addIssue({
        code: 'custom',
        message: cpfResult.error.issues[0]?.message ?? 'CPF ou CNPJ inválido',
        path: ['cpf'],
      });
    }

    const emailResult = emailSchema.safeParse(data.email);
    if (!emailResult.success) {
      ctx.addIssue({
        code: 'custom',
        message: emailResult.error.issues[0]?.message ?? 'E-mail inválido',
        path: ['email'],
      });
    }
  });

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type CheckoutStartResponse = {
  orderId: string;
  status: 'awaiting_payment' | 'paid';
  amount: number;
  planLabel: string;
  userId?: string | null;
  email?: string;
  needsPasswordSetup?: boolean;
  checkoutUrl?: string;
  pix?: { encodedImage: string; payload: string; expirationDate: string };
  purchase?: MetaPurchase;
};

type CheckoutStatusResponse = {
  status: string;
  userId?: string | null;
  email?: string;
  needsPasswordSetup?: boolean;
  purchase?: MetaPurchase;
};

function trackPaidPurchase(
  purchase?: MetaPurchase,
  userId?: string | null,
  email?: string,
) {
  if (!purchase) return;
  if (userId) {
    setKnownUserId(
      userId,
      email ? { email } : undefined,
      { linkAnonymous: true },
    );
  }
  trackPurchase(purchase);
}

interface LandingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: BillingPlanId;
  returnOrderId?: string | null;
}

export function LandingCheckoutModal({
  isOpen,
  onClose,
  initialPlan = 'annual',
  returnOrderId = null,
}: LandingCheckoutModalProps) {
  const [step, setStep] = useState<ModalStep>('checkout');
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanId>(initialPlan);
  const [pixData, setPixData] = useState<CheckoutStartResponse['pix'] | null>(null);
  const [successEmail, setSuccessEmail] = useState('');
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const trackedOpenRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'pix',
      cardChargeMode: 'recurrent',
      marketingOptIn: false,
    },
  });

  const startPolling = useCallback((id: string, email: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.get<CheckoutStatusResponse>(
          `/billing/checkout/${id}/status`,
          { headers: metaContextHeaders() },
        );
        if (status.status === 'paid') {
          if (pollRef.current) clearInterval(pollRef.current);
          setSuccessEmail(email || status.email || '');
          setNeedsPasswordSetup(status.needsPasswordSetup ?? true);
          setStep('success');
          trackPaidPurchase(status.purchase, status.userId, status.email || email);
        }
      } catch {
        // continua polling
      }
    }, 3000);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      trackedOpenRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    if (returnOrderId) {
      setStep('waiting');
      setCheckoutError(null);
      startPolling(returnOrderId, '');
      return;
    }

    setStep('checkout');
    setSelectedPlan(initialPlan);
    setPixData(null);
    setCheckoutError(null);
    setSuccessEmail('');
    setNeedsPasswordSetup(true);
    form.reset({ paymentMethod: 'pix', cardChargeMode: 'recurrent', marketingOptIn: false });
    if (!trackedOpenRef.current) {
      trackedOpenRef.current = true;
      trackLandingCheckoutModalOpened(initialPlan);
    }
  }, [isOpen, initialPlan, returnOrderId, startPolling]);

  const paymentMethod = form.watch('paymentMethod');
  const cardChargeMode = form.watch('cardChargeMode') ?? 'recurrent';

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const cardChargeModePayload =
        selectedPlan === 'annual' && data.paymentMethod === 'credit_card'
          ? data.cardChargeMode
          : 'recurrent';

      const payload =
        data.paymentMethod === 'pix'
          ? {
              name: data.name?.trim(),
              cpf: data.cpf,
              email: data.email,
              plan: selectedPlan,
              paymentMethod: data.paymentMethod,
              acceptedTerms: true,
              marketingOptIn: data.marketingOptIn,
              meta: getMetaBrowserContext(),
            }
          : {
              plan: selectedPlan,
              paymentMethod: data.paymentMethod,
              cardChargeMode: cardChargeModePayload,
              acceptedTerms: true,
              marketingOptIn: data.marketingOptIn,
              meta: getMetaBrowserContext(),
            };

      const result = await api.post<CheckoutStartResponse>('/billing/checkout/start', payload);

      if (result.status === 'paid') {
        setSuccessEmail(result.email ?? '');
        setNeedsPasswordSetup(result.needsPasswordSetup ?? true);
        setStep('success');
        trackPaidPurchase(result.purchase, result.userId, result.email);
        return;
      }

      if (result.checkoutUrl) {
        try {
          sessionStorage.setItem(CHECKOUT_RETURN_ORDER_KEY, result.orderId);
        } catch {
          // O retorno da Asaas ainda traz o pedido na URL.
        }
        window.location.href = result.checkoutUrl;
        return;
      }

      if (result.pix) {
        setPixData(result.pix);
        setStep('pix');
        startPolling(result.orderId, result.email ?? '');
      }
    } catch (err) {
      setCheckoutError(err instanceof ApiError ? err.message : 'Erro ao processar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  });

  const copyPixPayload = async () => {
    if (!pixData?.payload) return;
    await navigator.clipboard.writeText(pixData.payload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const plan = BILLING_PLANS[selectedPlan];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn('fixed inset-0 z-50', glassOverlayClassName)} />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl focus:outline-none',
            glassSurfaceClassName,
          )}
        >
          <Dialog.Title className="sr-only">Assinar a Finzup</Dialog.Title>

          {step !== 'success' && (
            <Dialog.Close className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.08]" aria-label="Fechar">
              <X className="h-5 w-5" />
            </Dialog.Close>
          )}

          <ScrollArea className="flex-1">
            <div className="p-5 sm:p-6">
            {step === 'checkout' && (
              <CheckoutStep
                form={form}
                plan={selectedPlan}
                paymentMethod={paymentMethod}
                cardChargeMode={cardChargeMode}
                error={checkoutError}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
              />
            )}

            {step === 'pix' && pixData && (
              <PixStep
                pix={pixData}
                amount={plan.total}
                planLabel={plan.label}
                copied={copiedPix}
                onCopy={copyPixPayload}
              />
            )}

            {step === 'waiting' && <WaitingStep />}

            {step === 'success' && (
              <SuccessStep email={successEmail} needsPasswordSetup={needsPasswordSetup} onClose={onClose} />
            )}
            </div>
          </ScrollArea>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="px-0.5 text-xs text-red-500">{message}</p>;
}

const leanInputClass =
  'h-11 rounded-xl border-slate-200 bg-slate-50 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500';

function CheckoutStep({
  form,
  plan,
  paymentMethod,
  cardChargeMode,
  error,
  isSubmitting,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<CheckoutFormData>>;
  plan: BillingPlanId;
  paymentMethod: PaymentMethod;
  cardChargeMode: CardChargeMode;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  const planConfig = BILLING_PLANS[plan];
  const { register, setValue, formState: { errors } } = form;
  const showCardChargeModes = plan === 'annual' && paymentMethod === 'credit_card';
  const isInstallment = showCardChargeModes && cardChargeMode === 'installment';

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Você selecionou</p>
      <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">
        Plano {planConfig.label}
        <span className="mx-2 font-normal text-slate-400 dark:text-white">·</span>
        R$ {formatBRL(planConfig.total)}
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Forma de pagamento</p>
          <div className="grid grid-cols-2 gap-2">
            {(['pix', 'credit_card'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => {
                  setValue('paymentMethod', method, { shouldValidate: true });
                  if (method !== 'credit_card') {
                    setValue('cardChargeMode', 'recurrent');
                  }
                }}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  paymentMethod === method
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-950/40'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                {method === 'pix' ? (
                  <PixIcon />
                ) : (
                  <CreditCard className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-300" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    {method === 'pix' ? 'PIX' : 'Cartão'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {method === 'pix' ? 'Aprovação instantânea' : 'Renovação automática'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {showCardChargeModes ? (
          <div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setValue('cardChargeMode', 'recurrent')}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  cardChargeMode === 'recurrent'
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-950/40'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  À vista · R${formatBRL(planConfig.total)}/ano
                </span>
                <span className="text-xs text-slate-500">Renovação automática</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('cardChargeMode', 'installment')}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  cardChargeMode === 'installment'
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-950/40'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Em até {ANNUAL_INSTALLMENT.count}x de R${formatBRL(ANNUAL_INSTALLMENT.value)}
                </span>
                <span className="text-xs text-slate-500">
                  Total: R${formatBRL(ANNUAL_INSTALLMENT.total)} · Compra única
                </span>
              </button>
            </div>
            {isInstallment ? (
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Compra única em até {ANNUAL_INSTALLMENT.count}x de R$
                {formatBRL(ANNUAL_INSTALLMENT.value)} (total R${formatBRL(ANNUAL_INSTALLMENT.total)})
                — você escolhe as parcelas na próxima tela. Sem renovação automática; as parcelas
                seguem na fatura do cartão até quitar o total.
              </p>
            ) : null}
          </div>
        ) : null}

        {paymentMethod === 'pix' ? (
          <div className="space-y-2">
            <Input
              id="checkout-name"
              placeholder="Seu nome completo"
              className={leanInputClass}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />

            <Input
              id="checkout-email"
              type="email"
              placeholder="Seu e-mail (será seu login)"
              className={leanInputClass}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />

            <Input
              id="checkout-cpf"
              placeholder="CPF ou CNPJ"
              className={leanInputClass}
              {...register('cpf', {
                onChange: (event) => {
                  event.target.value = maskCpfInput(event.target.value);
                },
              })}
            />
            <FieldError message={errors.cpf?.message} />
          </div>
        ) : null}

        <CheckoutConsentNotice
          marketingOptIn={form.watch('marketingOptIn')}
          onMarketingOptInChange={(checked) =>
            form.setValue('marketingOptIn', checked, { shouldDirty: true })
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-brand-gradient relative h-14 w-full rounded-xl text-base font-bold"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</>
          ) : paymentMethod === 'pix' ? (
            <>
              Gerar PIX
              <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
            </>
          ) : (
            <>
              Continuar pagamento
              <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
            </>
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 pb-1 text-[11px] text-slate-400">
          <Lock className="h-3 w-3" />
          Pagamento processado com segurança via Asaas
        </p>
      </form>
    </div>
  );
}

function PixIcon() {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
      <img
        src="/images/pix-logo.svg"
        alt=""
        aria-hidden
        width={20}
        height={20}
        className="h-5 w-5 object-contain"
        draggable={false}
      />
    </span>
  );
}

function CheckoutConsentNotice({
  marketingOptIn,
  onMarketingOptInChange,
}: {
  marketingOptIn: boolean;
  onMarketingOptInChange: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-[11px] leading-relaxed text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Ao continuar, você concorda com os{' '}
        <Link href="/termos-de-uso" target="_blank" className="text-brand-600 hover:underline">
          Termos de Uso
        </Link>
        {' '}e a{' '}
        <Link href="/politica-de-privacidade" target="_blank" className="text-brand-600 hover:underline">
          Política de Privacidade
        </Link>
        . Mensagens sobre a conta e o suporte fazem parte do serviço.
      </p>
      <div className="flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        <Checkbox
          id="checkout-marketing"
          checked={marketingOptIn}
          onCheckedChange={(checked) => onMarketingOptInChange(checked === true)}
          className="mt-0.5"
        />
        <label htmlFor="checkout-marketing" className="cursor-pointer">
          Quero receber novidades e dicas da Finzup por e-mail.
        </label>
      </div>
    </div>
  );
}

function WaitingStep() {
  return (
    <div className="py-8 text-center">
      <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-brand-500" />
      <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Confirmando pagamento</h2>
      <p className="text-sm text-slate-500">
        Aguarde enquanto confirmamos seu pagamento. Isso pode levar alguns segundos.
      </p>
    </div>
  );
}

function PixStep({
  pix,
  amount,
  planLabel,
  copied,
  onCopy,
}: {
  pix: NonNullable<CheckoutStartResponse['pix']>;
  amount: number;
  planLabel: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="text-center">
      <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">Pague com PIX</h2>
      <p className="mb-4 text-sm text-slate-500">
        Plano {planLabel} · R$ {formatBRL(amount)}
      </p>
      <div className="mx-auto mb-4 inline-block rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700">
        <img src={`data:image/png;base64,${pix.encodedImage}`} alt="QR Code PIX" className="mx-auto h-48 w-48" />
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700"
      >
        {copied ? <Check className="h-4 w-4 text-brand-green-500" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copiado!' : 'Copiar código PIX'}
      </button>
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
        Aguardando pagamento — atualiza sozinho
      </div>
    </div>
  );
}

function SuccessStep({
  email,
  needsPasswordSetup,
  onClose,
}: {
  email: string;
  needsPasswordSetup: boolean;
  onClose: () => void;
}) {
  return (
    <div className="py-4 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-brand-green-500" />
      <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Pagamento confirmado!</h2>
      {needsPasswordSetup ? (
        <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Enviamos um email para <strong className="text-slate-900 dark:text-white">{email}</strong> para você criar sua senha e acessar a Finzup. Confira a caixa de entrada (e o spam).
        </p>
      ) : (
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Sua assinatura está ativa. Faça login para acessar.
        </p>
      )}
      <Link
        href={needsPasswordSetup ? '/ativar-acesso' : '/login'}
        onClick={onClose}
        className="btn-brand-gradient relative inline-flex items-center justify-center rounded-full px-8 py-4 pr-12 text-sm font-semibold"
      >
        {needsPasswordSetup ? 'Já recebi o email — Ativar acesso' : 'Entrar na Finzup'}
        <span className="btn-arrow-bg absolute right-3"><ChevronRight className="h-4 w-4" /></span>
      </Link>
    </div>
  );
}
