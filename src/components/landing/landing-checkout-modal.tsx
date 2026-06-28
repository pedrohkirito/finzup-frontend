'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Check,
  Sparkles,
  Star,
  Zap,
  Copy,
  Lock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BILLING_PLANS,
  BILLING_PLAN_ORDER,
  type BillingPlanId,
  formatPriceParts,
  planDiscountPercent,
  planPriceIntervalSuffix,
  formatBRL,
} from '@/constants/billing-plans';
import { api, ApiError } from '@/lib/api';
import { cpfSchema, emailSchema, fullNameSchema } from '@/lib/validators';
import { maskCpfInput } from '@/lib/cpf';
import {
  trackLandingCheckoutModalOpened,
  trackInitiateCheckout,
  trackCheckoutCompleted,
} from '@/lib/funnel-analytics';

type ModalStep = 'plan' | 'checkout' | 'pix' | 'success';
type PaymentMethod = 'pix' | 'credit_card';

const PLAN_ICONS: Record<BillingPlanId, typeof Zap> = {
  monthly: Zap,
  semester: Star,
  annual: Sparkles,
};

const checkoutSchema = z
  .object({
    name: fullNameSchema,
    cpf: cpfSchema,
    email: emailSchema,
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade',
    }),
    paymentMethod: z.enum(['pix', 'credit_card']),
    cardNumber: z.string().optional(),
    expiryMonth: z.string().optional(),
    expiryYear: z.string().optional(),
    ccv: z.string().optional(),
    postalCode: z.string().optional(),
    addressNumber: z.string().optional(),
    phone: z.string().optional(),
    installmentCount: z.number().int().min(1).max(12).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== 'credit_card') return;
    if (!data.cardNumber?.replace(/\s/g, '').match(/^\d{13,19}$/)) ctx.addIssue({ code: 'custom', message: 'Número do cartão inválido', path: ['cardNumber'] });
    if (!data.expiryMonth?.match(/^\d{2}$/)) ctx.addIssue({ code: 'custom', message: 'Mês inválido', path: ['expiryMonth'] });
    if (!data.expiryYear?.match(/^\d{4}$/)) ctx.addIssue({ code: 'custom', message: 'Ano inválido', path: ['expiryYear'] });
    if (!data.ccv?.match(/^\d{3,4}$/)) ctx.addIssue({ code: 'custom', message: 'CVV inválido', path: ['ccv'] });
    if (!data.postalCode?.replace(/\D/g, '').match(/^\d{8}$/)) ctx.addIssue({ code: 'custom', message: 'CEP inválido', path: ['postalCode'] });
    if (!data.addressNumber?.trim()) ctx.addIssue({ code: 'custom', message: 'Número obrigatório', path: ['addressNumber'] });
    if (!data.phone?.replace(/\D/g, '').match(/^\d{10,11}$/)) ctx.addIssue({ code: 'custom', message: 'Telefone inválido', path: ['phone'] });
  });

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type CheckoutStartResponse = {
  orderId: string;
  status: 'awaiting_payment' | 'paid';
  amount: number;
  planLabel: string;
  email: string;
  needsPasswordSetup?: boolean;
  pix?: { encodedImage: string; payload: string; expirationDate: string };
};

interface LandingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: BillingPlanId;
  skipPlanStep?: boolean;
}

