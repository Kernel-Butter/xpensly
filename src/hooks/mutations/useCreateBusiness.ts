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

      // Ensure profile row exists (handles accounts created before the DB trigger was live)
      await db.from('profiles').upsert(
        { id: user.id, full_name: user.user_metadata?.full_name ?? 'User' },
        { onConflict: 'id' },
      )

      // Insert business WITHOUT select — can't select yet because user isn't a member
      const businessId = crypto.randomUUID()
      const { error: bError } = await db
        .from('businesses')
        .insert({ id: businessId, ...input, config, created_by: user.id })
      if (bError) throw bError

      // Add as owner first, then select (is_member check will now pass)
      const { error: mError } = await db
        .from('business_members')
        .insert({ business_id: businessId, user_id: user.id, role: 'owner', joined_at: new Date().toISOString() })
      if (mError) throw mError

      const { data: business, error: fetchError } = await db
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()
      if (fetchError) throw fetchError

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
