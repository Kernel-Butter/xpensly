import { z } from 'zod'

export const expenseSchema = z.object({
  date:        z.string().min(1, 'Date is required'),
  category_id: z.string().min(1, 'Select a category'),
  sub_item:    z.string().optional(),
  description: z.string().optional(),
  quantity:    z.number().positive().optional(),
  unit_cost:   z.number().positive().optional(),
  total:       z.number().positive('Enter an amount'),
  worker_id:   z.string().uuid().optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
