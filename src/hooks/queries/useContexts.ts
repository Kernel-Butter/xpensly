import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Context } from '@/types'

export const contextKeys = {
  all:        ()           => ['contexts'] as const,
  byBusiness: (id: string) => ['contexts', 'business', id] as const,
}

export function useContexts(businessId: string | undefined) {
  return useQuery({
    queryKey: contextKeys.byBusiness(businessId ?? ''),
    queryFn: async (): Promise<Context[]> => {
      if (!businessId) return []
      const { data, error } = await supabase
        .from('contexts')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Context[]
    },
    enabled: !!businessId,
  })
}
