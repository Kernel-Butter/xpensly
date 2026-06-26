import { cn } from '@/lib/utils/cn'

type BudgetBarProps = {
  usedPercent: number
  className?: string
}

export function BudgetBar({ usedPercent, className }: BudgetBarProps) {
  const clamped = Math.min(100, Math.max(0, usedPercent))
  const color =
    clamped >= 90 ? 'bg-danger-red'
    : clamped >= 75 ? 'bg-cat-tractor'
    : 'bg-primary-light'

  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-gray-100', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
