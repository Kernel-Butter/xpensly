'use client'

import { Trash2 } from 'lucide-react'

interface DeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmLabel?: string
}

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete this item?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
}: DeleteDialogProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[55] bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl bg-surface shadow-2xl animate-in slide-in-from-bottom duration-300 ease-out">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-10 flex flex-col gap-5">
          {/* Icon + text */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-headline-sm text-on-surface">{title}</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">{description}</p>
            </div>
          </div>

          {/* Actions — destructive first (visually prominent) */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onConfirm}
              className="w-full rounded-xl bg-red-500 py-3.5 text-title-md font-medium text-white hover:bg-red-600 active:scale-[0.98] transition-all"
            >
              {confirmLabel}
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 text-title-md text-on-surface hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
