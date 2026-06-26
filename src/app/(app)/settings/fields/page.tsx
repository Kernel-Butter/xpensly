'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Ruler, Sprout, X } from 'lucide-react'

type Field = {
  id: string
  name: string
  acres: number
  crop: string
  status: 'active' | 'idle'
}

const MOCK_FIELDS: Field[] = [
  { id: '1', name: 'North Field',   acres: 12, crop: 'Wheat',  status: 'active' },
  { id: '2', name: 'South Field B', acres: 8,  crop: 'Cotton', status: 'active' },
  { id: '3', name: 'River Side',    acres: 20, crop: '—',      status: 'idle'   },
]

export default function FieldsPage() {
  const router = useRouter()
  const [fields] = useState<Field[]>(MOCK_FIELDS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [fieldName, setFieldName] = useState('')
  const [fieldAcres, setFieldAcres] = useState('')
  const [fieldNotes, setFieldNotes] = useState('')

  function handleSave() {
    if (!fieldName.trim()) return
    setSheetOpen(false)
    setFieldName('')
    setFieldAcres('')
    setFieldNotes('')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-gray-200 bg-surface px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-gray-100 transition-colors -ml-2"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-headline-sm text-on-surface absolute left-1/2 -translate-x-1/2">My Fields</h1>
        <button
          onClick={() => setSheetOpen(true)}
          className="text-title-md text-primary font-medium px-2 py-1 hover:bg-surface-green rounded-lg transition-colors"
        >
          Add
        </button>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pt-4 flex flex-col gap-4 pb-24">
        <p className="text-body-base text-secondary">Select a field to track expenses for</p>

        <div className="flex flex-col gap-3">
          {fields.map((field, idx) => {
            const isSelected = idx === 0
            return (
              <div
                key={field.id}
                className={`relative overflow-hidden rounded-lg border border-gray-200 bg-surface-container-lowest p-3 flex flex-col gap-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'border-l-4 border-l-primary' : ''}`}
              >
                <div className={`flex justify-between items-start ${isSelected ? 'pl-2' : ''}`}>
                  <h2 className="text-title-md text-on-surface">{field.name}</h2>
                  {field.status === 'active' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-green border border-primary/20 text-primary text-label-xs font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-secondary text-label-xs font-medium">
                      Idle
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-3 ${isSelected ? 'pl-2' : ''}`}>
                  <div className="flex items-center gap-1 text-secondary text-body-sm">
                    <Ruler size={14} />
                    <span>{field.acres} Acres</span>
                  </div>
                  {field.crop !== '—' && (
                    <>
                      <div className="h-1 w-1 rounded-full bg-gray-300" />
                      <div className="flex items-center gap-1 text-secondary text-body-sm">
                        <Sprout size={14} />
                        <span>{field.crop}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-on-primary shadow-fab active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>

      {/* Add Field bottom sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-surface shadow-xl">
            <div className="flex flex-col items-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            </div>
            <div className="px-4 pb-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-sm text-on-surface">Add New Field</h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="rounded-full p-2 text-secondary hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-body-sm text-on-surface-variant">Field Name</label>
                <input
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="e.g. North Field"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-body-sm text-on-surface-variant">Size</label>
                <div className="relative">
                  <input
                    value={fieldAcres}
                    onChange={(e) => setFieldAcres(e.target.value)}
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-16 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-on-surface-variant">
                    Acres
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-body-sm text-on-surface-variant">Notes (Optional)</label>
                <textarea
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  rows={3}
                  placeholder="Any notes about this field..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full rounded-lg bg-primary py-3.5 text-title-md text-on-primary hover:bg-primary-container transition-colors active:scale-[0.98]"
              >
                Save Field
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
