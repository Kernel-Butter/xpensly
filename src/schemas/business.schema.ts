import { z } from 'zod'

export const businessSchema = z.object({
  name:     z.string().min(1, 'Business name is required'),
  type:     z.enum(['agriculture', 'transport', 'construction', 'shop', 'restaurant', 'custom']),
  currency: z.string().default('PKR'),
  timezone: z.string().default('Asia/Karachi'),
})

export type BusinessFormValues = z.infer<typeof businessSchema>
