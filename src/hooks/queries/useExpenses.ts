import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Expense } from '@/types'

export const expenseKeys = {
  all:      ()           => ['expenses'] as const,
  byPeriod: (id: string) => ['expenses', 'period', id] as const,
}

export function useExpenses(periodId: string | undefined) {
  return useQuery({
    queryKey: expenseKeys.byPeriod(periodId ?? ''),
    queryFn: async () => {
      if (!periodId) return []
      const { data, error } = await supabase
        .from('expenses')
        .select('*, worker:workers(id, name)')
        .eq('period_id', periodId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Expense[]
    },
    enabled: !!periodId,
  })
}
