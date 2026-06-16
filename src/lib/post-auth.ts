import type { User } from '@/types';

export function getPostAuthRedirect(user: User): '/dashboard' | '/assinatura' {
  return user.billing?.hasAccess ? '/dashboard' : '/assinatura';
}
