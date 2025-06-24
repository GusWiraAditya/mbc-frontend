// lib/validation.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(8, { message: 'Minimal 8 karakter' }),
})
