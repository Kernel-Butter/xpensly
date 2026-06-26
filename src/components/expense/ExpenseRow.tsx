'use client'

import { abbreviateCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { Expense, BusinessConfig } from '@/types'
import { getCategoryById } from '@/lib/config/config.utils'

type ExpenseRowProps = {
  expense: Expense
  config: BusinessConfig
  onDelete?: (id: Expense['id']) => void
  className?: string
}

export function ExpenseRow({ expense, config, onDelete, className }: ExpenseRowProps) {
  const category = getCategoryById(config, expense.category_id)

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', className)}>
      {/* Category icon bubble */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: category?.color ? `${category.color}20` : '#f3f4f6' }}
      >
        <span
          className="text-xs font-bold uppercase"
          style={{ color: category?.color ?? '#6b7280' }}
        >
          {category?.name?.slice(0, 2) ?? '??'}
        </span>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-[500] text-gray-900">
          {expense.sub_item ?? category?.name ?? expense.category_id}
        </p>
        <p className="text-[13px] text-gray-400">
          {formatDate(expense.date, 'short')}
          {expense.description ? ` · ${expense.description}` : ''}
          {expense.worker ? ` · ${expense.worker.name}` : ''}
        </p>
      </div>

      {/* Amount */}
      <p className="font-mono text-[17px] font-[600] text-gray-900">
        {abbreviateCurrency(expense.total)}
      </p>
    </div>
  )
}
