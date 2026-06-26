'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAppStore } from '@/store/app.store'
import { useAddExpense } from '@/hooks/mutations/useAddExpense'
import { expenseSchema, type ExpenseFormValues } from '@/schemas/expense.schema'
import { CategoryPills } from './CategoryPills'
import { calculateTotal } from '@/lib/utils/math'
import { today } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { agricultureConfig } from '@/lib/config/business-configs'

export function AddExpenseSheet() {
  const { isAddExpenseOpen, closeAddExpense, activePeriod, activeBusiness } = useAppStore()

  const config = activeBusiness?.config ?? agricultureConfig
  const periodId = activePeriod?.id ?? ''

  const { mutate: addExpense, isPending } = useAddExpense(periodId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date:        today(),
      category_id: config.categories[0]?.id ?? '',
      total:       0,
    },
  })

  const quantity  = watch('quantity')
  const unit_cost = watch('unit_cost')

  useEffect(() => {
    const computed = calculateTotal(quantity ?? null, unit_cost ?? null)
    if (computed !== null) setValue('total', computed)
  }, [quantity, unit_cost, setValue])

  function onSubmit(values: ExpenseFormValues) {
    if (!periodId) return
    addExpense(
      {
        date:         values.date,
        category_id:  values.category_id,
        sub_item:     values.sub_item ?? null,
        description:  values.description ?? null,
        quantity:     values.quantity ?? null,
        unit_cost:    values.unit_cost ?? null,
        total:        values.total,
        worker_id:    values.worker_id ?? null,
        business_id:  activeBusiness?.id ?? '',
      },
      {
        onSuccess: () => {
          reset()
          closeAddExpense()
        },
      },
    )
  }

  return (
    <Sheet open={isAddExpenseOpen} onOpenChange={(open) => { if (!open) closeAddExpense() }}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-4">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-[20px] font-[600]">Add Expense</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category */}
          <CategoryPills
            categories={config.categories}
            selected={watch('category_id')}
            onSelect={(id) => setValue('category_id', id)}
          />

          {/* Date */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
            <input
              type="date"
              {...register('date')}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Description <span className="text-gray-300">(optional)</span>
            </label>
            <input
              type="text"
              {...register('description')}
              placeholder="e.g. Urea for wheat"
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
            />
          </div>

          {/* Quantity + Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Qty / Area</label>
              <input
                type="number"
                inputMode="decimal"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="6"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Rate</label>
              <input
                type="number"
                inputMode="decimal"
                {...register('unit_cost', { valueAsNumber: true })}
                placeholder="5100"
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
              />
            </div>
          </div>

          {/* Total */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Total (PKR)</label>
            <input
              type="number"
              inputMode="decimal"
              {...register('total', { valueAsNumber: true })}
              placeholder="30,600"
              className={cn(
                'w-full rounded-md border bg-gray-50 px-3 py-2.5 font-mono text-[17px] font-[600] focus:outline-none',
                errors.total ? 'border-danger-red' : 'border-gray-200 focus:border-primary-light',
              )}
            />
            {errors.total && (
              <p className="mt-1 text-xs text-danger-red">{errors.total.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !periodId}
            className="w-full rounded-md bg-primary-light py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save Expense'}
          </button>

          {!periodId && (
            <p className="text-center text-xs text-gray-400">
              Select a period first from the dashboard
            </p>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}
