'use client'

import { Filter } from 'lucide-react'
import { TopAppBar } from '@/components/shared/TopAppBar'
import { SwipeableExpenseRow } from '@/components/expense/SwipeableExpenseRow'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAppStore } from '@/store/app.store'
import { useExpenses } from '@/hooks/queries/useExpenses'
import { usePeriodSummary } from '@/hooks/queries/usePeriodSummary'
import { useDeleteExpense } from '@/hooks/mutations/useDeleteExpense'
import { agricultureConfig } from '@/lib/config/business-configs'
import { fmtCurrency, friendlyDate, fmtDate, groupByDate } from '@/lib/utils/format'
import type { Expense, ExpenseId } from '@/types'

export default function ExpensesPage() {
  const { activePeriod, activeBusiness, openEditExpense } = useAppStore()
  const config = activeBusiness?.config ?? agricultureConfig
  const currency = config.currency

  const { data: expenses, isLoading } = useExpenses(activePeriod?.id)
  const { data: summary } = usePeriodSummary(activePeriod?.id)
  const { mutate: deleteExpense } = useDeleteExpense(activePeriod?.id ?? '')

  const grouped = groupByDate(expenses ?? []) as Record<string, typeof expenses>
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <TopAppBar
        rightSlot={
          <button className="rounded-full p-1 text-on-surface-variant hover:bg-gray-100 transition-colors">
            <Filter size={20} />
          </button>
        }
      />

      <main className="mx-auto w-full max-w-2xl px-4 pt-4 pb-4 flex flex-col gap-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[10px] border border-gray-200 bg-surface p-3 flex flex-col gap-2">
            <span className="text-body-sm text-on-surface-variant">
              Total Spent{activePeriod ? ` (${activePeriod.name})` : ''}
            </span>
            <span className="text-currency-lg text-primary">
              {fmtCurrency(summary?.total ?? 0, currency)}
            </span>
          </div>
          <div className="rounded-[10px] border border-gray-200 bg-surface p-3 flex flex-col gap-2">
            <span className="text-body-sm text-on-surface-variant">Expenses</span>
            <span className="text-currency-lg text-on-surface">
              {summary?.expenseCount ?? 0}
            </span>
          </div>
        </div>

        {/* Expense list */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-28" />
                <div className="rounded-lg border border-gray-200 bg-surface overflow-hidden">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !activePeriod ? (
          <EmptyState title="No period selected" description="Select a crop season from the dashboard" />
        ) : !expenses?.length ? (
          <EmptyState title="No expenses yet" description="Tap + to log your first expense" />
        ) : (
          sortedDates.map((date) => (
            <section key={date} className="flex flex-col gap-2">
              <h2 className="text-title-md text-on-surface-variant sticky top-[57px] bg-gray-50/90 backdrop-blur-sm z-10 py-1 px-2">
                {friendlyDate(date)} — {fmtDate(date)}
              </h2>

              <div className="rounded-lg border border-gray-200 bg-surface overflow-hidden flex flex-col">
                {grouped[date]?.map((expense, idx) => {
                  const cat = config.categories.find((c) => c.id === expense.category_id)
                  const isLast = idx === (grouped[date]?.length ?? 0) - 1
                  return (
                    <SwipeableExpenseRow
                      key={expense.id}
                      expense={expense as Expense}
                      cat={cat}
                      currency={currency}
                      isLast={isLast}
                      onDelete={() => deleteExpense(expense.id as ExpenseId)}
                      onEdit={() => openEditExpense(expense as Expense)}
                    />
                  )
                })}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  )
}
