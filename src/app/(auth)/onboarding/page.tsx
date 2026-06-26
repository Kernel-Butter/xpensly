'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateBusiness } from '@/hooks/mutations/useCreateBusiness'
import { useAppStore } from '@/store/app.store'
import { cn } from '@/lib/utils/cn'
import type { BusinessConfig } from '@/types'

type BusinessType = BusinessConfig['type']

const businessTypes: { type: BusinessType; label: string; emoji: string; desc: string }[] = [
  { type: 'agriculture',  label: 'Agriculture',  emoji: '🌾', desc: 'Crops, fields, seasons' },
  { type: 'transport',    label: 'Transport',    emoji: '🚛', desc: 'Vehicles, trips, routes' },
  { type: 'construction', label: 'Construction', emoji: '🏗️', desc: 'Sites, projects, workers' },
  { type: 'shop',         label: 'Retail shop',  emoji: '🏪', desc: 'Branch, monthly expenses' },
  { type: 'restaurant',   label: 'Restaurant',   emoji: '🍽️', desc: 'Food costs, staff wages' },
  { type: 'custom',       label: 'Custom',       emoji: '⚙️', desc: 'Define your own setup' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { mutate: createBusiness, isPending } = useCreateBusiness()
  const setActiveBusiness = useAppStore((s) => s.setActiveBusiness)

  const [step, setStep] = useState<'type' | 'details'>(  'type')
  const [selectedType, setSelectedType] = useState<BusinessType>('agriculture')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('PKR')

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

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Logo */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-light shadow-[0_4px_12px_rgba(22,163,74,0.3)]">
          <span className="font-mono text-2xl font-bold text-white">ₓ</span>
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Set up your business</h1>
        <p className="mt-1 text-sm text-gray-500">Takes less than 2 minutes</p>
      </div>

      {step === 'type' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">What kind of business?</p>
          <div className="grid grid-cols-2 gap-2">
            {businessTypes.map(({ type, label, emoji, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  'rounded-xl border p-3 text-left transition-colors',
                  selectedType === type
                    ? 'border-primary-light bg-surface-green'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                <span className="text-xl">{emoji}</span>
                <p className="mt-1 text-sm font-medium text-gray-900">{label}</p>
                <p className="text-[11px] text-gray-400">{desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('details')}
            className="w-full rounded-lg bg-primary-light py-3 text-sm font-semibold text-white"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <button
            type="button"
            onClick={() => setStep('type')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← Back
          </button>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Business name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectedType === 'agriculture' ? 'e.g. Ali Farm Dera' : 'Your business name'}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
            >
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="AED">AED — UAE Dirham</option>
              <option value="SAR">SAR — Saudi Riyal</option>
            </select>
          </div>

          <button
            onClick={handleCreate}
            disabled={isPending || !name.trim()}
            className="w-full rounded-lg bg-primary-light py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? 'Creating…' : 'Create business'}
          </button>
        </div>
      )}
    </div>
  )
}
