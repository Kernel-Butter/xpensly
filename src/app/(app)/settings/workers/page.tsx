'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, UserPlus, User, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app.store'
import { useWorkers } from '@/hooks/queries/useWorkers'
import { useCreateWorker } from '@/hooks/mutations/useCreateWorker'
import { useUpdateWorker } from '@/hooks/mutations/useUpdateWorker'
import { useDeleteWorker } from '@/hooks/mutations/useDeleteWorker'
import { fmtCurrency } from '@/lib/utils/format'
import type { Worker } from '@/types'

export default function WorkersPage() {
  const router = useRouter()
  const activeBusiness = useAppStore((s) => s.activeBusiness)
  const currency = activeBusiness?.config?.currency ?? 'PKR'
  const businessId = activeBusiness?.id

  const { data: workers = [], isLoading } = useWorkers(businessId)
  const { mutate: createWorker, isPending: isCreating } = useCreateWorker()
  const { mutate: updateWorker, isPending: isUpdating } = useUpdateWorker(businessId)
  const { mutate: deleteWorker } = useDeleteWorker(businessId)

  const [search, setSearch]       = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing]     = useState<Worker | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null)
  const [wName, setWName]   = useState('')
  const [wRate, setWRate]   = useState('')
  const [wNotes, setWNotes] = useState('')

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.notes ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  function openAdd() {
    setEditing(null)
    setWName('')
    setWRate('')
    setWNotes('')
    setSheetOpen(true)
  }

  function openEdit(w: Worker) {
    setEditing(w)
    setWName(w.name)
    setWRate(w.daily_rate?.toString() ?? '')
    setWNotes(w.notes ?? '')
    setSheetOpen(true)
  }

  function handleSubmit() {
    if (!wName.trim() || !businessId) return
    const rate = wRate ? parseFloat(wRate) : null

    if (editing) {
      updateWorker(
        { id: editing.id, name: wName.trim(), daily_rate: rate, notes: wNotes || null },
        { onSuccess: () => { setSheetOpen(false) } },
      )
    } else {
      createWorker(
        { business_id: businessId, name: wName.trim(), daily_rate: rate, notes: wNotes || null },
        { onSuccess: () => { setSheetOpen(false); setWName(''); setWRate(''); setWNotes('') } },
      )
    }
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
        <h1 className="text-headline-sm text-primary absolute left-1/2 -translate-x-1/2">Workers</h1>
        <div className="w-10" />
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pt-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workers…"
            className="h-11 w-full rounded-lg border border-gray-200 bg-surface py-2 pl-10 pr-4 text-body-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-gray-200 bg-surface p-3 flex flex-col justify-between h-[90px]">
            <span className="text-body-sm text-on-surface-variant">Total Workers</span>
            <span className="text-headline-md text-on-surface">{filtered.length}</span>
          </div>
          <div className="rounded-xl border border-gray-200 bg-surface p-3 flex flex-col justify-between h-[90px]">
            <span className="text-body-sm text-on-surface-variant">Total Daily Rate</span>
            <span className="text-headline-md text-on-surface">
              {fmtCurrency(filtered.reduce((s, w) => s + (w.daily_rate ?? 0), 0), currency)}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="rounded-xl border border-gray-200 bg-surface overflow-hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border-b border-gray-100">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1"><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-20" /></div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <User size={32} className="text-on-surface-variant opacity-40" />
              <p className="text-body-sm text-on-surface-variant">
                {search ? 'No workers match your search' : 'No workers yet'}
              </p>
            </div>
          ) : (
            filtered.map((w, idx) => (
              <div
                key={w.id}
                className={`flex items-center justify-between p-3 ${idx < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-title-md text-on-surface">{w.name}</p>
                    {w.notes && <p className="text-body-sm text-on-surface-variant">{w.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {w.daily_rate && (
                    <div className="flex flex-col items-end mr-2">
                      <span className="text-currency-sm text-on-surface">{fmtCurrency(w.daily_rate, currency)}</span>
                      <span className="text-label-xs text-on-surface-variant">/day</span>
                    </div>
                  )}
                  <button
                    onClick={() => openEdit(w)}
                    className="rounded-full p-2 text-on-surface-variant hover:bg-gray-100 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(w)}
                    className="rounded-full p-2 text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary text-on-primary shadow-fab active:scale-95 transition-transform"
      >
        <UserPlus size={22} />
      </button>

      {/* Delete confirmation */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-x-4 bottom-8 z-50 rounded-2xl bg-surface shadow-xl p-5 flex flex-col gap-4 max-w-sm mx-auto">
            <p className="text-title-md text-on-surface text-center">Remove <span className="font-bold">{deleteTarget.name}</span>?</p>
            <p className="text-body-sm text-on-surface-variant text-center">
              Their past wage entries will not be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-title-md text-on-surface hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteWorker(deleteTarget.id); setDeleteTarget(null) }}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-title-md text-white hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-surface shadow-xl">
            <div className="flex flex-col items-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            </div>
            <div className="px-4 pb-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-sm text-on-surface">{editing ? 'Edit Worker' : 'Add Worker'}</h2>
                <button onClick={() => setSheetOpen(false)} className="rounded-full p-2 text-on-surface-variant hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-body-sm text-on-surface-variant">Name</label>
                <input
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  placeholder="e.g. Akram"
                  autoFocus
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-body-sm text-on-surface-variant">Daily Rate (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-sm text-on-surface-variant">₨</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={wRate}
                    onChange={(e) => setWRate(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-body-sm text-on-surface-variant">Role / Notes (Optional)</label>
                <input
                  value={wNotes}
                  onChange={(e) => setWNotes(e.target.value)}
                  placeholder="e.g. Supervisor"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={(isCreating || isUpdating) || !wName.trim()}
                className="w-full rounded-lg bg-primary py-3.5 text-title-md text-on-primary active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {(isCreating || isUpdating) && <Loader2 size={16} className="animate-spin" />}
                {editing ? 'Save Changes' : 'Add Worker'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
