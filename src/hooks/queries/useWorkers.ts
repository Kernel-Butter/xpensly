import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Worker } from '@/types'

export const workerKeys = {
  all:        ()           => ['workers'] as const,
  byBusiness: (id: string) => ['workers', 'business', id] as const,
}

export function useWorkers(businessId: string | undefined) {
  return useQuery({
    queryKey: workerKeys.byBusiness(businessId ?? ''),
    queryFn: async (): Promise<Worker[]> => {
      if (!businessId) return []
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name', { ascending: true })
      if (error) throw error
      return data as Worker[]
    },
    enabled: !!businessId,
  })
}
