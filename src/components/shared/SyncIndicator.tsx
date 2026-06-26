'use client'

import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { SyncState } from '@/types'

type SyncIndicatorProps = {
  state: SyncState
  className?: string
}

export function SyncIndicator({ state, className }: SyncIndicatorProps) {
  if (state.status === 'idle' || state.status === 'synced') return null

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        state.status === 'syncing' && 'bg-blue-50 text-blue-600',
        state.status === 'error'   && 'bg-red-50 text-danger-red',
        className,
      )}
    >
      {state.status === 'syncing' && (
        <>
          <RefreshCw size={12} className="animate-spin" />
          <span>{state.queueSize} pending</span>
        </>
      )}
      {state.status === 'error' && (
        <>
          <WifiOff size={12} />
          <span>Sync failed</span>
        </>
      )}
    </div>
  )
}
