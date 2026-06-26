import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { costPerUnit } from '@/lib/utils/math'
import type { PeriodSummary } from '@/types'

export const periodSummaryKeys = {
  byPeriod: (id: string) => ['period-summary', id] as const,
}

const empty: PeriodSummary = {
  total: 0,
  budgetTotal: null,
  budgetUsedPercent: null,
  costPerUnit: null,
  byCategory: {},
  expenseCount: 0,
}

export function usePeriodSummary(periodId: string | undefined, unitSize?: number | null) {
  return useQuery({
    queryKey: periodSummaryKeys.byPeriod(periodId ?? ''),
    queryFn: async (): Promise<PeriodSummary> => {
      if (!periodId) return empty

      const [{ data: expenses, error: expError }, { data: period, error: pError }] =
        await Promise.all([
          supabase.from('expenses').select('total, category_id').eq('period_id', periodId),
          supabase.from('periods').select('budget_total').eq('id', periodId).single(),
        ])

      if (expError) throw expError
      if (pError) throw pError

      const rows = expenses as { total: number; category_id: string }[]
      const total = rows.reduce((sum, r) => sum + r.total, 0)
      const budgetTotal = (period as { budget_total: number | null }).budget_total ?? null
      const budgetUsedPercent = budgetTotal ? Math.round((total / budgetTotal) * 100) : null

      const byCategory = rows.reduce<Record<string, number>>((acc, e) => {
        acc[e.category_id] = (acc[e.category_id] ?? 0) + e.total
        return acc
      }, {})

      return {
        total,
        budgetTotal,
        budgetUsedPercent,
        costPerUnit: unitSize ? costPerUnit(total, unitSize) : null,
        byCategory,
        expenseCount: rows.length,
      }
    },
    enabled: !!periodId,
  })
}
