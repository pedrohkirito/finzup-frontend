# Análise do funil de conversão — Finzup

Período analisado (baseline): **últimos 7 dias antes do checkout customizado**  
Objetivo: priorizar melhorias para **aumentar vendas (trials iniciados)**.

> **Atualização jun/2026:** checkout customizado com Stripe Payment Element embarcado na `/assinatura` foi implementado. Os números abaixo são o **baseline histórico**; use-os para comparar após o deploy.

---

## Visão geral do funil (baseline)

| Etapa | Usuários | Taxa |
|-------|----------|------|
| Visitou a landing | 256 | 100% |
| Clicou no CTA | 41 | 16% |
| Completou cadastro | 17 | 6,6% do total |
| Viu `/assinatura` | ~13–15 | — |
| Iniciou checkout (`checkout_initiated`) | 12 | 80% dos que viram assinatura |
| Iniciou trial | 3 | **25% dos checkouts** |

**Conversão landing → trial: ~1,2%** (3 de 256).

No baseline, o checkout redirecionava para a **página hospedada da Stripe**. Abandonos após `checkout_initiated` misturavam saída do site, fricção do cartão e falhas de webhook.

---

## Funis detalhados (Mixpanel — baseline)

### 1. Landing + Registro (4 etapas)

- **Conversão geral:** 6,64%
- `page_viewed` → 256 (100%)
- `landing_cta_clicked` → 41 (16,02%)
- `registration_started` → 41 (100%)
- `registration_completed` → 17 (41,46%)

### 2. Email verificado (2 etapas)

- **Conversão geral:** 39,39%
- `verify_email_page_viewed` → 33 (100%)
- `subscription_page_viewed` → 13 (39,39%)

### 3. Checkout finalizado (3 etapas — baseline)

- **Conversão geral:** 20%
- `subscription_page_viewed` → 15 (100%)
- `checkout_initiated` → 12 (80%)
- `trial_started` → 3 (25%)

### 4. Checkout cancelado (3 etapas — baseline)

- **Conversão geral:** 13,33%
- `subscription_page_viewed` → 15 (100%)
- `checkout_initiated` → 12 (80%)
- `checkout_canceled` → 2 (16,67%)

> Dos 12 checkouts iniciados: 3 trials, 2 cancelamentos explícitos e **~7 abandonos silenciosos** (maioria no fluxo antigo com redirect Stripe).

### 5. Funil pós-implementação (recomendado no Mixpanel)

Após o deploy do checkout customizado, recriar o funil com a etapa intermediária:

| Ordem | Evento | Descrição |
|-------|--------|-----------|
| 6 | `subscription_page_viewed` | Usuário na `/assinatura` (passo 1: planos) |
| 7 | `checkout_initiated` | Plano selecionado; sessão Stripe criada |
| 7b | `checkout_form_viewed` | Payment Element exibido (passo 2: pagamento) |
| 8 | `trial_started` | Teste ativado |

`checkout_canceled` dispara quando o usuário volta do passo 2 para a escolha de planos.

---

## Implementação realizada — checkout customizado (jun/2026)

### O que mudou no produto

| Antes | Depois |
|-------|--------|
| Redirect para Checkout hospedado na Stripe | Checkout em **2 passos** na `/assinatura`: planos → pagamento |
| Usuário saía do Finzup | **Payment Element** embutido; permanece no domínio Finzup |
| Mensagem genérica de cartão | Copy de confiança: R$ 0 hoje, Stripe processa pagamento, sem armazenar cartão |
| Um evento entre plano e trial | `checkout_form_viewed` para medir abandono no formulário |

### Fluxo atual (`/assinatura`)

1. **Passo 1 — Planos:** `PlanPicker` → `checkout_initiated`
2. **Passo 2 — Pagamento:** `SubscriptionCheckout` (Stripe Elements) → `checkout_form_viewed`
3. **Processamento:** polling + webhook → `trial_started` → redirect `/dashboard`

### Backend

- `POST /billing/checkout-session` com `ui_mode: 'elements'` → retorna `{ clientSecret, sessionId }`
- `GET /billing/checkout-session/:sessionId/status` (autenticado; valida dono da sessão)
- `getOrCreateStripeCustomer`: recria customer se o ID salvo não existir na conta Stripe atual
- Webhooks inalterados: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

