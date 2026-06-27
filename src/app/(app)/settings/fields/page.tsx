'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Ruler, Sprout, MapPin, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { UnitPicker } from '@/components/shared/UnitPicker'
import { useAppStore } from '@/store/app.store'
import { useContexts } from '@/hooks/queries/useContexts'
import { useCreateContext } from '@/hooks/mutations/useCreateContext'
import { useUpdateBusinessConfig } from '@/hooks/mutations/useUpdateBusinessConfig'
import { agricultureConfig } from '@/lib/config/business-configs'
import type { Context } from '@/types'

export default function FieldsPage() {
  const router = useRouter()
  const { activeBusiness, activeContext, setActiveContext } = useAppStore()
  const config = activeBusiness?.config ?? agricultureConfig

  const { data: contexts = [], isLoading } = useContexts(activeBusiness?.id)
  const { mutate: createContext, isPending }   = useCreateContext()
  const { mutate: updateConfig }               = useUpdateBusinessConfig()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [fieldName, setFieldName] = useState('')
  const [fieldSize, setFieldSize] = useState('')
  const [fieldUnit, setFieldUnit] = useState('acres')
  const [fieldNotes, setFieldNotes] = useState('')
  const [nameError, setNameError] = useState('')

  function handleSelect(ctx: Context) {
    setActiveContext(ctx)
    router.back()
  }

  function openSheet() {
    setFieldName('')
    setFieldSize('')
    setFieldUnit('acres')
    setFieldNotes('')
    setNameError('')
    setSheetOpen(true)
  }

  function handleSave() {
    if (!fieldName.trim()) {
      setNameError('Field name is required')
      return
    }
    if (!activeBusiness) return
    setNameError('')

    const unit = fieldUnit.trim() || 'acres'

    createContext(
      {
        business_id: activeBusiness.id,
        name:        fieldName.trim(),
        unit_size:   fieldSize ? parseFloat(fieldSize) : null,
        unit_label:  fieldSize ? unit : null,
        notes:       fieldNotes || null,
      },
      {
        onSuccess: (newCtx) => {
          // Save new unit to master units list so it syncs everywhere
          if (fieldSize && !config.units.includes(unit)) {
            updateConfig({ ...config, units: [...config.units, unit] })
          }
          if (!activeContext) setActiveContext(newCtx)
          setSheetOpen(false)
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-surface px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-gray-100 transition-colors -ml-2"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">My Fields</h1>
        <button
          onClick={openSheet}
          className="text-title-md text-primary font-medium px-2 py-1 hover:bg-surface-green rounded-lg transition-colors"
        >
          Add
        </button>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pt-4 flex flex-col gap-4 pb-24">
        <p className="text-body-base text-secondary">Select a field to track expenses for</p>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))
        ) : contexts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <MapPin size={40} className="text-on-surface-variant opacity-40" />
            <p className="text-body-base text-on-surface-variant">No fields yet</p>
            <p className="text-body-sm text-on-surface-variant opacity-60">Tap Add or + to define your first field</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contexts.map((ctx) => {
              const isSelected = ctx.id === activeContext?.id
              return (
                <button
                  key={ctx.id}
                  onClick={() => handleSelect(ctx)}
                  className={`relative overflow-hidden rounded-lg border border-gray-200 bg-surface-container-lowest p-3 flex flex-col gap-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors text-left w-full ${isSelected ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <div className={`flex justify-between items-start ${isSelected ? 'pl-2' : ''}`}>
                    <h2 className="text-title-md text-on-surface">{ctx.name}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-medium ${ctx.is_active ? 'bg-surface-green border border-primary/20 text-primary' : 'bg-gray-100 border border-gray-200 text-secondary'}`}>
                      {ctx.is_active ? 'Active' : 'Idle'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 ${isSelected ? 'pl-2' : ''}`}>
                    {ctx.unit_size && (
                      <div className="flex items-center gap-1 text-secondary text-body-sm">
                        <Ruler size={14} />
                        <span>{ctx.unit_size} {ctx.unit_label ?? 'acres'}</span>
                      </div>
                    )}
                    {ctx.notes && (
                      <>
                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                        <div className="flex items-center gap-1 text-secondary text-body-sm">
                          <Sprout size={14} />
                          <span className="truncate max-w-30">{ctx.notes}</span>
                        </div>
                      </>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
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
        title="Add New Field"
        contentClassName="px-4 pb-10 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm text-on-surface-variant">Field Name</label>
          <input
            value={fieldName}
            onChange={(e) => { setFieldName(e.target.value); setNameError('') }}
            placeholder="e.g. North Field"
            autoFocus
            className={`w-full rounded-lg border bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:outline-none focus:ring-1 transition-colors ${
              nameError ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-primary focus:ring-primary'
            }`}
          />
          {nameError && <p className="text-label-xs text-red-500">{nameError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm text-on-surface-variant">Size</label>
          <input
            value={fieldSize}
            onChange={(e) => setFieldSize(e.target.value)}
            type="number"
            inputMode="decimal"
            placeholder="0"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm text-on-surface-variant">Unit</label>
          <UnitPicker
            value={fieldUnit}
            onChange={setFieldUnit}
            suggestions={config.units ?? []}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm text-on-surface-variant">Crop / Notes (Optional)</label>
          <input
            value={fieldNotes}
            onChange={(e) => setFieldNotes(e.target.value)}
            placeholder="e.g. Wheat"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full rounded-xl bg-primary py-3.5 text-title-md text-on-primary hover:bg-primary-container transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? 'Saving…' : 'Save Field'}
        </button>
      </BottomSheet>
    </div>
  )
}
