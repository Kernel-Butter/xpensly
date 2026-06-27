'use client'

import { Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app.store'
import { cn } from '@/lib/utils/cn'

// Settings sub-pages manage their own FAB — hide the global one there
const HIDDEN_PATHS = ['/settings']

export function FAB() {
  const openAddExpense = useAppStore((s) => s.openAddExpense)
  const pathname = usePathname()

  const hidden = HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (hidden) return null

  return (
    <button
      onClick={openAddExpense}
      className={cn(
        'fixed bottom-20 right-4 z-50',
        'flex h-14 w-14 items-center justify-center rounded-[20px]',
        'bg-primary-light text-white',
        'shadow-[0_4px_12px_rgba(22,163,74,0.4)]',
        'active:scale-95 transition-transform duration-100',
      )}
      aria-label="Add expense"
    >
      <Plus size={24} strokeWidth={2.5} />
    </button>
  )
}
