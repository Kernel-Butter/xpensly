import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { workerKeys } from '@/hooks/queries/useWorkers'
import type { Worker } from '@/types'

type CreateWorkerInput = {
  business_id: string
  name: string
  daily_rate?: number | null
  rate_type?: 'daily' | 'hourly' | 'fixed'
  notes?: string | null
}

export function useCreateWorker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateWorkerInput): Promise<Worker> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('workers') as any)
        .insert({ ...input, is_active: true })
        .select()
        .single()
      if (error) throw error
      return data as Worker
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.byBusiness(variables.business_id) })
      toast.success('Worker added!')
    },

    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add worker')
    },
  })
}
