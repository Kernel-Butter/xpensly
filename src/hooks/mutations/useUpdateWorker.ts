import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import type { Worker } from '@/types'

type UpdateWorkerInput = {
  id: string
  name: string
  daily_rate: number | null
  notes: string | null
}

export function useUpdateWorker(businessId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateWorkerInput): Promise<Worker> => {
      const { id, ...rest } = input
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('workers')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Worker
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', businessId] })
      toast.success('Worker updated')
    },
    onError: () => {
      toast.error('Failed to update worker')
    },
  })
}
