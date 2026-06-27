import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { contextKeys } from '@/hooks/queries/useContexts'
import type { Context } from '@/types'

type CreateContextInput = {
  business_id: string
  name: string
  unit_size?: number | null
  unit_label?: string | null
  notes?: string | null
}

export function useCreateContext() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateContextInput): Promise<Context> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('contexts') as any)
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data as Context
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contextKeys.byBusiness(variables.business_id) })
      toast.success('Field saved!')
    },

    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save field')
    },
  })
}
