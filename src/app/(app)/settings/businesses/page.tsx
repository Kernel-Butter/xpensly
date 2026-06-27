'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Check, Building2, X, ChevronRight, Loader2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app.store'
import { useBusinesses } from '@/hooks/queries/useBusinesses'
import { useCreateBusiness } from '@/hooks/mutations/useCreateBusiness'
import type { BusinessConfig } from '@/types'

const BUSINESS_TYPES: { value: BusinessConfig['type']; label: string; emoji: string; sub: string }[] = [
  { value: 'agriculture',  label: 'Agriculture',  emoji: '🌾', sub: 'Fields, seasons, crop costs' },
  { value: 'transport',    label: 'Transport',     emoji: '🚛', sub: 'Vehicles, fuel, drivers' },
  { value: 'construction', label: 'Construction',  emoji: '🏗️', sub: 'Sites, projects, labour' },
  { value: 'shop',         label: 'Retail Shop',   emoji: '🏪', sub: 'Branches, stock, monthly' },
  { value: 'restaurant',   label: 'Restaurant',    emoji: '🍽️', sub: 'Kitchen costs, portions' },
  { value: 'custom',       label: 'Custom',        emoji: '✏️', sub: 'Define your own categories' },
]

export default function BusinessesPage() {
  const router = useRouter()
  const { activeBusiness, setActiveBusiness, setActivePeriod, setActiveContext } = useAppStore()

  const { data: businesses = [], isLoading } = useBusinesses()
  const { mutate: createBusiness, isPending: isCreating } = useCreateBusiness()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [step, setStep]           = useState<1 | 2>(1)
  const [bType, setBType]         = useState<BusinessConfig['type']>('agriculture')
  const [bName, setBName]         = useState('')

  function handleSwitch(biz: (typeof businesses)[number]) {
    if (biz.id === activeBusiness?.id) return
    setActiveBusiness(biz)
    // Clear period + context so AppBootstrap re-loads them for the new business
    setActivePeriod(null as never)
    setActiveContext(null as never)
    router.push('/')
  }

  function openSheet() {
    setStep(1)
    setBType('agriculture')
    setBName('')
    setSheetOpen(true)
  }

  function handleCreate() {
    if (!bName.trim()) return
    createBusiness(
      { name: bName.trim(), type: bType, currency: 'PKR', timezone: 'Asia/Karachi' },
      {
        onSuccess: (newBiz) => {
          setActiveBusiness(newBiz)
          setActivePeriod(null as never)
          setActiveContext(null as never)
          setSheetOpen(false)
          router.push('/')
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-surface px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-headline-sm text-primary absolute left-1/2 -translate-x-1/2">My Businesses</h1>
        <div className="w-10" />
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pt-4 flex flex-col gap-3 pb-24">
        <p className="text-body-sm text-on-surface-variant mb-1">
          Tap a business to switch to it.
        </p>

        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : businesses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Building2 size={40} className="text-on-surface-variant opacity-30" />
            <p className="text-body-sm text-on-surface-variant">No businesses yet</p>
          </div>
        ) : (
          businesses.map((biz) => {
            const isActive = biz.id === activeBusiness?.id
            return (
              <button
                key={biz.id}
                onClick={() => handleSwitch(biz)}
                className={`w-full flex items-center justify-between rounded-xl border bg-surface p-4 transition-all text-left ${
                  isActive
                    ? 'border-primary/40 shadow-sm ring-1 ring-primary/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                    isActive ? 'bg-surface-green' : 'bg-surface-container'
                  }`}>
                    {BUSINESS_TYPES.find((t) => t.value === biz.type)?.emoji ?? '🏢'}
                  </div>
                  <div>
                    <p className="text-title-md text-on-surface">{biz.name}</p>
                    <p className="text-body-sm text-on-surface-variant capitalize">{biz.type}</p>
                  </div>
                </div>
                {isActive ? (
                  <Check size={20} className="text-primary shrink-0" />
                ) : (
                  <ChevronRight size={20} className="text-on-surface-variant shrink-0" />
                )}
              </button>
            )
          })
        )}
      </main>

      {/* FAB */}
      <button
        onClick={openSheet}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-on-primary shadow-fab active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Create business sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-surface shadow-xl">
            <div className="flex flex-col items-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            </div>
            <div className="px-4 pb-10 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-sm text-on-surface">New Business</h2>
                <button onClick={() => setSheetOpen(false)} className="rounded-full p-2 text-on-surface-variant hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              {/* Step 1 — pick type */}
              {step === 1 && (
                <>
                  <p className="text-body-sm text-on-surface-variant -mt-2">What kind of business is it?</p>
                  <div className="flex flex-col gap-2">
                    {BUSINESS_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setBType(t.value)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                          bType === t.value
                            ? 'border-primary bg-surface-green'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl">{t.emoji}</span>
                        <div className="flex-1">
                          <p className="text-title-md text-on-surface">{t.label}</p>
                          <p className="text-body-sm text-on-surface-variant">{t.sub}</p>
                        </div>
                        {bType === t.value && <Check size={18} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full rounded-lg bg-primary py-3 text-title-md text-on-primary active:scale-[0.98] transition-all"
                  >
                    Continue
                  </button>
                </>
              )}

              {/* Step 2 — name */}
              {step === 2 && (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-primary text-body-sm -mt-2 self-start"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <p className="text-body-sm text-on-surface-variant">
                    Give your <span className="font-medium text-on-surface capitalize">{bType}</span> business a name.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-body-sm text-on-surface-variant">Business Name</label>
                    <input
                      value={bName}
                      onChange={(e) => setBName(e.target.value)}
                      placeholder="e.g. Bhutta Farms"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!bName.trim() || isCreating}
                    className="w-full rounded-lg bg-primary py-3 text-title-md text-on-primary active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {isCreating && <Loader2 size={16} className="animate-spin" />}
                    Create Business
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
