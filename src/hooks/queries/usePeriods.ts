import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Period } from '@/types'

export const periodKeys = {
  all:          ()           => ['periods'] as const,
  byBusiness:   (id: string) => ['periods', 'business', id] as const,
}

export function usePeriods(businessId: string | undefined) {
  return useQuery({
    queryKey: periodKeys.byBusiness(businessId ?? ''),
    queryFn: async (): Promise<Period[]> => {
      if (!businessId) return []
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('business_id', businessId)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Period[]
    },
    enabled: !!businessId,
  })
}
