import { z } from 'zod';
import { isValidCpf, normalizeCpf } from './cpf';

export const emailSchema = z.string().email('Email inválido');

export const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Precisa de uma maiúscula')
  .regex(/[a-z]/, 'Precisa de uma minúscula')
  .regex(/[0-9]/, 'Precisa de um número');

export const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (password: string) => password.length >= 8 },
  { id: 'uppercase', label: 'Uma letra maiúscula', test: (password: string) => /[A-Z]/.test(password) },
  { id: 'lowercase', label: 'Uma letra minúscula', test: (password: string) => /[a-z]/.test(password) },
  { id: 'number', label: 'Um número', test: (password: string) => /[0-9]/.test(password) },
] as const;

export function getPasswordRequirementStatus(password: string) {
  return PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    met: requirement.test(password),
  }));
}

export function isPasswordValid(password: string) {
  return getPasswordRequirementStatus(password).every((requirement) => requirement.met);
}

export const nameSchema = z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(120);

export const cpfSchema = z
  .string()
  .min(1, 'CPF obrigatório')
  .transform((v) => normalizeCpf(v))
  .refine((v) => /^\d{11}$/.test(v), 'CPF deve ter 11 dígitos')
  .refine(isValidCpf, 'CPF inválido');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha obrigatória'),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    cpf: cpfSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });
