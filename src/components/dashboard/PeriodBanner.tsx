'use client'

import { ChevronDown } from 'lucide-react'
import { useAppStore } from '@/store/app.store'

export function PeriodBanner() {
  const { activeBusiness, activeContext, activePeriod } = useAppStore()

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {activeBusiness?.name ?? 'No business'}
        </p>
        <button className="flex items-center gap-1 text-[17px] font-[500] text-gray-900">
          {activePeriod?.name ?? 'Select period'}
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>
      <button className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-gray-600">
        {activeContext?.name ?? 'All fields'}
      </button>
    </div>
  )
}
