import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { expenseKeys } from '@/hooks/queries/useExpenses'
import { periodSummaryKeys } from '@/hooks/queries/usePeriodSummary'
import type { Expense, ExpenseId } from '@/types'

type UpdateExpenseInput = {
  id: ExpenseId
  date: string
  category_id: string
  sub_item?: string | null
  description?: string | null
  quantity?: number | null
  unit_cost?: number | null
  total: number
  worker_id?: string | null
  receipt_url?: string | null
}

export function useUpdateExpense(periodId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateExpenseInput): Promise<Expense> => {
      const { id, ...updates } = input
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('expenses') as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Expense
    },

    onSuccess: () => {
      toast.success('Expense updated')
    },

    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update expense')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.byPeriod(periodId) })
      queryClient.invalidateQueries({ queryKey: periodSummaryKeys.byPeriod(periodId) })
    },
  })
}
