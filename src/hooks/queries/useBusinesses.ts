import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Business } from '@/types'

export const businessKeys = {
  all: () => ['businesses'] as const,
}

export function useBusinesses() {
  return useQuery({
    queryKey: businessKeys.all(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*, business_members!inner(role, user_id)')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Business[]
    },
  })
}
