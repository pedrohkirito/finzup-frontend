import { redirect } from 'next/navigation';

/** Orçamentos passaram a viver nas categorias: o limite é da própria categoria. */
export default function OrcamentosRedirect() {
  redirect('/dashboard/categorias');
}
