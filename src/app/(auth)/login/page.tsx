'use client'

import { useState } from 'react'
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase/auth'
import { cn } from '@/lib/utils/cn'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'signin') {
      const result = await signInWithEmail(email, password)
      if (result?.error) setError(result.error)
    } else {
      const result = await signUpWithEmail(email, password, fullName)
      if (result?.error) setError(result.error)
      if (result?.success) setSuccess(result.success)
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Logo */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary-light shadow-[0_4px_12px_rgba(22,163,74,0.3)]">
          <span className="font-mono text-2xl font-bold text-white">ₓ</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Xpensly</h1>
        <p className="mt-1 text-sm text-gray-500">Field expense tracker</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Tab switcher */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); setSuccess(null) }}
              className={cn(
                'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
                mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500',
              )}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammad Ali"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary-light focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-danger-red">{error}</p>
          )}
          {success && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-primary-light">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-light py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
