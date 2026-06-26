'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Filter, UserPlus, TrendingUp, HardHat, Tractor, User, Droplets } from 'lucide-react'
import { useAppStore } from '@/store/app.store'
import { fmtCurrency } from '@/lib/utils/format'

type Worker = {
  id: string
  name: string
  role: string
  daily_rate: number
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}

const MOCK_WORKERS: Worker[] = [
  { id: '1', name: 'Akram',   role: 'Supervisor',           daily_rate: 1200, icon: <HardHat size={20} />,   iconBg: '#f9731620', iconColor: '#f97316' },
  { id: '2', name: 'Sajid',   role: 'Machine Operator',     daily_rate: 900,  icon: <Tractor size={20} />,   iconBg: '#f59e0b20', iconColor: '#f59e0b' },
  { id: '3', name: 'Bilal',   role: 'Daily Labor',          daily_rate: 600,  icon: <User size={20} />,       iconBg: '#d9dff5',   iconColor: '#575e70' },
  { id: '4', name: 'Zain',    role: 'Daily Labor',          daily_rate: 600,  icon: <User size={20} />,       iconBg: '#d9dff5',   iconColor: '#575e70' },
  { id: '5', name: 'Omar',    role: 'Irrigation Specialist', daily_rate: 800,  icon: <Droplets size={20} />,  iconBg: '#3b82f620', iconColor: '#3b82f6' },
]

export default function WorkersPage() {
  const router = useRouter()
  const activeBusiness = useAppStore((s) => s.activeBusiness)
  const currency = activeBusiness?.config?.currency ?? 'PKR'
  const [search, setSearch] = useState('')

  const filtered = MOCK_WORKERS.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase()),
  )

  const totalDailyRate = filtered.reduce((sum, w) => sum + w.daily_rate, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-surface px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-headline-sm text-primary absolute left-1/2 -translate-x-1/2">Workers</h1>
        <div className="w-10" />
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pt-4">
        {/* Search + filter */}
        <div className="flex gap-2 mb-4 sticky top-[57px] z-30 bg-gray-50 py-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workers..."
              className="h-11 w-full rounded-lg border border-gray-200 bg-surface py-2 pl-10 pr-4 text-body-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <button className="flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-surface px-3 text-on-surface-variant hover:bg-gray-100 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-gray-200 bg-surface p-3 flex flex-col justify-between h-[90px]">
            <span className="text-body-sm text-on-surface-variant">Active Workers</span>
            <div className="flex items-baseline gap-1">
              <span className="text-headline-md text-on-surface">{filtered.length}</span>
              <TrendingUp size={16} className="text-cat-fertilizer" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-surface p-3 flex flex-col justify-between h-[90px]">
            <span className="text-body-sm text-on-surface-variant">Daily Total Rate</span>
            <span className="text-headline-md text-on-surface">
              {fmtCurrency(totalDailyRate, currency)}
            </span>
          </div>
        </div>

        {/* Worker list */}
        <div className="rounded-xl border border-gray-200 bg-surface overflow-hidden mb-6">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-body-sm text-on-surface-variant">No workers found</p>
          ) : (
            filtered.map((w, idx) => (
              <div
                key={w.id}
                className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer ${idx < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: w.iconBg, color: w.iconColor }}
                  >
                    {w.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-title-md text-on-surface">{w.name}</span>
                    <span className="text-body-sm text-on-surface-variant">{w.role}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-currency-md text-on-surface">
                    {fmtCurrency(w.daily_rate, currency)}
                  </span>
                  <span className="text-label-xs text-on-surface-variant">/day</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-on-primary shadow-fab active:scale-95 transition-transform">
        <UserPlus size={22} />
      </button>
    </div>
  )
}
