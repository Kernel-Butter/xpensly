'use client'

import { type ReactNode } from 'react'
import { Drawer, ConfigProvider } from 'antd'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const antdTheme = {
  token: {
    colorPrimary: '#006b2c',
    colorBgMask: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    borderRadiusLG: 24,
    fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
  },
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  contentClassName?: string
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  contentClassName,
}: BottomSheetProps) {
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
            maxHeight: '90dvh',
          },
          body: {
            padding: 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          },
        }}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 flex flex-col items-center bg-surface pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-200" />
        </div>

        {/* Optional titled header with close button */}
        {title && (
          <div className="flex items-center justify-between px-4 pt-1 pb-3">
            <h2 className="text-headline-sm text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-on-surface-variant hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn('px-4 pb-10 flex flex-col gap-5', contentClassName)}>
          {children}
        </div>
      </Drawer>
    </ConfigProvider>
  )
}
