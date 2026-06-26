import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { buildDefaultConfig } from '@/lib/config/config.utils'
import { businessKeys } from '@/hooks/queries/useBusinesses'
import type { Business, BusinessConfig } from '@/types'

type CreateBusinessInput = {
  name: string
  type: BusinessConfig['type']
  currency: string
  timezone: string
}

export function useCreateBusiness() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateBusinessInput): Promise<Business> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const config = buildDefaultConfig(input.type)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      const { data: business, error: bError } = await db
        .from('businesses')
        .insert({ ...input, config, created_by: user.id })
        .select()
        .single()
      if (bError) throw bError

      const { error: mError } = await db
        .from('business_members')
        .insert({ business_id: business.id, user_id: user.id, role: 'owner', joined_at: new Date().toISOString() })
      if (mError) throw mError

      return business as Business
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessKeys.all() })
      toast.success('Business created!')
    },

    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create business')
    },
  })
}
