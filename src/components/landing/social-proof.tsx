import { Lock, MessagesSquare, ShieldCheck, Star } from 'lucide-react';
import { TRIAL_DAYS } from '@/constants/billing';

const trustBadges = [
  { icon: Lock, text: 'Dados criptografados e privados' },
  { icon: ShieldCheck, text: `Garantia de ${TRIAL_DAYS} dias` },
  { icon: MessagesSquare, text: 'Suporte personalizado' },
];

const testimonials: { quote: string; name: string; role?: string }[] = [
  {
    quote:
      'Depois de inúmeros testes, finalmente cheguei numa solução que realmente me ajudou. Agora consigo saber para onde o meu dinheiro está indo.',
    name: 'Pedro H.',
  },
  {
    quote:
      'Simples, bonito e fácil de usar. O design clean e minimalista fez até o controle financeiro virar prazeroso — pela primeira vez, organizei o dinheiro com vontade.',
    name: 'Raquel R.',
  },
];

export function SocialProof() {
  return (
    <section className="border-y border-slate-200 bg-white py-14 sm:py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
          {trustBadges.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-950 dark:text-brand-green-400">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </div>
          ))}
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-6">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</span>
                {testimonial.role && (
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
