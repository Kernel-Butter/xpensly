'use client'

import { RefreshCw, CircleUser } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type TopAppBarProps = {
  title?: string
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  className?: string
}

export function TopAppBar({ title = 'Xpensly', leftSlot, rightSlot, className }: TopAppBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex w-full items-center justify-between',
        'border-b border-gray-200 bg-surface px-4 py-3',
        className,
      )}
    >
      <div className="flex w-10 items-center justify-start">
        {leftSlot ?? (
          <button className="rounded-full p-1 text-on-surface-variant hover:bg-gray-100 transition-colors">
            <RefreshCw size={20} />
          </button>
        )}
      </div>

      <span className="text-headline-sm text-primary font-bold">{title}</span>

      <div className="flex w-10 items-center justify-end">
        {rightSlot ?? (
          <button className="rounded-full p-1 text-on-surface-variant hover:bg-gray-100 transition-colors">
            <CircleUser size={20} />
          </button>
        )}
      </div>
    </header>
  )
}
