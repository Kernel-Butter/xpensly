import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { businessKeys } from '@/hooks/queries/useBusinesses'
import { useAppStore } from '@/store/app.store'
import type { Business, BusinessConfig } from '@/types'

export function useUpdateBusinessConfig() {
  const queryClient = useQueryClient()
  const { activeBusiness, setActiveBusiness } = useAppStore()

  return useMutation({
    mutationFn: async (config: BusinessConfig): Promise<Business> => {
      if (!activeBusiness) throw new Error('No active business')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('businesses')
        .update({ config })
        .eq('id', activeBusiness.id)
        .select()
        .single()
      if (error) throw error
      return data as Business
    },
    onSuccess: (updated) => {
      setActiveBusiness(updated)
      queryClient.invalidateQueries({ queryKey: businessKeys.all() })
    },
    onError: () => {
      toast.error('Failed to save changes')
    },
  })
}
