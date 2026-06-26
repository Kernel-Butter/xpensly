import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { expenseKeys } from '@/hooks/queries/useExpenses'
import { periodSummaryKeys } from '@/hooks/queries/usePeriodSummary'
import type { Expense, ExpenseId } from '@/types'

export function useDeleteExpense(periodId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expenseId: ExpenseId) => {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
      if (error) throw error
    },

    onMutate: async (expenseId) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.byPeriod(periodId) })
      const previous = queryClient.getQueryData<Expense[]>(expenseKeys.byPeriod(periodId))
      queryClient.setQueryData<Expense[]>(
        expenseKeys.byPeriod(periodId),
        (old = []) => old.filter((e) => e.id !== expenseId),
      )
      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(expenseKeys.byPeriod(periodId), context.previous)
      }
      toast.error('Failed to delete expense')
    },

    onSuccess: () => {
      toast.success('Expense deleted')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.byPeriod(periodId) })
      queryClient.invalidateQueries({ queryKey: periodSummaryKeys.byPeriod(periodId) })
    },
  })
}
