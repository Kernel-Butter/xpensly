'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, CheckCircle, Calendar, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { useAppStore } from '@/store/app.store'
import { usePeriods } from '@/hooks/queries/usePeriods'
import { useCreatePeriod } from '@/hooks/mutations/useCreatePeriod'
import { fmtCurrency } from '@/lib/utils/format'
import type { Period } from '@/types'

export default function SeasonsPage() {
  const router = useRouter()
  const { activeBusiness, activePeriod, setActivePeriod } = useAppStore()
  const currency = activeBusiness?.config?.currency ?? 'PKR'

  const { data: periods = [], isLoading } = usePeriods(activeBusiness?.id)
  const { mutate: createPeriod, isPending } = useCreatePeriod()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [pName, setPName]         = useState('')
  const [pStart, setPStart]       = useState('')
  const [pEnd, setPEnd]           = useState('')
  const [pBudget, setPBudget]     = useState('')
  const [nameError, setNameError] = useState('')

  function handleSelect(period: Period) {
    setActivePeriod(period)
    router.back()
  }

  function openSheet() {
    setPName('')
    setPStart('')
    setPEnd('')
    setPBudget('')
    setNameError('')
    setSheetOpen(true)
  }

  function handleCreate() {
    if (!pName.trim()) {
      setNameError('Season name is required')
      return
    }
    if (!activeBusiness) return
    setNameError('')

    createPeriod(
      {
        business_id: activeBusiness.id,
        name: pName.trim(),
        start_date: pStart || null,
        end_date: pEnd || null,
        budget_total: pBudget ? parseFloat(pBudget) : null,
        is_active: periods.length === 0,
      },
      {
        onSuccess: (newPeriod) => {
          setActivePeriod(newPeriod)
          setSheetOpen(false)
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-surface">
        <div className="flex flex-col px-4 py-3 w-full">
          <div className="flex items-center w-full mb-1">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-gray-100 transition-colors -ml-2"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-headline-sm text-on-surface flex-1 text-center">Select Season</h1>
            <div className="w-10" />
          </div>
          <p className="text-body-sm text-on-surface-variant text-center w-full">
            Choose which crop season to track
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-4 flex flex-col gap-4 pb-24">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))
        ) : periods.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Calendar size={40} className="text-on-surface-variant opacity-40" />
            <p className="text-body-base text-on-surface-variant">No seasons yet</p>
            <p className="text-body-sm text-on-surface-variant opacity-60">Tap + to create your first season</p>
          </div>
        ) : (
          periods.map((period) => {
            const isActive = period.id === activePeriod?.id || period.is_active
            const dateRange = [period.start_date, period.end_date].filter(Boolean).join(' — ')
            return isActive ? (
              <button
                key={period.id}
                onClick={() => handleSelect(period)}
                className="w-full text-left bg-surface-green border-l-4 border-l-primary border border-gray-200 rounded-lg p-3 flex items-center justify-between transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-title-md text-on-surface">{period.name}</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-label-xs font-medium border border-primary/20">
                      Active
                    </span>
                  </div>
                  {dateRange && <span className="text-body-sm text-on-surface-variant">{dateRange}</span>}
                  {period.budget_total && (
                    <span className="text-label-xs text-on-surface-variant mt-0.5">
                      Budget: {fmtCurrency(period.budget_total, currency)}
                    </span>
                  )}
                </div>
                <CheckCircle size={20} className="text-primary fill-primary/20 shrink-0" />
              </button>
            ) : (
              <button
                key={period.id}
                onClick={() => handleSelect(period)}
                className="w-full text-left bg-surface border border-gray-200 rounded-lg p-3 flex items-center justify-between transition-colors hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="flex flex-col">
                  <span className="text-title-md text-on-surface mb-1">{period.name}</span>
                  {dateRange && <span className="text-body-sm text-on-surface-variant">{dateRange}</span>}
                </div>
                {period.budget_total && (
                  <span className="text-currency-sm text-on-surface">
                    {fmtCurrency(period.budget_total, currency)}
                  </span>
                )}
              </button>
            )
          })
        )}
      </main>

      <button
        onClick={openSheet}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-on-primary shadow-fab active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="New Season"
        contentClassName="px-4 pb-10 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm text-on-surface-variant">Season Name</label>
          <input
            value={pName}
            onChange={(e) => { setPName(e.target.value); setNameError('') }}
            placeholder="e.g. Rabi 2025"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:outline-none focus:ring-1 transition-colors ${
              nameError ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-primary focus:ring-primary'
            }`}
          />
          {nameError && <p className="text-label-xs text-red-500">{nameError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm text-on-surface-variant">Start Date</label>
            <input
              type="date"
              value={pStart}
              onChange={(e) => setPStart(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm text-on-surface-variant">End Date</label>
            <input
              type="date"
              value={pEnd}
              onChange={(e) => setPEnd(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm text-on-surface-variant">Total Budget (Optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-sm text-on-surface-variant">₨</span>
            <input
              type="number"
              inputMode="numeric"
              value={pBudget}
              onChange={(e) => setPBudget(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={isPending}
          className="w-full rounded-xl bg-primary py-3.5 text-title-md text-on-primary hover:bg-primary-container transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? 'Creating…' : 'Create Season'}
        </button>
      </BottomSheet>
    </div>
  )
}
