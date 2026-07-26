import { MethodPreviewMock } from '@/components/landing/method-preview-mock';

const chaosPieces = [
  'Um vídeo aqui.',
  'Uma planilha ali.',
  'Uma dica no Instagram.',
  'Um artigo de blog.',
  'Outro método.',
];

export function CommonMistakeSection() {
  return (
    <section data-landing-section="common_mistake" className="relative overflow-hidden border-t border-slate-800 bg-slate-950 pt-20 pb-8 sm:pt-28 sm:pb-12">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(2,146,184,0.08)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span className="mb-4 inline-block text-sm font-semibold tracking-[0.2em] text-brand-400 uppercase">
            O problema real
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            O erro que mantém a maioria das pessoas{' '}
            <span className="relative inline-block brand-gradient-text-light after:absolute after:right-0 after:bottom-1 after:left-0 after:h-[3px] after:rounded-sm after:bg-gradient-to-r after:from-brand-500 after:to-brand-green-500">
              presa
            </span>
          </h2>
          <p className="mx-auto mt-4 text-base text-slate-400 sm:whitespace-nowrap sm:text-lg">
            A maioria tenta sair das dívidas como quem junta peças soltas.
          </p>
        </div>

        {/* Chaos chips */}
        <div className="mx-auto mb-12 flex max-w-[720px] flex-wrap justify-center gap-2.5 sm:mb-16 sm:gap-3">
          {chaosPieces.map((piece) => (
            <span
              key={piece}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/30 hover:text-white sm:px-5 sm:text-base"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 opacity-60"
                aria-hidden
              />
              {piece}
            </span>
          ))}
        </div>

        {/* Resultado? */}
        <div className="mx-auto mb-10 flex max-w-[600px] items-center gap-4 sm:mb-12">
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
            aria-hidden
          />
          <span className="shrink-0 text-xl font-extrabold tracking-wide text-slate-500 sm:text-2xl">
            Resultado?
          </span>
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
            aria-hidden
          />
        </div>

        {/* Impact */}
        <div className="mb-28 flex flex-wrap items-center justify-center gap-6 sm:mb-32 sm:gap-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-4xl leading-none font-extrabold text-brand-400 sm:text-5xl">+</span>
            <p className="text-3xl font-extrabold text-white sm:text-4xl">Muito conteúdo.</p>
          </div>
          <span
            className="w-full text-center text-2xl font-bold text-slate-600 sm:w-auto sm:text-3xl"
            aria-hidden
          >
            ≠
          </span>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-4xl leading-none font-extrabold text-slate-500 sm:text-5xl">−</span>
            <p className="text-3xl font-extrabold text-slate-400 sm:text-4xl">Pouca evolução.</p>
          </div>
        </div>

        {/* Solução */}
        <div className="relative pt-4 pb-6 text-center sm:pt-6 sm:pb-8">
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(2,146,184,0.12)_0%,transparent_70%)]"
            aria-hidden
          />
          <span className="relative mb-5 inline-block rounded-full border border-brand-500/35 bg-brand-500/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-brand-300 uppercase">
            A solução
          </span>
          <p className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            O <span className="brand-gradient-text-light">Método Finzup</span> resolve isso
          </p>
          <p className="relative mx-auto mt-4 text-base text-slate-400 sm:whitespace-nowrap sm:text-lg">
            criando um{' '}
            <span className="font-semibold text-brand-300">caminho</span> entre
            tudo que você já sabe e o próximo passo.
          </p>
        </div>

        {/* Product preview — ponte visual para a seção do método */}
        <div className="relative z-20 mt-12 sm:mt-16">
          <MethodPreviewMock />
        </div>
      </div>
    </section>
  );
}
