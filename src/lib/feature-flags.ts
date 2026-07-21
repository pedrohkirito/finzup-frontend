/**
 * Feature flags públicas, resolvidas no build do frontend.
 * Apenas o valor literal "true" habilita a funcionalidade.
 */
export const BABY_STEPS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_BABY_STEPS === 'true';
