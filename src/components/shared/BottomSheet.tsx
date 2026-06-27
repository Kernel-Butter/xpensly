'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Extra classes on the panel */
  className?: string
  /** Classes on the inner content wrapper (default: px-4 pb-10 flex flex-col gap-5) */
  contentClassName?: string
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  contentClassName,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop — z-[55] so it sits above BottomNav (z-50) */}
      <div
        className="fixed inset-0 z-[55] bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel — z-[60] so it sits above backdrop and BottomNav */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-[60]',
          'max-h-[90dvh] overflow-y-auto overscroll-contain',
          'rounded-t-3xl bg-surface shadow-2xl',
          'animate-in slide-in-from-bottom duration-300 ease-out',
          className,
        )}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 flex flex-col items-center bg-surface pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-200" />
        </div>

        {/* Optional header */}
        {title && (
          <div className="flex items-center justify-between px-4 pt-1 pb-3">
            <h2 className="text-headline-sm text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-on-surface-variant hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn('px-4 pb-10 flex flex-col gap-5', contentClassName)}>
          {children}
        </div>
      </div>
    </>
  )
}
