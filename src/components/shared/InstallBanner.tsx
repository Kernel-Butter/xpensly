'use client'

import { useState } from 'react'
import { Download, X, Share, Plus } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export function InstallBanner() {
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [iosHintOpen, setIosHintOpen] = useState(false)

  if (isInstalled || dismissed) return null
  if (!canInstall && !isIOS) return null

  return (
    <>
      {/* Install banner */}
      <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl bg-on-surface shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* App icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary">
            <span className="text-[22px]">🌿</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-title-md text-on-primary truncate">Install Xpensly</p>
            <p className="text-label-sm text-on-surface-variant truncate">
              Add to home screen for offline access
            </p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full p-1.5 text-on-surface-variant hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-3">
          {isIOS ? (
            <button
              onClick={() => setIosHintOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-title-md text-on-primary transition-colors active:scale-[0.98]"
            >
              <Share size={17} />
              How to install
            </button>
          ) : (
            <button
              onClick={promptInstall}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-title-md text-on-primary transition-colors active:scale-[0.98]"
            >
              <Download size={17} />
              Install App
            </button>
          )}
        </div>
      </div>

      {/* iOS instructions sheet */}
      {iosHintOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIosHintOpen(false)} />
          <div className="relative z-10 rounded-t-3xl bg-surface px-6 pb-10 pt-5 flex flex-col gap-5">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200" />
            <h2 className="text-headline-sm text-on-surface text-center">Add to Home Screen</h2>

            <ol className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary text-label-sm font-bold">1</div>
                <div>
                  <p className="text-title-md text-on-surface">Tap the Share button</p>
                  <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    Look for <Share size={14} className="inline" /> at the bottom of Safari
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary text-label-sm font-bold">2</div>
                <div>
                  <p className="text-title-md text-on-surface">Scroll down and tap</p>
                  <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <Plus size={14} className="inline" /> <strong>Add to Home Screen</strong>
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary text-label-sm font-bold">3</div>
                <div>
                  <p className="text-title-md text-on-surface">Tap Add</p>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">Xpensly will appear on your home screen like a native app</p>
                </div>
              </li>
            </ol>

            <button
              onClick={() => setIosHintOpen(false)}
              className="w-full rounded-xl bg-primary py-3.5 text-title-md text-on-primary active:scale-[0.98] transition-transform"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
