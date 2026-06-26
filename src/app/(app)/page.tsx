'use client'

import { PeriodBanner } from '@/components/dashboard/PeriodBanner'
import { HeroStat } from '@/components/dashboard/HeroStat'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { ExpenseRow } from '@/components/expense/ExpenseRow'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app.store'
import { useExpenses } from '@/hooks/queries/useExpenses'
import { usePeriodSummary } from '@/hooks/queries/usePeriodSummary'
import { agricultureConfig } from '@/lib/config/business-configs'

export default function DashboardPage() {
  const { activePeriod, activeBusiness, activeContext } = useAppStore()
  const config = activeBusiness?.config ?? agricultureConfig

  const { data: expenses, isLoading: loadingExpenses } = useExpenses(activePeriod?.id)
  const { data: summary, isLoading: loadingSummary } = usePeriodSummary(
    activePeriod?.id,
    activeContext?.unit_size,
  )

  return (
    <div className="space-y-4 px-4 pt-2 pb-4">
      <PeriodBanner />

      {/* Hero stat */}
      {loadingSummary ? (
        <Skeleton className="h-28 w-full rounded-xl" />
      ) : (
        <HeroStat
          total={summary?.total ?? 0}
          budgetTotal={summary?.budgetTotal ?? null}
          budgetUsedPercent={summary?.budgetUsedPercent ?? null}
          costPerUnit={summary?.costPerUnit ?? null}
          unitLabel={config.labels.quantity}
          currency={config.currency}
        />
      )}

      {/* Category breakdown */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-[13px] font-medium uppercase tracking-wide text-gray-400">
            By Category
          </p>
          <CategoryChart
            byCategory={summary.byCategory}
            config={config}
            total={summary.total}
          />
        </div>
      )}

      {/* Recent expenses */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <p className="border-b border-gray-100 px-4 py-3 text-[13px] font-medium uppercase tracking-wide text-gray-400">
          Recent
        </p>

        {loadingExpenses ? (
          <div className="space-y-1 p-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !activePeriod ? (
          <EmptyState
            title="No period selected"
            description="Select a crop season to see expenses"
          />
        ) : expenses?.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            description="Tap + to log your first expense"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses?.slice(0, 5).map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} config={config} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
