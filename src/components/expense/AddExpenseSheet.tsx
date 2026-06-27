'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, CheckCircle, Calendar, Camera, ChevronDown } from 'lucide-react'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { useAppStore } from '@/store/app.store'
import { useAddExpense } from '@/hooks/mutations/useAddExpense'
import { useUpdateExpense } from '@/hooks/mutations/useUpdateExpense'
import { useWorkers } from '@/hooks/queries/useWorkers'
import { expenseSchema, type ExpenseFormValues } from '@/schemas/expense.schema'
import { calculateTotal } from '@/lib/utils/math'
import { today } from '@/lib/utils/date'
import { agricultureConfig } from '@/lib/config/business-configs'
import { fmtCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { supabase } from '@/lib/supabase/client'
import type { ExpenseId } from '@/types'

export function AddExpenseSheet() {
  const {
    isAddExpenseOpen, closeAddExpense, closeEditExpense,
    activePeriod, activeBusiness, editingExpense,
  } = useAppStore()

  const config = activeBusiness?.config ?? agricultureConfig
  const currency = config.currency
  const periodId = activePeriod?.id ?? ''
  const isEditMode = !!editingExpense

  const { mutate: addExpense, isPending: isAdding } = useAddExpense(periodId)
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense(periodId)
  const { data: workers = [] } = useWorkers(activeBusiness?.id)
  const isPending = isAdding || isUpdating

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: today(),
      category_id: config.categories[0]?.id ?? '',
      total: 0,
    },
  })

  const quantity      = watch('quantity')
  const unit_cost     = watch('unit_cost')
  const total         = watch('total')
  const selectedCatId = watch('category_id')
  const selectedCat   = config.categories.find((c) => c.id === selectedCatId)
  const isWageCat     = selectedCat?.isWageType === true

  // Pre-fill form when editing
  useEffect(() => {
    if (editingExpense) {
      reset({
        date:        editingExpense.date,
        category_id: editingExpense.category_id,
        sub_item:    editingExpense.sub_item ?? undefined,
        description: editingExpense.description ?? undefined,
        quantity:    editingExpense.quantity ?? undefined,
        unit_cost:   editingExpense.unit_cost ?? undefined,
        total:       editingExpense.total,
        worker_id:   editingExpense.worker_id ?? undefined,
      })
      if (editingExpense.receipt_url) setReceiptPreview(editingExpense.receipt_url)
    } else {
      reset({ date: today(), category_id: config.categories[0]?.id ?? '', total: 0 })
      setReceiptFile(null)
      setReceiptPreview(null)
    }
  }, [editingExpense, reset, config.categories])

  // Auto-compute total from qty × unit cost
  useEffect(() => {
    const computed = calculateTotal(quantity ?? null, unit_cost ?? null)
    if (computed !== null) setValue('total', computed)
  }, [quantity, unit_cost, setValue])

  // Auto-fill unit cost from selected worker's daily rate
  function handleWorkerChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const workerId = e.target.value
    setValue('worker_id', workerId || undefined)
    if (workerId) {
      const worker = workers.find((w) => w.id === workerId)
      if (worker?.daily_rate) setValue('unit_cost', worker.daily_rate)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setReceiptFile(file)
    setReceiptPreview(URL.createObjectURL(file))
  }

  async function uploadReceipt(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `${activeBusiness?.id}/${Date.now()}.${ext}`
    setUploadingReceipt(true)
    try {
      const { error } = await supabase.storage.from('receipts').upload(path, file)
      if (error) { console.error('Receipt upload failed:', error.message); return null }
      const { data } = supabase.storage.from('receipts').getPublicUrl(path)
      return data.publicUrl
    } finally {
      setUploadingReceipt(false)
    }
  }

  function handleClose() {
    reset()
    setReceiptFile(null)
    setReceiptPreview(null)
    if (isEditMode) closeEditExpense()
    else closeAddExpense()
  }

  async function onSubmit(values: ExpenseFormValues) {
    if (!periodId) return

    let receiptUrl: string | null = editingExpense?.receipt_url ?? null
    if (receiptFile) {
      receiptUrl = await uploadReceipt(receiptFile)
    }

    if (isEditMode && editingExpense) {
      updateExpense(
        {
          id:          editingExpense.id as ExpenseId,
          date:        values.date,
          category_id: values.category_id,
          sub_item:    values.sub_item ?? null,
          description: values.description ?? null,
          quantity:    values.quantity ?? null,
          unit_cost:   values.unit_cost ?? null,
          total:       values.total,
          worker_id:   values.worker_id ?? null,
          receipt_url: receiptUrl,
        },
        { onSuccess: handleClose },
      )
    } else {
      addExpense(
        {
          date:        values.date,
          category_id: values.category_id,
          sub_item:    values.sub_item ?? null,
          description: values.description ?? null,
          quantity:    values.quantity ?? null,
          unit_cost:   values.unit_cost ?? null,
          total:       values.total,
          worker_id:   values.worker_id ?? null,
          business_id: activeBusiness?.id ?? '',
          receipt_url: receiptUrl,
        },
        { onSuccess: handleClose },
      )
    }
  }

  if (!isAddExpenseOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-on-background/40" onClick={handleClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-3xl bg-surface shadow-xl animate-in slide-in-from-bottom duration-300">
        <div className="flex flex-col items-center pt-3 pb-2 relative">
          <div className="h-1.5 w-12 rounded-full bg-gray-200 mb-3" />
          <h2 className="text-headline-sm text-on-surface w-full text-center px-4">
            {isEditMode ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={handleClose}
            className="absolute top-3 right-4 rounded-full p-1 text-on-surface-variant hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-28 space-y-5 mt-1">
          {/* Category pills */}
          <div>
            <p className="text-title-md text-on-surface-variant mb-3">Category</p>
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {config.categories.map((cat) => {
                const active = selectedCatId === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setValue('category_id', cat.id)}
                    className={cn(
                      'shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-colors',
                      active
                        ? 'border-2 text-white'
                        : 'border border-gray-200 bg-gray-50 text-on-surface-variant hover:bg-gray-100',
                    )}
                    style={active ? { borderColor: cat.color, backgroundColor: `${cat.color}20`, color: cat.color } : {}}
                  >
                    <CategoryIcon iconName={cat.icon} size={18} />
                    <span className="text-title-md whitespace-nowrap">{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-body-sm text-on-surface-variant mb-1">Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="date"
                  {...register('date')}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-9 pr-4 text-body-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Worker picker — only for wage categories */}
            {isWageCat && workers.length > 0 && (
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1">Worker</label>
                <div className="relative">
                  <select
                    onChange={handleWorkerChange}
                    defaultValue={editingExpense?.worker_id ?? ''}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="">Select worker…</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}{w.daily_rate ? ` — ₨${w.daily_rate}/day` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                </div>
              </div>
            )}

            {/* Qty + Unit cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1">
                  {isWageCat ? 'Days' : 'Qty / Area'}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="e.g. 50"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 px-4 text-currency-md text-right focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1">
                  {isWageCat ? 'Daily Rate (₨)' : `Unit Cost (${currency === 'PKR' ? '₨' : currency})`}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  {...register('unit_cost', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 px-4 text-currency-md text-right focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-body-sm text-on-surface-variant mb-1">Notes (Optional)</label>
              <input
                type="text"
                {...register('description')}
                placeholder="e.g. DAP for Field B"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 px-4 text-body-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Receipt photo */}
            <div>
              <label className="block text-body-sm text-on-surface-variant mb-1">Receipt (Optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              {receiptPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receiptPreview}
                    alt="Receipt"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => { setReceiptFile(null); setReceiptPreview(null) }}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-3 text-body-sm text-on-surface-variant hover:bg-gray-100 transition-colors"
                >
                  <Camera size={18} />
                  Take photo or upload
                </button>
              )}
            </div>

            {/* Total preview */}
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-surface-green p-3">
              <span className="text-title-md text-primary-dark">Total Amount</span>
              <span className="text-headline-md text-primary-dark">
                {fmtCurrency(total ?? 0, currency)}
              </span>
            </div>

            {errors.total && (
              <p className="text-label-xs text-danger-red">{errors.total.message}</p>
            )}

            {!periodId && (
              <p className="text-center text-label-xs text-on-surface-variant">
                No active period — set up a crop season from the dashboard
              </p>
            )}
          </form>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-surface p-4">
          <button
            type="submit"
            form="expense-form"
            disabled={isPending || uploadingReceipt || !periodId}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-title-md text-on-primary shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <CheckCircle size={20} />
            {uploadingReceipt ? 'Uploading…' : isPending ? 'Saving…' : isEditMode ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </div>
    </>
  )
}
