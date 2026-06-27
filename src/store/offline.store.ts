'use client'

import { create } from 'zustand'
import type { SyncState } from '@/types'

type OfflineState = {
  syncState: SyncState
  pendingCount: number
}

type OfflineActions = {
  setSyncing: (queueSize: number) => void
  setSynced: () => void
  setError: (message: string) => void
  setPendingCount: (n: number) => void
}

export const useOfflineStore = create<OfflineState & OfflineActions>((set) => ({
  syncState: { status: 'idle' },
  pendingCount: 0,

  setSyncing:      (queueSize) => set({ syncState: { status: 'syncing', queueSize } }),
  setSynced:       ()          => set({ syncState: { status: 'synced', lastSyncedAt: new Date() } }),
  setError:        (message)   => set({ syncState: { status: 'error', message, retryCount: 0 } }),
  setPendingCount: (n)         => set({ pendingCount: n }),
}))
