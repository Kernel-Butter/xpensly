import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export function useDeleteWorker(businessId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workerId: string): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('workers')
        .delete()
        .eq('id', workerId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers', businessId] })
      toast.success('Worker removed')
    },
    onError: () => {
      toast.error('Failed to remove worker')
    },
  })
}
