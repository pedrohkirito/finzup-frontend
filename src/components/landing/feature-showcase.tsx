'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { BarChart3, PiggyBank, RefreshCw, Target, TrendingUp, Check } from 'lucide-react';

const tabs = [
  {
    id: 'recorrencia',
    label: 'Recorrência automática',
    icon: RefreshCw,
    headline: 'Configure uma vez. O Finzup cuida do resto.',
    description:
      'Marque lançamentos como recorrentes ou cadastre despesas fixas. Ao fechar o mês, receitas, despesas e orçamentos aparecem automaticamente no próximo — você só ajusta o que mudou.',
    highlights: [
      'Receitas fixas replicadas automaticamente',
      'Despesas recorrentes sem recadastrar',
      'Orçamentos por categoria preservados',
    ],
    visual: (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Próximo mês</p>
            <p className="font-semibold text-slate-900 dark:text-white">Julho já preparado</p>
          </div>
          <span className="rounded-full bg-brand-green-100 px-3 py-1 text-xs font-bold text-brand-green-700 dark:bg-brand-green-950 dark:text-brand-green-400">
            Automático ✓
          </span>
        </div>
        {['Salário — R$ 5.200', 'Aluguel — R$ 1.400', 'Orçamento Alimentação — R$ 1.200'].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800">
            <RefreshCw className="h-4 w-4 flex-shrink-0 text-brand-green-500" />
            <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'orcamentos',
    label: 'Orçamentos em tempo real',
    icon: Target,
    headline: 'Defina limites e acompanhe na hora.',
    description:
      'Crie orçamentos por categoria e veja em tempo real se você está dentro do planejado. Uma barra de progresso por categoria — simples, visual e sem complicação.',
    highlights: [
      'Categorias personalizadas',
      'Progresso visual em tempo real',
      'Alertas ao se aproximar do limite',
    ],
    visual: (
      <div className="space-y-4">
        {[
          { cat: 'Alimentação', spent: 72, limit: 'R$ 1.200', color: 'bg-brand-green-500' },
          { cat: 'Transporte', spent: 45, limit: 'R$ 600', color: 'bg-sky-500' },
          { cat: 'Lazer', spent: 91, limit: 'R$ 400', color: 'bg-amber-500' },
        ].map(({ cat, spent, limit, color }) => (
          <div key={cat} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{spent}% de {limit}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className={`h-full rounded-full ${color} transition-all`}
                style={{ width: `${spent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'relatorios',
    label: 'Relatórios visuais',
    icon: BarChart3,
    headline: 'Entenda para onde vai cada real.',
    description:
      'Relatórios mensais detalhados que mostram receitas, despesas por categoria, evolução do saldo e muito mais. Tome decisões baseadas em dados, não em achismo.',
    highlights: [
      'Gastos por categoria',
      'Tendência mensal do saldo',
      'Despesas fixas vs variáveis',
    ],
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <p className="mb-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Resumo de Junho</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Receitas', value: 'R$ 8.500', color: 'text-brand-green-600' },
              { label: 'Despesas', value: 'R$ 4.200', color: 'text-red-500' },
              { label: 'Saldo', value: 'R$ 4.300', color: 'text-brand-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className={`text-sm font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { cat: 'Alimentação', pct: '30%', color: 'bg-brand-500' },
            { cat: 'Transporte', pct: '15%', color: 'bg-sky-500' },
            { cat: 'Outros', pct: '55%', color: 'bg-violet-500' },
          ].map(({ cat, pct, color }) => (
            <div key={cat} className="flex-1 rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800">
              <div className={`mx-auto mb-1 h-2 w-8 rounded-full ${color}`} />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{pct}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{cat}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'investimentos',
    label: 'Investimentos',
    icon: PiggyBank,
    headline: 'Acompanhe seu patrimônio crescendo.',
    description:
      'Registre seus investimentos e veja a evolução do patrimônio mês a mês. Defina uma meta de investimento mensal e acompanhe se está alcançando seus objetivos.',
    highlights: [
      'Registro de todos os investimentos',
      'Meta mensal de investimento',
      'Evolução patrimonial histórica',
    ],
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950">
              <PiggyBank className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Investimentos este mês</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">R$ 1.850,00</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Meta: R$ 2.000,00</span>
            <span className="font-medium text-violet-600 dark:text-violet-400">92% atingido</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-full w-[92%] rounded-full bg-violet-500" />
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
          <TrendingUp className="h-4 w-4 text-brand-green-500" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Patrimônio total</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">R$ 34.200 · +8% vs mês anterior</p>
          </div>
        </div>
      </div>
    ),
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:mb-4 sm:text-4xl dark:text-white">
            Tudo que você precisa para cuidar do seu dinheiro
          </h2>
          <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Recursos completos com recorrência automática — para você não recomeçar do zero todo mês.
          </p>
        </div>

        <Tabs.Root defaultValue="recorrencia" className="mx-auto max-w-5xl">
          <Tabs.List className="mb-8 flex flex-wrap justify-center gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Tabs.Trigger
                key={id}
                value={id}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-brand-300 hover:text-brand-600 data-[state=active]:border-brand-500 data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:data-[state=active]:border-brand-700 dark:data-[state=active]:bg-brand-900 dark:data-[state=active]:text-brand-200"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {tabs.map(({ id, headline, description, highlights, visual }) => (
            <Tabs.Content key={id} value={id} className="focus:outline-none">
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">{headline}</h3>
                  <p className="mb-6 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    {description}
                  </p>
                  <ul className="space-y-3">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex-shrink-0 rounded-full bg-brand-green-100 p-0.5 dark:bg-brand-green-950">
                          <Check className="h-3.5 w-3.5 text-brand-green-600 dark:text-brand-green-400" />
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                  {visual}
                </div>
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
}