export function LandingCheckoutModal({
  isOpen,
  onClose,
  initialPlan = 'annual',
  skipPlanStep = false,
}: LandingCheckoutModalProps) {
  const [step, setStep] = useState<ModalStep>(skipPlanStep ? 'checkout' : 'plan');
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanId>(initialPlan);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pixData, setPixData] = useState<CheckoutStartResponse['pix'] | null>(null);
  const [successEmail, setSuccessEmail] = useState('');
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const trackedOpenRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(skipPlanStep ? 'checkout' : 'plan');
      setSelectedPlan(initialPlan);
      setOrderId(null);
      setPixData(null);
      setCheckoutError(null);
      setSuccessEmail('');
      setNeedsPasswordSetup(true);
      if (!trackedOpenRef.current) {
        trackedOpenRef.current = true;
        trackLandingCheckoutModalOpened(initialPlan);
      }
    } else {
      trackedOpenRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [isOpen, initialPlan, skipPlanStep]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'pix',
      acceptedTerms: false,
      installmentCount: 1,
    },
  });

  const paymentMethod = form.watch('paymentMethod');

  const startPolling = useCallback((id: string, email: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.get<{ status: string; needsPasswordSetup?: boolean }>(
          `/billing/checkout/${id}/status`,
        );
        if (status.status === 'paid') {
          if (pollRef.current) clearInterval(pollRef.current);
          setSuccessEmail(email);
          setNeedsPasswordSetup(status.needsPasswordSetup ?? true);
          setStep('success');
          trackCheckoutCompleted(selectedPlan);
        }
      } catch {
        // continua polling
      }
    }, 3000);
  }, [selectedPlan]);

  const handlePlanSelect = (plan: BillingPlanId) => {
    setSelectedPlan(plan);
    setStep('checkout');
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    setCheckoutError(null);
    trackInitiateCheckout(selectedPlan);

    try {
      const body: Record<string, unknown> = {
        name: data.name.trim(),
        cpf: data.cpf,
        email: data.email,
        plan: selectedPlan,
        paymentMethod: data.paymentMethod,
        acceptedTerms: true,
      };

      if (data.paymentMethod === 'credit_card') {
        body.creditCard = {
          holderName: data.name.trim(),
          number: data.cardNumber?.replace(/\s/g, ''),
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          ccv: data.ccv,
        };
        body.creditCardHolderInfo = {
          name: data.name.trim(),
          email: data.email,
          cpfCnpj: data.cpf,
          postalCode: data.postalCode?.replace(/\D/g, ''),
          addressNumber: data.addressNumber,
          phone: data.phone?.replace(/\D/g, ''),
        };
        if (data.installmentCount && data.installmentCount > 1) {
          body.installmentCount = data.installmentCount;
        }
      }

      const result = await api.post<CheckoutStartResponse>('/billing/checkout/start', body);
      setOrderId(result.orderId);

      if (result.status === 'paid') {
        setSuccessEmail(result.email);
        setNeedsPasswordSetup(result.needsPasswordSetup ?? true);
        setStep('success');
        trackCheckoutCompleted(selectedPlan);
        return;
      }

      if (result.pix) {
        setPixData(result.pix);
        setStep('pix');
        startPolling(result.orderId, result.email);
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
  const isCompactStep = step === 'checkout' || step === 'pix' || step === 'success';

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className={`fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-full -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl focus:outline-none dark:border-slate-800 dark:bg-slate-950 ${
            isCompactStep ? 'max-w-md' : 'max-w-2xl'
          }`}
        >
          <Dialog.Title className="sr-only">Assinar Finzup</Dialog.Title>

          {step !== 'success' && (
            <Dialog.Close className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar">
              <X className="h-5 w-5" />
            </Dialog.Close>
          )}

          <ScrollArea className="flex-1">
            <div className="p-5 sm:p-6">
            {step === 'plan' && (
              <PlanStep selectedPlan={selectedPlan} onSelect={handlePlanSelect} />
            )}

            {step === 'checkout' && (
              <CheckoutStep
                form={form}
                plan={selectedPlan}
                paymentMethod={paymentMethod}
                error={checkoutError}
                isSubmitting={isSubmitting}
                showBack={!skipPlanStep}
                onBack={() => setStep('plan')}
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

function PlanStep({ selectedPlan, onSelect }: { selectedPlan: BillingPlanId; onSelect: (p: BillingPlanId) => void }) {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Escolha seu plano</h2>
        <p className="mt-1 text-sm text-slate-500">Pagamento seguro · cancele quando quiser</p>
      </div>
      <div className="space-y-3">
        {BILLING_PLAN_ORDER.map((planId) => {
          const p = BILLING_PLANS[planId];
          const Icon = PLAN_ICONS[planId];
          const discount = planDiscountPercent(planId);
          const { int, dec } = formatPriceParts(p.total);
          const intervalSuffix = planPriceIntervalSuffix(p.intervalMonths);
          return (
            <button
              key={planId}
              type="button"
              onClick={() => onSelect(planId)}
              className={`relative w-full rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 sm:p-5 ${
                selectedPlan === planId
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-950/30'
                  : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              {planId === 'annual' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">Mais popular</span>
              )}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-950">
                    <Icon className="h-4 w-4 text-brand-600" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.description}</p>
                    <p className="mt-1 text-xs font-medium text-brand-600">{p.aiCredits} créditos de IA</p>
                  </div>
                </div>
                <div className="text-right">
                  {discount != null && discount > 0 && (
                    <span className="mb-1 inline-block rounded-full bg-brand-green-100 px-2 py-0.5 text-xs font-bold text-brand-green-700">-{discount}%</span>
                  )}
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                    R$ {int},{dec}<span className="text-sm font-normal text-slate-500">{intervalSuffix}</span>
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
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
  error,
  isSubmitting,
  showBack,
  onBack,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<CheckoutFormData>>;
  plan: BillingPlanId;
  paymentMethod: PaymentMethod;
  error: string | null;
  isSubmitting: boolean;
  showBack: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const planConfig = BILLING_PLANS[plan];
  const { register, setValue, watch, formState: { errors } } = form;
  const acceptedTerms = watch('acceptedTerms');
  const installmentCount = watch('installmentCount');
  const maxInstallments = plan === 'annual' ? 12 : plan === 'semester' ? 6 : 1;
  const showInstallments = paymentMethod === 'credit_card' && maxInstallments > 1;

  return (
    <div>
      {showBack && (
        <button type="button" onClick={onBack} className="mb-4 text-xs text-slate-400 hover:text-slate-600">
          ← Trocar plano
        </button>
      )}

      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Você selecionou</p>
      <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-white">Plano {planConfig.label}</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Forma de pagamento</p>
          <div className="grid grid-cols-2 gap-2">
            {(['pix', 'credit_card'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setValue('paymentMethod', method, { shouldValidate: true })}
                className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                  paymentMethod === method
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-950/40'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {method === 'pix' ? 'PIX' : 'Cartão'}
                </span>
                <span className="text-xs text-slate-500">
                  {method === 'pix' ? 'Na hora' : 'Renova auto'}
                </span>
              </button>
            ))}
          </div>
        </div>

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
            placeholder="CPF"
            className={leanInputClass}
            {...register('cpf', {
              onChange: (event) => {
                event.target.value = maskCpfInput(event.target.value);
              },
            })}
          />
          <FieldError message={errors.cpf?.message} />
        </div>

        {paymentMethod === 'credit_card' && (
          <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            {showInstallments && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setValue('installmentCount', 1)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold ${
                    (installmentCount ?? 1) === 1
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40'
                      : 'border-slate-200 text-slate-500 dark:border-slate-700'
                  }`}
                >
                  À vista
                </button>
                <button
                  type="button"
                  onClick={() => setValue('installmentCount', maxInstallments)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold ${
                    (installmentCount ?? 1) > 1
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40'
                      : 'border-slate-200 text-slate-500 dark:border-slate-700'
                  }`}
                >
                  Até {maxInstallments}x
                </button>
              </div>
            )}
            <Input
              id="cardNumber"
              placeholder="Número do cartão"
              className={leanInputClass}
              {...register('cardNumber')}
            />
            <FieldError message={errors.cardNumber?.message} />
            <div className="grid grid-cols-3 gap-2">
              <Input id="expiryMonth" placeholder="MM" maxLength={2} className={leanInputClass} {...register('expiryMonth')} />
              <Input id="expiryYear" placeholder="AAAA" maxLength={4} className={leanInputClass} {...register('expiryYear')} />
              <Input id="ccv" placeholder="CVV" maxLength={4} className={leanInputClass} {...register('ccv')} />
            </div>
            <Input id="phone" placeholder="Telefone" className={leanInputClass} {...register('phone')} />
            <FieldError message={errors.phone?.message} />
            <div className="grid grid-cols-2 gap-2">
              <Input id="postalCode" placeholder="CEP" className={leanInputClass} {...register('postalCode')} />
              <Input id="addressNumber" placeholder="Número" className={leanInputClass} {...register('addressNumber')} />
            </div>
            <FieldError message={errors.postalCode?.message ?? errors.addressNumber?.message} />
          </div>
        )}

        <label htmlFor="terms" className="flex cursor-pointer items-start gap-2.5">
          <Checkbox
            id="terms"
            checked={acceptedTerms === true}
            className="mt-0.5"
            onCheckedChange={(v) => setValue('acceptedTerms', v === true, { shouldValidate: true })}
          />
          <span className="text-xs leading-relaxed text-slate-500">
            Li e aceito os{' '}
            <Link href="/termos-de-uso" target="_blank" className="text-brand-600 hover:underline">Termos</Link>
            {' '}e a{' '}
            <Link href="/politica-de-privacidade" target="_blank" className="text-brand-600 hover:underline">Privacidade</Link>
          </span>
        </label>
        <FieldError message={errors.acceptedTerms?.message} />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-medium text-slate-500">Total</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">R$ {formatBRL(planConfig.total)}</span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-brand-500 text-base font-bold hover:bg-brand-600"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</>
          ) : paymentMethod === 'pix' ? (
            'Gerar PIX'
          ) : (
            'Pagar agora'
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 pb-1 text-[11px] text-slate-400">
          <Lock className="h-3 w-3" />
          Pagamento processado com segurança pela Asaas
        </p>
      </form>
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
          Enviamos um email para <strong className="text-slate-900 dark:text-white">{email}</strong> para você criar sua senha e acessar o Finzup. Confira a caixa de entrada (e o spam).
        </p>
      ) : (
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Sua assinatura está ativa. Faça login para acessar.
        </p>
      )}
      <Link
        href={needsPasswordSetup ? '/ativar-acesso' : '/login'}
        onClick={onClose}
        className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-600"
      >
        {needsPasswordSetup ? 'Já recebi o email — Ativar acesso' : 'Entrar no Finzup'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
