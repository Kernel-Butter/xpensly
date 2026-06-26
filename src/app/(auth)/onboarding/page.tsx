'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Sprout } from 'lucide-react'
import { useCreateBusiness } from '@/hooks/mutations/useCreateBusiness'
import { useAppStore } from '@/store/app.store'
import { cn } from '@/lib/utils/cn'
import type { BusinessConfig } from '@/types'

type BusinessType = BusinessConfig['type']

const BUSINESS_TYPES: { type: BusinessType; label: string; emoji: string; desc: string }[] = [
  { type: 'agriculture',  label: 'Agriculture',  emoji: '🌾', desc: 'Crops, fields, seasons' },
  { type: 'transport',    label: 'Transport',    emoji: '🚛', desc: 'Vehicles, trips, routes' },
  { type: 'construction', label: 'Construction', emoji: '🏗️', desc: 'Sites, projects, workers' },
  { type: 'shop',         label: 'Retail Shop',  emoji: '🏪', desc: 'Branch, monthly expenses' },
  { type: 'restaurant',   label: 'Restaurant',   emoji: '🍽️', desc: 'Food costs, staff wages' },
  { type: 'custom',       label: 'Custom',       emoji: '⚙️', desc: 'Define your own setup' },
]

const CURRENCIES = [
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { mutate: createBusiness, isPending } = useCreateBusiness()
  const setActiveBusiness = useAppStore((s) => s.setActiveBusiness)

  const [step, setStep] = useState<'type' | 'details'>('type')
  const [selectedType, setSelectedType] = useState<BusinessType>('agriculture')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('PKR')

  const selectedMeta = BUSINESS_TYPES.find((b) => b.type === selectedType)!

  function handleCreate() {
    if (!name.trim()) return
    createBusiness(
      { name: name.trim(), type: selectedType, currency, timezone: 'Asia/Karachi' },
      {
        onSuccess: (business) => {
          setActiveBusiness(business)
          router.push('/')
        },
      },
    )
  }

  if (step === 'type') {
    return (
      <div className="flex min-h-dvh flex-col bg-gray-50">
        <div className="flex flex-1 flex-col px-4 pt-12 pb-6 max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-headline-md text-on-surface">Set up your business</h1>
            <p className="mt-1 text-body-sm text-on-surface-variant">Takes less than 2 minutes</p>
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {BUSINESS_TYPES.map(({ type, label, emoji, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all active:scale-[0.98]',
                  selectedType === type
                    ? 'border-2 border-primary bg-surface-green'
                    : 'border border-gray-200 bg-surface hover:border-gray-300',
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <p className="mt-2 text-title-md text-on-surface">{label}</p>
                <p className="mt-0.5 text-label-xs text-on-surface-variant">{desc}</p>
              </button>
            ))}
          </div>

          {/* Continue */}
          <button
            onClick={() => setStep('details')}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-title-md text-on-primary shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:bg-primary-container transition-colors active:scale-[0.98]"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* Header bar */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-surface px-4 py-3">
        <button
          onClick={() => setStep('type')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Sprout size={20} className="text-primary" />
          <span className="text-headline-sm text-primary font-bold">Xpensly</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex flex-1 flex-col px-4 pt-6 pb-8 max-w-2xl mx-auto w-full gap-5">
        {/* Title */}
        <div>
          <h2 className="text-headline-md text-on-surface">Name your business</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">You can change this later</p>
        </div>

        {/* Selection banner */}
        <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-green px-4 py-3">
          <span className="text-cat-fertilizer">ℹ️</span>
          <span className="text-body-sm text-on-surface-variant">
            You selected: {selectedMeta.label} {selectedMeta.emoji}
          </span>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm text-on-surface-variant">Business Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectedType === 'agriculture' ? 'e.g. Ali Farm Dera' : 'Your business name'}
              autoFocus
              className="w-full rounded-lg border border-gray-200 bg-surface px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-body-sm text-on-surface-variant">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-surface px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors appearance-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1" />

        <button
          onClick={handleCreate}
          disabled={isPending || !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-title-md text-on-primary shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:bg-primary-container transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? 'Creating…' : 'Create Business'}
          {!isPending && <ArrowRight size={18} />}
        </button>
      </main>
    </div>
  )
}
