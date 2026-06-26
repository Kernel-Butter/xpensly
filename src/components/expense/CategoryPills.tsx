'use client'

import { cn } from '@/lib/utils/cn'
import type { Category } from '@/types'

type CategoryPillsProps = {
  categories: Category[]
  selected: string
  onSelect: (id: string) => void
}

export function CategoryPills({ categories, selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              selected === cat.id
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
            style={selected === cat.id ? { backgroundColor: cat.color } : undefined}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
