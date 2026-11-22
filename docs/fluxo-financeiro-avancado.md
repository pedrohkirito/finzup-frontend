# Fluxo financeiro avançado: telas e fluxos

Contrato da API: `finzup-backend/docs/contrato-fluxo-financeiro-avancado.md`.

Tudo é opcional. Quem não usar nada disso continua vendo e cadastrando exatamente como antes.

## Telas

| Tela | O que mudou |
|---|---|
| **Configurações** (`/dashboard/configuracoes`) | Cartões de crédito ganham o seletor **"Vence dia X"**: é o vencimento da fatura, usado no fluxo. Também chegam o cartão **Contas bancárias** (adicionar, renomear e remover, com aviso de que os lançamentos ficam sem conta; âncora `#contas`) e o cartão **Finanças da empresa (PJ)**, com um interruptor que liga ou desliga a separação PF/PJ. |
| **Novo método de pagamento** (diálogo) | Ao escolher Crédito, aparece o campo opcional "Vencimento da fatura". |
| **Receitas, Doações, Investimentos e Despesas** (avulsas, fixas, parceladas, assinaturas e financiamentos) | Os formulários ganham o bloco recolhido **"Mais detalhes"**, com dia, conta e PF/PJ (detalhes abaixo). Os cards mostram "dia 5" ou "todo dia 5", o nome da conta e a etiqueta PF/PJ. |
| **Investimentos → Aportes** | Novo **"Aporte recorrente"** (repete ao fechar o mês). Os aportes agora também podem ser editados. |
| **Fluxo de caixa** (`/dashboard/fluxo`, novo item no menu lateral e no "Mais" do celular) | Saldo previsto dia a dia (detalhes abaixo). |
| **Resumo e Relatórios** | Com o PJ ligado, ganham a troca **Consolidado / PF / PJ**. No consolidado, o Resumo também mostra o cartão "Pessoa física × Empresa (PJ)", com o saldo de cada lado e um atalho para o fluxo. |
| **Fechamento do mês** (diálogo) | Lista os aportes recorrentes que serão repetidos. |

### Bloco "Mais detalhes" dos formulários

- **Dia.** Mostra "Dia X" nos lançamentos do mês e "Todo dia X" nos que repetem.
- **Conta.** Lista as contas do usuário, a opção "Sem conta" e "+ Nova conta", que cria uma conta ali mesmo. Também tem o link "Gerenciar", que leva às Configurações.
- **PF/PJ.** Só aparece com o PJ ligado ou quando o lançamento já é PJ.
- **Resumo e dica.** Quando fechado, o bloco mostra um resumo (por exemplo, "dia 5 · Itaú · PJ"). Quando aberto, mostra uma dica sobre o que acontece sem data.

### Página Fluxo de caixa

- **Filtros:** Consolidado/PF/PJ (com o PJ ligado) e conta ("Todas", uma conta específica ou "Sem conta").
- **Cartões de resumo:** entradas, saídas, saldo no fim do mês e menor saldo (com o dia).
- **Alerta:** em vermelho, quando o saldo fica negativo em algum dia.
- **Gráfico:** degraus com o saldo no fim de cada dia, linha do zero e marcação de "Hoje".
- **Bloco "Sem data · início do mês":** explica a regra e lista o que entra ali.
- **Dia a dia:** por padrão mostra só os dias com movimento (há a opção "Mostrar todos os dias"). Hoje fica destacado e os dias passados ficam esmaecidos. A fatura do cartão abre para mostrar as compras que a compõem.
- **Quebra por conta e PF × PJ:** aparece quando faz sentido.

## Regras mostradas ao usuário

- **Sem data:** o lançamento conta no **início do mês**.
- **Cartão de crédito:** as compras entram como uma saída só, **"Fatura <cartão>"**, no dia do vencimento. Por isso o saldo final do fluxo pode ser menor que o do Resumo, que deixa a fatura em aberto para o mês seguinte.
- **Visão Consolidado/PF/PJ:** a escolha fica guardada no navegador (`localStorage`, chave `finzup:scope-filter`) e vale para Resumo, Relatórios e Fluxo. Com o PJ desligado, a visão é sempre o consolidado.
- **Salvar um lançamento PJ** liga o PJ automaticamente (o backend faz isso), e a interface passa a mostrar as opções de PF/PJ.

## Assistente

- **Página do fluxo:** a página tem `pageKey: 'fluxo'`, com sugestão de abertura "analisar os dias de aperto". Ali a IA responde com o fluxo de caixa e pode ajustar dia, conta ou PF/PJ de lançamentos (com confirmação).
- **Atualização das telas:** depois de ações da IA com contas bancárias e de `set_entry_details`, as listas, o resumo e o fluxo são recarregados. Depois de qualquer cadastro, contas e perfil também são recarregados, porque a IA pode ter criado uma conta pelo nome ou ligado o PJ.

## Código

- **Tipos:** `src/types/index.ts` (`BankAccount`, `EntryExtras`, `FinanceScope`, `ScopeFilter`, `CashFlow*`, `ScopeBreakdown`).
- **Hooks:** `use-bank-accounts.ts`, `use-cash-flow.ts`, `use-finance-scope.ts` (`useScopeFilter`, `useBusinessEnabled`) e `use-month-summary.ts` (que agora aceita o `scope`).
- **Componentes:**
  - `components/finance/`: `entry-extras-fields.tsx` (o bloco "Mais detalhes" e o `entryExtrasFormShape` para os schemas zod), `entry-extras-meta.tsx`, `scope-switch.tsx` e `segmented-control.tsx`;
  - `components/settings/`: `bank-accounts-card.tsx` e `business-scope-card.tsx`;
  - `components/payment-methods/due-day-select.tsx`;
  - `components/fluxo/`: o gráfico, as movimentações e os rótulos;
  - `components/dashboard/scope-breakdown-card.tsx`.
