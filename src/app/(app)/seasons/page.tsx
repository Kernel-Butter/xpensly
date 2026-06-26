'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/app.store'
import { fmtCurrency } from '@/lib/utils/format'

type Season = {
  id: string
  name: string
  dateRange: string
  total: number
  active: boolean
}

const MOCK_SEASONS: Season[] = [
  { id: '1', name: 'Rabi 2025',   dateRange: 'Oct 2024 — Mar 2025', total: 120000, active: true  },
  { id: '2', name: 'Kharif 2024', dateRange: 'May 2024 — Sep 2024', total: 85000,  active: false },
  { id: '3', name: 'Rabi 2023',   dateRange: 'Oct 2023 — Mar 2024', total: 105000, active: false },
  { id: '4', name: 'Kharif 2023', dateRange: 'May 2023 — Sep 2023', total: 78000,  active: false },
]

export default function SeasonsPage() {
  const router = useRouter()
  const activeBusiness = useAppStore((s) => s.activeBusiness)
  const currency = activeBusiness?.config?.currency ?? 'PKR'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
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
        {MOCK_SEASONS.map((season) =>
          season.active ? (
            /* Active season card */
            <button
              key={season.id}
              className="w-full text-left bg-surface-green border-l-4 border-l-primary border border-gray-200 rounded-lg p-3 flex items-center justify-between transition-transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-title-md text-on-surface">{season.name}</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-label-xs font-medium border border-primary/20">
                    Active
                  </span>
                </div>
                <span className="text-body-sm text-on-surface-variant">{season.dateRange}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-currency-md text-on-surface">
                  {fmtCurrency(season.total, currency)}
                </span>
                <CheckCircle size={20} className="text-primary fill-primary/20" />
              </div>
            </button>
          ) : (
            /* Past season card */
            <button
              key={season.id}
              className="w-full text-left bg-surface border border-gray-200 rounded-lg p-3 flex items-center justify-between transition-colors hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className="flex flex-col">
                <span className="text-title-md text-on-surface mb-1">{season.name}</span>
                <span className="text-body-sm text-on-surface-variant">{season.dateRange}</span>
              </div>
              <span className="text-currency-md text-on-surface">
                {fmtCurrency(season.total, currency)}
              </span>
            </button>
          )
        )}
      </main>

      {/* FAB */}
      <button className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-on-primary shadow-fab active:scale-95 transition-transform">
        <Plus size={24} />
      </button>
    </div>
  )
}
