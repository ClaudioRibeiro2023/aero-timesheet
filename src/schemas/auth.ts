import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const MagicLinkSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export type LoginFormData = z.infer<typeof LoginSchema>
export type MagicLinkFormData = z.infer<typeof MagicLinkSchema>
