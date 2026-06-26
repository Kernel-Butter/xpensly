import { formatCurrency, abbreviateCurrency } from '@/lib/utils/currency'
import { BudgetBar } from '@/components/shared/BudgetBar'
import { cn } from '@/lib/utils/cn'

type HeroStatProps = {
  total: number
  budgetTotal: number | null
  budgetUsedPercent: number | null
  costPerUnit: number | null
  unitLabel: string
  currency?: string
  className?: string
}

export function HeroStat({
  total,
  budgetTotal,
  budgetUsedPercent,
  costPerUnit,
  unitLabel,
  currency = 'PKR',
  className,
}: HeroStatProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-5', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Spent</p>
      <p className="mt-1 font-mono text-[30px] font-bold leading-tight text-gray-900">
        {abbreviateCurrency(total, currency)}
      </p>

      {budgetTotal && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Budget</span>
            <span>
              {budgetUsedPercent ?? 0}% of {abbreviateCurrency(budgetTotal, currency)}
            </span>
          </div>
          <BudgetBar usedPercent={budgetUsedPercent ?? 0} />
        </div>
      )}

      {costPerUnit !== null && (
        <p className="mt-3 text-xs text-gray-400">
          <span className="font-mono font-semibold text-gray-700">
            {formatCurrency(costPerUnit, currency)}
          </span>{' '}
          per {unitLabel.toLowerCase()}
        </p>
      )}
    </div>
  )
}
