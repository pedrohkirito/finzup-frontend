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
- **Transferências** (só com o PJ ligado): cartão no fim da página para cadastrar, editar e remover pró-labore, distribuição de lucros, aporte na empresa e transferências entre contas. Campos: tipo, valor, direção (PJ → PF, PF → PJ ou entre contas do mesmo lado), conta de origem e de destino (opcionais), dia (opcional), nome (opcional, padrão = tipo) e "Repetir todo mês". No dia a dia, a transferência aparece com ponto azul e a rota ("PJ → PF · Inter → Nubank"). Quando os dois lados estão no filtro, aparece com "⇄" em cinza e "não muda o saldo".
- **Espaços (fase 1):** o cartão escolhe espaço de origem e de destino ("De" / "Para") em vez da direção, e ganhou o tipo **Retirada** (padrão empresa → Pessoal).

## Regras mostradas ao usuário

- **Sem data:** o lançamento conta no **início do mês**.
- **Cartão de crédito:** as compras entram como uma saída só, **"Fatura <cartão>"**, no dia do vencimento. Por isso o saldo final do fluxo pode ser menor que o do Resumo, que deixa a fatura em aberto para o mês seguinte.
- **Espaço aberto:** desde a fase 1, a troca Consolidado/PF/PJ virou o seletor de espaço no topo (ver abaixo). A escolha fica em `localStorage` (`finzup:space`) e vale para todas as telas.
- **Transferência não é receita nem despesa:** não entra nos totais de receitas/despesas. No resumo PF × PJ, cada lado mostra "Transferências +X / −Y" e o saldo do lado já as considera. No consolidado, PF ↔ PJ se anula.
- **Salvar um lançamento PJ** liga o PJ automaticamente (o backend faz isso), e a interface passa a mostrar as opções de PF/PJ.

## Assistente

- **Página do fluxo:** a página tem `pageKey: 'fluxo'`, com sugestão de abertura "analisar os dias de aperto". Ali a IA responde com o fluxo de caixa e pode ajustar dia, conta ou PF/PJ de lançamentos (com confirmação).
- **Atualização das telas:** depois de ações da IA com contas bancárias e de `set_entry_details`, as listas, o resumo e o fluxo são recarregados. Depois de `create/update/delete_transfer`, o mês (resumo, fluxo, transferências), as contas e o Método são recarregados. Depois de qualquer cadastro, contas e perfil também são recarregados, porque a IA pode ter criado uma conta pelo nome ou ligado o PJ.

## Fase 1 do Dono

| Tela | O que mudou |
|---|---|
| **Seletor de espaço** (topo do painel, desktop e celular) | "Tudo (consolidado)", "Pessoal", cada empresa e "Gerenciar empresas". Só aparece para quem tem empresa. Trocar recarrega os dados da tela; o `api.ts` manda o header `X-Finzup-Space`. |
| **Empresas** (`/dashboard/empresas`, novo no menu) | Criar (nome + CNPJ opcional), renomear, arquivar e excluir (só vazia). Sem o recurso no plano, mostra o convite de upgrade. Empresas acima do limite do plano aparecem bloqueadas. Aviso do contador (CRC). |
| **Formulários de lançamento** | O bloco "Mais detalhes" troca PF/PJ por **Espaço**; as categorias oferecidas são as do espaço escolhido. A etiqueta do card mostra o nome da empresa quando há mais de uma. |
| **Categorias** (`/dashboard/categorias`) | Criar, renomear, arquivar e restaurar categorias de despesa e receita, por espaço; botão para adicionar o conjunto padrão PF ou PJ. Os formulários criam categoria na hora ("+ Nova categoria"). |
| **Linguagem na empresa** (CRC) | Com uma empresa aberta: "Orçamentos" vira **"Limites de gasto"** e "Relatórios" vira **"Painel do dono"** / "Painel gerencial do dono", com o aviso de que formalização é com o contador. |
| **Planos** (`/dashboard/planos`) | Catálogo vindo do backend, assinatura e upgrade via Asaas (PIX com QR code ou cartão), histórico de cobranças. CFO de bolso e Conselho por contato. |
| **Painel interno** (`/dashboard/interno`) | Só para a equipe (`ADMIN_EMAILS` no backend): sinais de validação, métricas de uso e retenção e troca manual de plano. |
| **Contas e carteiras** (Configurações, `#contas`) | Tipo (banco, dinheiro, cartão pré-pago/benefício, outra), espaço, saldo inicial com o mês, **saldo atual** e "previsto R$ X em dez/26", e o saldo somado. Adicionar abre a edição para informar o saldo inicial. |
| **Simulador de investimentos** (CVM) | Aviso de rentabilidade hipotética e de que o Finzup não indica investimentos, com encaminhamento a um consultor CVM. |

