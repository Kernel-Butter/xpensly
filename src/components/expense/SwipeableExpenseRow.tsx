'use client'

import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { fmtCurrency, fmtDate, fmtTime } from '@/lib/utils/format'
import type { Expense } from '@/types'
import type { Category } from '@/types'

type Props = {
  expense: Expense
  cat: Category | undefined
  currency: string
  onDelete: () => void
  onEdit: () => void
  isLast: boolean
}

const SWIPE_THRESHOLD = 72

export function SwipeableExpenseRow({ expense, cat, currency, onDelete, onEdit, isLast }: Props) {
  const [translateX, setTranslateX] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const startXRef = useRef(0)
  const isDraggingRef = useRef(false)

  function onTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX
    isDraggingRef.current = true
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDraggingRef.current) return
    const dx = e.touches[0].clientX - startXRef.current
    if (dx > 0) { setTranslateX(0); return }
    setTranslateX(Math.max(dx, -SWIPE_THRESHOLD))
  }

  function onTouchEnd() {
    isDraggingRef.current = false
    if (translateX < -SWIPE_THRESHOLD / 2) {
      setTranslateX(-SWIPE_THRESHOLD)
      setRevealed(true)
    } else {
      setTranslateX(0)
      setRevealed(false)
    }
  }

  function handleDelete() {
    setTranslateX(0)
    setRevealed(false)
    onDelete()
  }

  function handleTap() {
    if (revealed) {
      setTranslateX(0)
      setRevealed(false)
      return
    }
    onEdit()
  }

  return (
    <div className={`relative overflow-hidden ${isLast ? '' : 'border-b border-gray-100'}`}>
      {/* Delete button revealed behind */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-[72px] bg-danger-red">
        <button
          onClick={handleDelete}
          className="flex flex-col items-center gap-1 text-white px-3"
        >
          <Trash2 size={20} />
          <span className="text-[10px] font-medium">Delete</span>
        </button>
      </div>

      {/* Row content */}
      <div
        className="relative flex items-center gap-3 p-3 bg-surface hover:bg-gray-50 transition-colors cursor-pointer"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
          style={{
            backgroundColor: `${cat?.color ?? '#6b7280'}20`,
            color: cat?.color ?? '#6b7280',
          }}
        >
          <CategoryIcon iconName={cat?.icon ?? 'Settings'} size={20} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <span className="text-title-md text-on-surface truncate">
            {expense.description ?? cat?.name ?? expense.category_id}
          </span>
          <span className="text-body-sm text-on-surface-variant">
            {fmtDate(expense.date)}, {fmtTime(expense.created_at)}
          </span>
        </div>

        <div className="text-right shrink-0">
          <span className="text-currency-md text-danger-red">
            {fmtCurrency(expense.total, currency)}
          </span>
        </div>
      </div>
    </div>
  )
}
