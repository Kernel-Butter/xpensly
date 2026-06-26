'use client'

import { useState } from 'react'
import { RefreshCw, CircleUser, FileText, Table } from 'lucide-react'
import { TopAppBar } from '@/components/shared/TopAppBar'
import { useAppStore } from '@/store/app.store'
import { useExpenses } from '@/hooks/queries/useExpenses'
import { usePeriodSummary } from '@/hooks/queries/usePeriodSummary'
import { agricultureConfig } from '@/lib/config/business-configs'
import { fmtCurrency } from '@/lib/utils/format'

const PERIODS = ['This Month', 'Last Month', 'Q3 2024', 'YTD']

export default function ReportsPage() {
  const [activePeriodLabel, setActivePeriodLabel] = useState('This Month')
  const { activePeriod, activeBusiness } = useAppStore()
  const config = activeBusiness?.config ?? agricultureConfig
  const currency = config.currency

  const { data: expenses } = useExpenses(activePeriod?.id)
  const { data: summary } = usePeriodSummary(activePeriod?.id)

  const total = summary?.total ?? 0
  const expenseCount = summary?.expenseCount ?? 0
  const costPerAcre = total > 0 ? total / 500 : 0

  /* Build category breakdown from real expenses */
  const catTotals: Record<string, number> = {}
  expenses?.forEach((e) => {
    catTotals[e.category_id] = (catTotals[e.category_id] ?? 0) + e.total
  })
  const breakdown = config.categories
    .map((cat) => ({ cat, amount: catTotals[cat.id] ?? 0 }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const maxAmount = breakdown[0]?.amount ?? 1

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <TopAppBar
        leftSlot={
          <button className="rounded-full p-1 text-on-surface-variant hover:bg-gray-100 transition-colors">
            <RefreshCw size={20} />
          </button>
        }
        rightSlot={
          <button className="rounded-full p-1 text-on-surface-variant hover:bg-gray-100 transition-colors">
            <CircleUser size={20} />
          </button>
        }
      />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 space-y-4">
        {/* Period filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriodLabel(p)}
              className={`shrink-0 px-4 py-2 rounded-full text-title-md transition-colors ${
                activePeriodLabel === p
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-surface p-3 flex flex-col justify-between h-32">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="text-body-sm">Total Expenses</span>
            </div>
            <div>
              <div className="text-currency-lg text-on-surface">
                {fmtCurrency(total, currency)}
              </div>
              <div className="text-label-xs text-primary mt-1 flex items-center gap-0.5">
                ↓ {expenseCount} entries
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-surface p-3 flex flex-col justify-between h-32">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="text-body-sm">Cost / Acre (500 ac)</span>
            </div>
            <div>
              <div className="text-currency-lg text-on-surface">
                {fmtCurrency(costPerAcre, currency)}
              </div>
              <div className="text-label-xs text-danger-red mt-1">
                ↑ est. per acre
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl border border-gray-200 bg-surface p-4">
          <h2 className="text-title-md text-on-surface mb-4">Category Breakdown</h2>
          {breakdown.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant text-center py-4">No expenses recorded yet</p>
          ) : (
            <div className="space-y-4">
              {breakdown.map(({ cat, amount }) => (
                <div key={cat.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-body-sm text-on-surface-variant">{cat.name}</span>
                    </div>
                    <span className="text-currency-sm text-on-surface">
                      {fmtCurrency(amount, currency)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(amount / maxAmount) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface py-3 text-title-md text-on-surface hover:bg-gray-50 active:scale-[0.98] transition-all">
            <FileText size={18} />
            Export PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface py-3 text-title-md text-on-surface hover:bg-gray-50 active:scale-[0.98] transition-all">
            <Table size={18} />
            Export CSV
          </button>
        </div>
      </main>
    </div>
  )
}
