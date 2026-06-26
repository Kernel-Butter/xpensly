import { z } from 'zod'

export const workerSchema = z.object({
  name:       z.string().min(1, 'Worker name is required'),
  daily_rate: z.number().positive().optional(),
  rate_type:  z.enum(['daily', 'hourly', 'fixed']).default('daily'),
  notes:      z.string().optional(),
})

export type WorkerFormValues = z.infer<typeof workerSchema>
