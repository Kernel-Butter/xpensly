'use client'

import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useOfflineStore } from '@/store/offline.store'
import { cn } from '@/lib/utils/cn'

export function SyncIndicator({ className }: { className?: string }) {
  const { syncState, pendingCount } = useOfflineStore()

  if (syncState.status === 'idle' && pendingCount === 0) return null

  if (syncState.status === 'syncing') {
    return (
      <Pill className={cn('bg-blue-50 text-blue-700 border-blue-200', className)}>
        <RefreshCw size={12} className="animate-spin" />
        <span>Syncing {syncState.queueSize}…</span>
      </Pill>
    )
  }

  if (syncState.status === 'synced') {
    return (
      <Pill className={cn('bg-green-50 text-green-700 border-green-200', className)}>
        <CheckCircle2 size={12} />
        <span>Synced</span>
      </Pill>
    )
  }

  if (syncState.status === 'error') {
    return (
      <Pill className={cn('bg-red-50 text-red-700 border-red-200', className)}>
        <AlertCircle size={12} />
        <span>Sync failed</span>
      </Pill>
    )
  }

  // status idle + pendingCount > 0: offline with queued items
  return (
    <Pill className={cn('bg-amber-50 text-amber-700 border-amber-200', className)}>
      <WifiOff size={12} />
      <span>{pendingCount} pending</span>
    </Pill>
  )
}

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      {children}
    </div>
  )
}
