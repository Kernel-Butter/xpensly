import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { expenseKeys } from '@/hooks/queries/useExpenses'
import { periodSummaryKeys } from '@/hooks/queries/usePeriodSummary'
import type { Expense, ExpenseInput, PeriodId, BusinessId, WorkerId, UserId } from '@/types'

type AddExpenseInput = {
  date: string
  category_id: string
  sub_item?: string | null
  description?: string | null
  quantity?: number | null
  unit_cost?: number | null
  total: number
  worker_id?: string | null
  business_id: string
}

export function useAddExpense(periodId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddExpenseInput): Promise<Expense> => {
      const row = { ...input, period_id: periodId }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('expenses') as any)
        .insert(row)
        .select()
        .single()
      if (error) throw error
      return data as Expense
    },

    onMutate: async (newExpense) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.byPeriod(periodId) })
      const previous = queryClient.getQueryData<Expense[]>(expenseKeys.byPeriod(periodId))
      const tempExpense: Expense = {
        id:           `temp-${Date.now()}` as Expense['id'],
        period_id:    periodId as PeriodId,
        business_id:  newExpense.business_id as BusinessId,
        date:         newExpense.date,
        category_id:  newExpense.category_id,
        sub_item:     newExpense.sub_item ?? null,
        description:  newExpense.description ?? null,
        quantity:     newExpense.quantity ?? null,
        unit_cost:    newExpense.unit_cost ?? null,
        total:        newExpense.total,
        worker_id:    (newExpense.worker_id ?? null) as WorkerId | null,
        receipt_url:  null,
        created_by:   null,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
        worker:       null,
      }
      queryClient.setQueryData<Expense[]>(
        expenseKeys.byPeriod(periodId),
        (old = []) => [tempExpense, ...old],
      )
      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(expenseKeys.byPeriod(periodId), context.previous)
      }
      toast.error('Failed to save expense')
    },

    onSuccess: () => { toast.success('Expense added') },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.byPeriod(periodId) })
      queryClient.invalidateQueries({ queryKey: periodSummaryKeys.byPeriod(periodId) })
    },
  })
}
