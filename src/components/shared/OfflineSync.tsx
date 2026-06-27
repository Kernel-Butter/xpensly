'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { flushOfflineQueue, getPendingCount } from '@/lib/offline/sync'
import { useOfflineStore } from '@/store/offline.store'
import { SyncIndicator } from './SyncIndicator'

export function OfflineSync() {
  const { setSyncing, setSynced, setError, setPendingCount } = useOfflineStore()
  const queryClient = useQueryClient()

  // Seed pending count on first render
  useEffect(() => {
    getPendingCount().then(setPendingCount).catch(() => null)
  }, [setPendingCount])

  // Flush queue whenever the browser comes back online
  useEffect(() => {
    async function handleOnline() {
      const count = await getPendingCount()
      if (count === 0) return

      setSyncing(count)
      try {
        const { synced, failed } = await flushOfflineQueue()
        if (failed === 0) {
          setSynced()
          toast.success(`${synced} expense${synced !== 1 ? 's' : ''} synced`)
        } else {
          setError(`${failed} item${failed !== 1 ? 's' : ''} failed to sync`)
          toast.error(`${failed} expense${failed !== 1 ? 's' : ''} failed to sync`)
        }
        setPendingCount(await getPendingCount())
        // Refresh all expense + summary queries
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        queryClient.invalidateQueries({ queryKey: ['period-summary'] })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown sync error'
        setError(message)
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [setSyncing, setSynced, setError, setPendingCount, queryClient])

  return (
    <div className="fixed top-3 right-4 z-50 pointer-events-none">
      <SyncIndicator />
    </div>
  )
}