### Frontend

- `@stripe/stripe-js` + `@stripe/react-stripe-js`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (mesma conta do backend)
- Resumo do pedido com preço real (`/ano`, `/semestre`, `/mês`) + equivalente mensal
- Timeline do teste, selos de segurança (Stripe, PCI), link de suporte

### Deploy em produção (checklist)

- [ ] `STRIPE_WEBHOOK_SECRET` (modo Live) no backend
- [ ] Endpoint Live: `https://finzup.com.br/api/v1/webhooks/stripe`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...` no build do frontend
- [ ] Price IDs Live alinhados com `sk_live_...`
- [ ] `SKIP_STRIPE_BILLING` **desligado** em produção

---

## Prioridades (ordem de execução)

### Prioridade 1 — Checkout → trial

**Problema (baseline):** 12 iniciaram checkout, só 3 viraram trial. Apenas 2 cancelaram explicitamente — ~7 abandonaram em silêncio.

**Implementado:**

- [x] Payment Element embutido na `/assinatura` (sem redirect para Stripe Hosted Checkout)
- [x] Passo 2 com resumo do pedido, timeline do teste e mensagens de confiança (Stripe, R$ 0 hoje, sem armazenar cartão)
- [x] Evento `checkout_form_viewed` para medir abandono no formulário de pagamento
- [x] `checkout_canceled` ao voltar da etapa de pagamento
- [x] Recuperação de `stripeCustomerId` órfão (troca de conta Stripe test → live)

**Medir após deploy (próximos 7–14 dias):**

- [ ] Funil `checkout_initiated` → `checkout_form_viewed` → `trial_started`
- [ ] Taxa `checkout_form_viewed` → `trial_started` vs. baseline de 25% (`checkout_initiated` → `trial_started`)
- [ ] Breakdown por `plan` (monthly vs annual — valor anual ainda pode assustar)
- [ ] Abandonos: campo incompleto vs. erro de cartão vs. 3DS (Stripe Dashboard + logs)
- [ ] Falha de webhook: usuário paga mas polling expira antes de `trial_started`

**Impacto esperado:** subir de 25% → 40–50% na etapa checkout → trial **dobra ou quase dobra os trials** sem mexer no topo do funil. Validar com dados reais.

---

### Prioridade 2 — Email verificado → página de assinatura

**Problema:** 33 viram a página de verificação, só 13 chegaram em `/assinatura` (~60% de perda).

**Por que acontece:**

- Cadastro **não autentica** até verificar o email — quem não clica no link fica parado.
- A página de verificação diz *“Já confirmou seu email? Você pode fechar esta aba”* — incentiva abandono em vez de levar ao próximo passo.
- O email de boas-vindas (com CTA para `/assinatura`) só é enviado **depois** da verificação — quem não verifica não recebe esse empurrão.

**O que atacar:**

- [ ] Trocar o texto da página de espera por CTA claro: “Abra o email e clique no link para ativar seu teste”.
- [ ] Email de verificação mais orientado à conversão (“1 clique para seus 7 dias grátis”).
- [ ] Sequência de lembrete (D+0, D+1, D+3) para quem cadastrou mas não verificou.
- [ ] Considerar login social (Google) para reduzir fricção de senha + verificação.

**Impacto estimado:** recuperar metade desses 20 usuários = **+10 na assinatura**, potencialmente +8 checkouts.

---

### Prioridade 3 — Conclusão do cadastro

**Problema:** 41 abriram `/register`, 17 completaram (58% de abandono).

**Por que acontece:**

- Senha com 4 regras (8 chars, maiúscula, minúscula, número).
- Dois checkboxes obrigatórios (termos + marketing pré-marcado).
- Mensagem “Passo 1 de 2” pode gerar ansiedade antes de ver valor.

**O que atacar:**

- [ ] Simplificar senha no cadastro (ex.: mínimo 8 caracteres, reforço depois).
- [ ] Tornar marketing opt-in **desmarcado por padrão** (menos atrito visual e legal).
- [ ] Mostrar prova social ou benefício concreto ao lado do formulário.
- [ ] Medir em qual campo o usuário desiste (eventos Mixpanel por campo).

**Impacto estimado:** passar de 42% → 60% de conclusão = **+7 cadastros/semana**.

---

### Prioridade 4 — Landing → clique no CTA

**Problema:** 256 visitantes, 41 cliques (16%). Maior volume absoluto de perda (215 pessoas), mas visitantes frios.

**O que atacar:**

- [ ] Breakdown por `utm_source` / `cta_location` — pode ser tráfego ruim, não só landing fraca.
- [ ] Hero: o CTA “Começar grátis” compete com “Ver planos e preços” — testar CTA único mais forte.
- [ ] Reforçar dor + prova (mock do produto já existe na landing).
- [ ] Testar headline focada no diferencial (“pare de recomeçar do zero todo mês”).

**Impacto estimado:** +5 pp no CTA (16% → 21%) ≈ **+13 cadastros/semana**, mas com menor taxa de conversão até o fim do funil.

---

## Resumo visual

### Baseline (redirect Stripe)

```
Landing 256
  └─ 16% ⚠️ volume ──► CTA 41
                          └─ 100% ──► Register 41
                                          └─ 42% ⚠️ ──► Cadastro OK 17
                                                              └─ ~76% ──► /assinatura ~13
                                                                              └─ 80% ✓ ──► Checkout 12
                                                                                              └─ 25% 🔴 ──► Trial 3
