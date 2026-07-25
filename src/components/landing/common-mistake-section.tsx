export function CommonMistakeSection() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 sm:py-28 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          O erro que mantém a{' '}
          <span className="brand-gradient-text">maioria das pessoas presa</span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-lg text-slate-600 dark:text-slate-400">
          Vídeo. Planilha. Dica. Artigo. Outro vídeo.
          <br />
          Peças soltas. Nenhuma ordem.
        </p>

        <div className="mx-auto mt-14 max-w-xs">
          <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
            <span className="text-brand-green-500">+</span> Muito conteúdo
          </p>
          <p className="my-2 text-2xl font-bold text-slate-300 dark:text-slate-600">≠</p>
          <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
            <span className="text-red-500">−</span> Nenhum passo dado
          </p>
        </div>

        <p className="mx-auto mt-14 text-xl font-extrabold text-slate-900 sm:text-2xl dark:text-white">
          O problema nunca foi falta de informação.
          <br />
          <span className="brand-gradient-text">Foi falta de um caminho.</span>
        </p>
      </div>
    </section>
  );
}
