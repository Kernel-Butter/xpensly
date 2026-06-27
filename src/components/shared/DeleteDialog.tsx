'use client'

import { Drawer, ConfigProvider } from 'antd'
import { Trash2 } from 'lucide-react'

const antdTheme = {
  token: {
    colorPrimary: '#006b2c',
    colorBgMask: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
  },
}

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
  return (
    <ConfigProvider theme={antdTheme}>
      <Drawer
        open={open}
        onClose={onClose}
        placement="bottom"
        height="auto"
        closable={false}
        styles={{
          wrapper: {
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
          },
          body: { padding: 0 },
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-4">
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

          {/* Actions */}
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
      </Drawer>
    </ConfigProvider>
  )
}
