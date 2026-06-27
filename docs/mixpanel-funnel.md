# Mixpanel — Funil Landing → Teste Gratuito

Guia para configurar o funil de conversão no painel Mixpanel após o deploy.

## Pré-requisitos

1. Adicionar `NEXT_PUBLIC_MIXPANEL_TOKEN` no frontend (Vercel / `.env.local`)
2. Adicionar `MIXPANEL_TOKEN` no backend (mesmo project token)
3. Fazer deploy e aguardar eventos chegarem em **Events → Live View**

## Eventos do funil

| Ordem | Evento | Descrição |
|-------|--------|-----------|
| 1 | `page_viewed` | Toda navegação (filtro `path = /` para landing) |
| 2 | `landing_cta_clicked` | Clique em CTA da landing ou seção de preços |
| 3 | `registration_started` | Usuário abriu `/register` |
| 4 | `registration_completed` | Cadastro concluído com sucesso |
| 4b | `google_auth_completed` | Login/cadastro via Google (pula verificação de email) |
| 5 | `verify_email_page_viewed` | Página de espera ou link de verificação |
| 5b | `verification_email_resent` | Reenvio manual do email de verificação |
| 5c | `verify_email_poll_success` | Sessão detectada via "Já cliquei no link" |
| 6 | `email_verified` | Email confirmado (pula se Google ou `SKIP_EMAIL_VERIFICATION`) |
| 7 | `subscription_page_viewed` | Usuário viu `/assinatura` |
| 8 | `checkout_initiated` | Plano selecionado, sessão de checkout criada |
| 8b | `checkout_form_viewed` | Payment Element exibido (passo 2 do checkout customizado) |
| 9 | `trial_started` | Teste gratuito ativado (client + server deduplicados) |

## Funil com ramo Google

Para usuários que entram com Google, o fluxo pula `verify_email_page_viewed` e `email_verified`:

`registration_started` → `google_auth_completed` → `subscription_page_viewed` → …

Para cadastro email/senha:

`registration_completed` → `verify_email_page_viewed` → `email_verified` → `subscription_page_viewed` → …

## Criar o Funnel Report

1. **Reports → Funnels → Create**
2. Adicionar steps na ordem acima
3. Para o step 1, adicionar filtro: `path` equals `/`
4. Salvar como **"Landing → Trial Started"**

## Breakdowns recomendados

- **Por origem:** `utm_source`, `utm_medium`, `utm_campaign`
- **Por CTA:** `content_name`, `cta_location`
- **Por plano:** `plan` (em `checkout_initiated`, `checkout_form_viewed` e `trial_started`)

## Cohort de drop-off

1. **Users → Cohorts → Create**
2. Incluir usuários com `registration_completed` nos últimos 30 dias
3. Excluir usuários com `trial_started`
4. Usar para remarketing ou análise de abandono na página `/assinatura`

## Deduplicação client/server

O evento `trial_started` usa `$insert_id: trial_started_{userId}` em frontend e backend. O Mixpanel deduplica automaticamente dentro de 24h — conte apenas uma conversão por usuário.

## Identidade do usuário (`user_id`)

Eventos de funil usam o **ID do usuário no Finzup** como `distinct_id` sempre que possível:

1. **Cadastro** — a API retorna `userId`; o frontend chama `identify` + `alias` (mesmo browser) e registra `user_id` como super property.
2. **Verificação de email** — o backend envia `email_verified` com `distinct_id: userId` (fonte de verdade, inclusive no mobile). O frontend deduplica com `$insert_id: email_verified_{userId}`.
3. **Login / Google OAuth** — `identify(userId)` sem `alias` (novo dispositivo).
4. **Todos os eventos** — incluem a propriedade `user_id` quando o ID já é conhecido.

### Funis no Mixpanel

Use **"Performed by user with ID"** ou filtre/breakdown por propriedade `user_id` para unir eventos cross-device (ex.: cadastro no desktop, verificação no celular).

`trial_started` e `email_verified` usam `$insert_id` para deduplicar client + server.

## Propriedades de usuário

Após login/cadastro, o frontend chama `identify` com:
- `$email`
- `$name`

Super properties de UTM são registradas na primeira sessão (`utm_source`, `utm_medium`, etc.).