## Fase 2 do Dono

| Tela | O que faz |
|---|---|
| **Extratos** (`/dashboard/importar`) | Envio de OFX ou CSV. Na revisão, cada linha tem categoria sugerida (por regra, histórico ou IA), duplicadas marcadas, ignorar e criar regra. Depois vêm a confirmação, o histórico e o desfazer. |
| **Pró-labore** (`/dashboard/pro-labore`) | Limite sustentável do mês por empresa (reserva mínima), "Posso retirar R$ X?", registro de retirada com alerta de retirada extra e histórico de definido × retirado. |
| **Painel do dono** (`/dashboard/painel`) | Caixa e dias de caixa por empresa, retiradas × limite, dívidas e reserva pessoais e alertas. Tem botão de exportação. |
| **WhatsApp** (Configurações, `#whatsapp`) | Vincula o número com um código enviado como "FINZUP <código>": copiar, abrir o WhatsApp, contagem regressiva, gerar novo código e trocar número. Vinculado, mostra o número mascarado e permite ligar alertas e o check-in semanal (dia e hora), com exemplos do que mandar. Sem o servidor configurado, explica por que não dá para vincular. |
| **Exportação** (Resumo, Relatórios e Painel) | "Exportar mês" baixa o PDF do fechamento em 1 clique. A seta abre a escolha entre Fechamento, Lançamentos, Relatório e Painel do dono, cada um em PDF ou CSV. Sem o recurso no plano, aparece um link para os planos. |
| **Configurar o Método** (`/dashboard/metodo#configurar`) | Princípios (dízimo, lazer, não usar cartão) e etapas com interruptor e parâmetros: valores em R$, % e meses, salvos ao sair do campo. Mostra "Salvo · metas recalculadas" e tem "Voltar ao padrão". A página mostra "Metas do mês" (dízimo e investimento com o % do usuário e quanto fica livre), as etapas desligadas com "Religar" e um estado para quando nenhuma etapa está ligada. |

O assistente:

- mostra botões de download quando a IA usa `export_data`;
- abre o cartão do WhatsApp ou a configuração do Método quando a IA os altera;
- nas dicas de página, usa o % do usuário e omite o dízimo se ele estiver desligado.

## Código

- **Tipos:** `src/types/index.ts` (`BankAccount`, `EntryExtras`, `FinanceScope`, `ScopeFilter`, `CashFlow*`, `ScopeBreakdown`, `TransferEntry`, `TransferKind`, `TransferTotals`).
- **Hooks:** `use-bank-accounts.ts`, `use-cash-flow.ts`, `use-transfers.ts`, `use-finance-scope.ts` (`useScopeFilter`, `useBusinessEnabled`) e `use-month-summary.ts` (que agora aceita o `scope`).
- **Componentes:**
  - `components/finance/`: `entry-extras-fields.tsx` (o bloco "Mais detalhes" e o `entryExtrasFormShape` para os schemas zod), `entry-extras-meta.tsx`, e `segmented-control.tsx` (o `scope-switch.tsx` saiu na fase 1);
  - `components/settings/`: `bank-accounts-card.tsx` (contas com saldo) e o cartão Empresas;
  - `components/spaces/space-switcher.tsx`, `hooks/use-spaces.ts` e `lib/space-store.ts` (espaços);
  - `components/payment-methods/due-day-select.tsx`;
  - `components/fluxo/`: o gráfico, as movimentações e os rótulos;
  - `components/transfers/transfers-card.tsx`;
  - `components/dashboard/scope-breakdown-card.tsx`.
- **Fase 2:**
  - `lib/api.ts` (`api.download`);
  - `components/export/export-button.tsx`;
  - `components/settings/whatsapp-card.tsx`;
  - `components/baby-steps/method-config-card.tsx` e `components/ui/switch.tsx`;
  - hook `useUpdateMethodConfig` e `getBabyStepPageGuidance(pageKey, step, {investPercent, tithePercent, forUser})`.
