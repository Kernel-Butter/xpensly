'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBusinesses } from '@/hooks/queries/useBusinesses'
import { usePeriods } from '@/hooks/queries/usePeriods'
import { useAppStore } from '@/store/app.store'

export function AppBootstrap() {
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)

  const { activeBusiness, activePeriod, setActiveBusiness, setActivePeriod } = useAppStore()

  // Rehydrate from localStorage synchronously before any query logic runs
  useEffect(() => {
    useAppStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  const { data: businesses, isLoading, isError } = useBusinesses()
  const { data: periods } = usePeriods(activeBusiness?.id)

  // Wait for hydration before touching the store — avoids the race between
  // localStorage rehydration and the businesses query resolving first
  useEffect(() => {
    if (!hydrated || isLoading || isError) return

    if (businesses && businesses.length > 0) {
      // Always verify the hydrated business is still valid for this user
      const stillValid = activeBusiness && businesses.some((b) => b.id === activeBusiness.id)
      if (!stillValid) setActiveBusiness(businesses[0])
    } else if (businesses && businesses.length === 0) {
      router.replace('/onboarding')
    }
  }, [hydrated, businesses, isLoading, isError, activeBusiness, setActiveBusiness, router])

  useEffect(() => {
    if (!hydrated) return
    if (!activePeriod && periods && periods.length > 0) {
      const active = periods.find((p) => p.is_active) ?? periods[0]
      setActivePeriod(active)
    }
  }, [hydrated, periods, activePeriod, setActivePeriod])

  return null
}
