'use client'

import { getCategoryById } from '@/lib/config/config.utils'
import { abbreviateCurrency } from '@/lib/utils/currency'
import type { BusinessConfig } from '@/types'

type CategoryChartProps = {
  byCategory: Record<string, number>
  config: BusinessConfig
  total: number
}

export function CategoryChart({ byCategory, config, total }: CategoryChartProps) {
  const entries = Object.entries(byCategory)
    .map(([id, amount]) => ({
      id,
      amount,
      category: getCategoryById(config, id),
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  if (entries.length === 0) return null

  return (
    <div className="space-y-2">
      {entries.map(({ id, amount, category, percent }) => (
        <div key={id}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[13px] text-gray-600">{category?.name ?? id}</span>
            <span className="font-mono text-[13px] font-medium text-gray-900">
              {abbreviateCurrency(amount)} · {percent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${percent}%`, backgroundColor: category?.color ?? '#6b7280' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
