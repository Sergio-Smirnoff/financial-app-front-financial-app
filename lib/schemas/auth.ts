import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().default(false),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Una mayúscula')
    .regex(/[0-9]/, 'Un número'),
  name: z.string().min(2, 'El nombre es requerido'),
  preferredCurrency: z.string().default('ARS'),
})

export type RegisterFormData = z.infer<typeof registerSchema>
