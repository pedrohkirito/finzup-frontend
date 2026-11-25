/** Dígitos nacionais (DDD + número), até 11; remove DDI 55 se o usuário colar com país. */
export function normalizePhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
  return digits.slice(0, 11);
}

/** Máscara brasileira: (11) 99999-8888 ou (11) 3333-4444 */
export function maskPhoneInput(value: string): string {
  const digits = normalizePhoneDigits(value);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}