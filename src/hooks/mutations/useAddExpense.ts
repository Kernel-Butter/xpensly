import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { expenseKeys } from '@/hooks/queries/useExpenses'
import { periodSummaryKeys } from '@/hooks/queries/usePeriodSummary'
import { offlineDB } from '@/lib/offline/db'
import { getPendingCount } from '@/lib/offline/sync'
import { useOfflineStore } from '@/store/offline.store'
import type { Expense, PeriodId, BusinessId, WorkerId } from '@/types'

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
  receipt_url?: string | null
}

export function useAddExpense(periodId: string) {
  const queryClient = useQueryClient()
  const { setPendingCount } = useOfflineStore()

  return useMutation({
    mutationFn: async (input: AddExpenseInput): Promise<Expense> => {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

      if (isOffline) {
        await offlineDB.pendingExpenses.add({
          period_id:   periodId,
          business_id: input.business_id,
          date:        input.date,
          category_id: input.category_id,
          sub_item:    input.sub_item ?? null,
          description: input.description ?? null,
          quantity:    input.quantity ?? null,
          unit_cost:   input.unit_cost ?? null,
          total:       input.total,
          worker_id:   input.worker_id ?? null,
          receipt_url: input.receipt_url ?? null,
          created_at:  new Date().toISOString(),
        })
        const count = await getPendingCount()
        setPendingCount(count)
        // Return a temp record so the optimistic update sticks in the cache
        return {
          id:          `temp-${Date.now()}` as Expense['id'],
          period_id:   periodId as PeriodId,
          business_id: input.business_id as BusinessId,
          date:        input.date,
          category_id: input.category_id,
          sub_item:    input.sub_item ?? null,
          description: input.description ?? null,
          quantity:    input.quantity ?? null,
          unit_cost:   input.unit_cost ?? null,
          total:       input.total,
          worker_id:   (input.worker_id ?? null) as WorkerId | null,
          receipt_url: null,
          created_by:  null,
          created_at:  new Date().toISOString(),
          updated_at:  new Date().toISOString(),
          worker:      null,
        }
      }

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
        id:          `temp-${Date.now()}` as Expense['id'],
        period_id:   periodId as PeriodId,
        business_id: newExpense.business_id as BusinessId,
        date:        newExpense.date,
        category_id: newExpense.category_id,
        sub_item:    newExpense.sub_item ?? null,
        description: newExpense.description ?? null,
        quantity:    newExpense.quantity ?? null,
        unit_cost:   newExpense.unit_cost ?? null,
        total:       newExpense.total,
        worker_id:   (newExpense.worker_id ?? null) as WorkerId | null,
        receipt_url: null,
        created_by:  null,
        created_at:  new Date().toISOString(),
        updated_at:  new Date().toISOString(),
        worker:      null,
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

    onSuccess: (_data, _vars, _ctx) => {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
      if (isOffline) {
        toast('Saved offline — will sync when connected', { icon: '📶' })
      } else {
        toast.success('Expense added')
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.byPeriod(periodId) })
      queryClient.invalidateQueries({ queryKey: periodSummaryKeys.byPeriod(periodId) })
    },
  })
}
