import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { periodKeys } from '@/hooks/queries/usePeriods'
import type { Period } from '@/types'

type CreatePeriodInput = {
  business_id: string
  name: string
  start_date?: string | null
  end_date?: string | null
  budget_total?: number | null
  is_active?: boolean
}

export function useCreatePeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePeriodInput): Promise<Period> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('periods') as any)
        .insert({ ...input, budget_by_cat: {} })
        .select()
        .single()
      if (error) throw error
      return data as Period
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: periodKeys.byBusiness(variables.business_id) })
      toast.success('Season created!')
    },

    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create season')
    },
  })
}