```

### Fluxo atual (checkout customizado)

```
/assinatura — Passo 1 (planos)
  └─ checkout_initiated
        └─ Passo 2 (Payment Element)
              └─ checkout_form_viewed
                    ├─ checkout_canceled (voltou)
                    └─ trial_started → /dashboard
```

---

## Tabela de prioridades

| Prioridade | Área | Status | Motivo |
|------------|------|--------|--------|
| **1** | Checkout → trial | **Implementado** — medir impacto | Maior ROI; leads quentes; baseline 75% de perda |
| **2** | Pós-verificação de email | Pendente | Usuários engajados que somem antes de ver o plano |
| **3** | Formulário de cadastro | Pendente | Gargalo médio, relativamente fácil de iterar |
| **4** | Landing / CTA | Pendente | Volume alto, intenção menor; validar tráfego antes de redesign |

---

## Validação de dados

Alguns números do baseline não fecham perfeitamente (ex.: 17 cadastros vs 33 views em `verify_email_page_viewed`). Recomendações:

1. Recriar funil de **mesmo usuário** no Mixpanel com `checkout_form_viewed` — ver [`mixpanel-funnel.md`](./mixpanel-funnel.md).
2. Adicionar breakdowns por `utm_source`, `plan` e dispositivo.
3. Cruzar com Stripe Dashboard: abandonos no Payment Element vs. falha de webhook vs. tracking.
4. Comparar **7 dias pós-deploy** com o baseline acima.

---

## Referências no código

| Área | Arquivo |
|------|---------|
| Eventos do funil | `src/lib/funnel-analytics.ts` |
| Página de assinatura (fluxo planos → checkout → processamento) | `src/app/assinatura/page-content.tsx` |
| Checkout customizado (Payment Element) | `src/components/billing/subscription-checkout.tsx` |
| Resumo do pedido | `src/components/billing/checkout-plan-summary.tsx` |
| Stripe (frontend) | `src/lib/stripe.ts` |
| Cadastro | `src/app/(auth)/register/page.tsx` |
| Verificação de email | `src/app/(auth)/verify-email/page.tsx` |
| Checkout Stripe (backend) | `finzup-backend/src/modules/billing/billing.service.ts` |
| Rotas de billing | `finzup-backend/src/modules/billing/billing.routes.ts` |
| Webhooks | `finzup-backend/src/modules/billing/billing.webhook.ts` |
| Guia Mixpanel | `docs/mixpanel-funnel.md` |

---

*Baseline gerado em junho/2026 (Mixpanel, últimos 7 dias). Atualizado em junho/2026 com a implementação do checkout customizado.*
