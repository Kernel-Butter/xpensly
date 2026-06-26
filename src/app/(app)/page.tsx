'use client'

import Link from 'next/link'
import { Wallet, Sprout, TrendingUp, Tractor } from 'lucide-react'
import { TopAppBar } from '@/components/shared/TopAppBar'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAppStore } from '@/store/app.store'
import { useExpenses } from '@/hooks/queries/useExpenses'
import { usePeriodSummary } from '@/hooks/queries/usePeriodSummary'
import { agricultureConfig } from '@/lib/config/business-configs'
import { fmtCurrency, fmtDate } from '@/lib/utils/format'

export default function DashboardPage() {
  const { activePeriod, activeBusiness, activeContext } = useAppStore()
  const config = activeBusiness?.config ?? agricultureConfig
  const currency = config.currency

  const { data: expenses, isLoading: loadingExpenses } = useExpenses(activePeriod?.id)
  const { data: summary, isLoading: loadingSummary } = usePeriodSummary(
    activePeriod?.id,
    activeContext?.unit_size,
  )

  const budgetPct = summary?.budgetUsedPercent ?? 0
  const budgetColor = budgetPct >= 90 ? 'bg-danger-red' : budgetPct >= 75 ? 'bg-tertiary' : 'bg-primary-container'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <TopAppBar />

      <main className="mx-auto w-full max-w-[672px] space-y-4 px-4 pt-4">
        {/* Hero stat */}
        <section className="rounded-xl border border-gray-200 bg-surface p-3">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-title-md text-on-surface-variant">
                Total spent{activePeriod ? ` — ${activePeriod.name}` : ' this season'}
              </p>
              {loadingSummary ? (
                <Skeleton className="mt-1 h-8 w-32" />
              ) : (
                <div className="text-currency-lg text-on-surface mt-1">
                  {fmtCurrency(summary?.total ?? 0, currency)}
                </div>
              )}
            </div>
            {summary?.budgetUsedPercent != null && (
              <span className="text-currency-sm text-danger-red bg-error-container rounded px-2 py-1">
                {summary.budgetUsedPercent}% used
              </span>
            )}
          </div>

          {summary?.budgetTotal && (
            <div>
              <div className="flex justify-between text-label-xs text-on-surface-variant mb-1">
                <span>Budget Used</span>
                <span>{budgetPct}% ({fmtCurrency(summary.budgetTotal, currency)})</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container-highest">
                <div
                  className={`h-2 rounded-full transition-all ${budgetColor}`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* 2×2 stat grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-surface p-3">
            <div className="flex items-center gap-1 text-on-surface-variant mb-1">
              <Wallet size={14} />
              <span className="text-label-xs">Remaining</span>
            </div>
            <div className="text-currency-md text-on-surface">
              {loadingSummary
                ? '—'
                : fmtCurrency(
                    Math.max(0, (summary?.budgetTotal ?? 0) - (summary?.total ?? 0)),
                    currency,
                  )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-surface p-3">
            <div className="flex items-center gap-1 text-on-surface-variant mb-1">
              <Tractor size={14} />
              <span className="text-label-xs">Cost/{config.labels.quantity}</span>
            </div>
            <div className="text-currency-md text-on-surface">
              {loadingSummary || !summary?.costPerUnit
                ? '—'
                : fmtCurrency(summary.costPerUnit, currency)}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-surface p-3">
            <div className="flex items-center gap-1 text-on-surface-variant mb-1">
              <Sprout size={14} />
              <span className="text-label-xs">{config.labels.context}</span>
            </div>
            <div className="text-currency-md text-on-surface">
              {activeContext?.name ?? '—'}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-surface p-3">
            <div className="flex items-center gap-1 text-on-surface-variant mb-1">
              <TrendingUp size={14} />
              <span className="text-label-xs">Expenses</span>
            </div>
            <div className="text-currency-md text-primary">
              {loadingSummary ? '—' : (summary?.expenseCount ?? 0)}
            </div>
          </div>
        </section>

        {/* Recent expenses */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-title-md text-on-surface">Recent Expenses</h2>
            <Link href="/expenses" className="text-label-xs text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="rounded-xl border border-gray-200 bg-surface">
            {loadingExpenses ? (
              <div className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : !activePeriod ? (
              <EmptyState title="No period selected" description="Set up a crop season first" />
            ) : !expenses?.length ? (
              <EmptyState title="No expenses yet" description="Tap + to log your first expense" />
            ) : (
              <div className="divide-y divide-gray-100">
                {expenses.slice(0, 5).map((expense) => {
                  const cat = config.categories.find((c) => c.id === expense.category_id)
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${cat?.color ?? '#6b7280'}20`, color: cat?.color ?? '#6b7280' }}
                        >
                          <CategoryIcon iconName={cat?.icon ?? 'Settings'} size={20} />
                        </div>
                        <div>
                          <p className="text-title-md text-on-surface">{cat?.name ?? expense.category_id}</p>
                          <p className="text-body-sm text-on-surface-variant">
                            {fmtDate(expense.date)}{expense.description ? ` • ${expense.description}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-currency-md text-on-surface">
                        {fmtCurrency(expense.total, currency)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
