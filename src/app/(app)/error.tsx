'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container">
        <AlertCircle size={32} className="text-danger-red" />
      </div>
      <h2 className="text-headline-sm text-on-surface">Something went wrong</h2>
      <p className="text-body-sm text-on-surface-variant max-w-xs">{error.message}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 text-title-md text-on-primary"
        >
          Try again
        </button>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg border border-gray-200 bg-surface px-5 py-2.5 text-title-md text-on-surface"
        >
          Go home
        </button>
      </div>
    </div>
  )
}
