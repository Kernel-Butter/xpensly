'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, CheckCircle, Calendar, Camera, ChevronDown, AlertCircle } from 'lucide-react'
import { Drawer, ConfigProvider } from 'antd'
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

const antdTheme = {
  token: {
    colorPrimary: '#006b2c',
    colorBgMask: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
  },
}

export function AddExpenseSheet() {
  const {
    isAddExpenseOpen, closeAddExpense, closeEditExpense,
    activePeriod, activeBusiness, editingExpense,
  } = useAppStore()

  const config    = activeBusiness?.config ?? agricultureConfig
  const currency  = config.currency
  const periodId  = activePeriod?.id ?? ''
  const isEditMode = !!editingExpense

  const { mutate: addExpense,    isPending: isAdding   } = useAddExpense(periodId)
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense(periodId)
  const { data: workers = [] }                           = useWorkers(activeBusiness?.id)
  const isPending = isAdding || isUpdating

  const [receiptFile,      setReceiptFile]      = useState<File | null>(null)
  const [receiptPreview,   setReceiptPreview]   = useState<string | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date:        today(),
      category_id: config.categories[0]?.id ?? '',
      total:       0,
    },
  })

  const quantity      = watch('quantity')
  const unit_cost     = watch('unit_cost')
  const total         = watch('total')
  const selectedCatId = watch('category_id')
  const selectedCat   = config.categories.find((c) => c.id === selectedCatId)
  const isWageCat     = selectedCat?.isWageType === true
  const noPeriod      = !periodId
  const noBusiness    = !activeBusiness

  useEffect(() => {
    if (editingExpense) {
      reset({
        date:        editingExpense.date,
        category_id: editingExpense.category_id,
        sub_item:    editingExpense.sub_item    ?? undefined,
        description: editingExpense.description ?? undefined,
        quantity:    editingExpense.quantity    ?? undefined,
        unit_cost:   editingExpense.unit_cost   ?? undefined,
        total:       editingExpense.total,
        worker_id:   editingExpense.worker_id   ?? undefined,
      })
      if (editingExpense.receipt_url) setReceiptPreview(editingExpense.receipt_url)
    } else {
      reset({ date: today(), category_id: config.categories[0]?.id ?? '', total: 0 })
      setReceiptFile(null)
      setReceiptPreview(null)
    }
  }, [editingExpense, reset, config.categories])

  useEffect(() => {
    const computed = calculateTotal(quantity ?? null, unit_cost ?? null)
    if (computed !== null) setValue('total', computed)
  }, [quantity, unit_cost, setValue])

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
    const ext  = file.name.split('.').pop()
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
    if (receiptFile) receiptUrl = await uploadReceipt(receiptFile)

    if (isEditMode && editingExpense) {
      updateExpense(
        {
          id:          editingExpense.id as ExpenseId,
          date:        values.date,
          category_id: values.category_id,
          sub_item:    values.sub_item    ?? null,
          description: values.description ?? null,
          quantity:    values.quantity    ?? null,
          unit_cost:   values.unit_cost   ?? null,
          total:       values.total,
          worker_id:   values.worker_id   ?? null,
          receipt_url: receiptUrl,
        },
        { onSuccess: handleClose },
      )
    } else {
      addExpense(
        {
          date:        values.date,
          category_id: values.category_id,
          sub_item:    values.sub_item    ?? null,
          description: values.description ?? null,
          quantity:    values.quantity    ?? null,
          unit_cost:   values.unit_cost   ?? null,
          total:       values.total,
          worker_id:   values.worker_id   ?? null,
          business_id: activeBusiness?.id ?? '',
          receipt_url: receiptUrl,
        },
        { onSuccess: handleClose },
      )
    }
  }

  const submitFooter = (
    <div className="px-4 py-3">
      {noBusiness || noPeriod ? (
        <div className="rounded-xl bg-gray-100 py-3.5 text-center text-title-md text-on-surface-variant">
          {noBusiness ? 'Select a business to continue' : 'Create a season to continue'}
        </div>
      ) : (
        <button
          type="submit"
          form="expense-form"
          disabled={isPending || uploadingReceipt}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-title-md text-on-primary shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <CheckCircle size={20} />
          {uploadingReceipt ? 'Uploading…' : isPending ? 'Saving…' : isEditMode ? 'Update Expense' : 'Save Expense'}
        </button>
      )}
    </div>
  )

  return (
    <ConfigProvider theme={antdTheme}>
      <Drawer
        open={isAddExpenseOpen}
        onClose={handleClose}
        placement="bottom"
        height="92dvh"
        closable={false}
        footer={submitFooter}
        styles={{
          wrapper: { borderRadius: '24px 24px 0 0', overflow: 'hidden' },
          body:    { padding: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
          footer:  { padding: 0, borderTop: '1px solid #f3f4f6' },
        }}
      >
        {/* Handle + title row */}
        <div className="sticky top-0 z-10 bg-surface flex flex-col items-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-200 mb-3" />
          <div className="w-full flex items-center justify-center px-4 relative">
            <h2 className="text-headline-sm text-on-surface">
              {isEditMode ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <button
              onClick={handleClose}
              className="absolute right-4 rounded-full p-1 text-on-surface-variant hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 pt-2 pb-4 space-y-5">
          {/* Blocking banners */}
          {noBusiness && (
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-title-md text-amber-800">No business selected</p>
                <p className="text-body-sm text-amber-700">Go to Settings → Businesses to create or select one.</p>
              </div>
            </div>
          )}

          {!noBusiness && noPeriod && (
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-title-md text-amber-800">No active season</p>
                <p className="text-body-sm text-amber-700">Create a season first — tap the season banner on the dashboard.</p>
              </div>
            </div>
          )}

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
                        ? 'border-2'
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
            {errors.category_id && (
              <p className="mt-1 text-label-xs text-red-500">{errors.category_id.message}</p>
            )}
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
                  className={cn(
                    'w-full rounded-lg border bg-gray-50 py-3 pl-9 pr-4 text-body-base focus:outline-none focus:ring-1 transition-colors',
                    errors.date
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-200 focus:border-primary focus:ring-primary',
                  )}
                />
              </div>
              {errors.date && <p className="mt-1 text-label-xs text-red-500">{errors.date.message}</p>}
            </div>

            {/* Worker picker — wage categories only */}
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

            {/* Receipt */}
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
            <div className={cn(
              'flex items-center justify-between rounded-xl border p-3',
              errors.total ? 'border-red-300 bg-red-50' : 'border-primary/20 bg-surface-green',
            )}>
              <span className={cn('text-title-md', errors.total ? 'text-red-700' : 'text-primary-dark')}>
                Total Amount
              </span>
              <span className={cn('text-headline-md', errors.total ? 'text-red-700' : 'text-primary-dark')}>
                {fmtCurrency(total ?? 0, currency)}
              </span>
            </div>
            {errors.total && (
              <p className="text-label-xs text-red-500">
                {errors.total.message ?? 'Enter an amount greater than 0'}
              </p>
            )}
          </form>
        </div>
      </Drawer>
    </ConfigProvider>
  )
}
