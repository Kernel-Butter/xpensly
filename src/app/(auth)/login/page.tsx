'use client'

import { useState } from 'react'
import { signInWithEmail, signUpWithEmail } from '@/lib/supabase/auth'
import { cn } from '@/lib/utils/cn'
import {
  User, Lock, Eye, EyeOff, ArrowRight, Mail,
  Sprout,
} from 'lucide-react'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [agreed, setAgreed] = useState(false)
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
      if (!agreed) { setError('Please agree to the Terms of Service.'); setLoading(false); return }
      const result = await signUpWithEmail(email, password, fullName)
      if (result?.error) setError(result.error)
      if (result?.success) setSuccess(result.success)
    }

    setLoading(false)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSuccess(null)
    setShowPassword(false)
  }

  return (
    <div className="w-full max-w-[400px]">
      {mode === 'signin' ? (
        /* ── LOGIN CARD ── */
        <div className="w-full rounded-xl border border-gray-200 bg-surface p-4 flex flex-col gap-6">
          {/* Header */}
          <header className="flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container mb-2">
              <Sprout size={24} strokeWidth={2} />
            </div>
            <h1 className="text-[24px] font-bold leading-tight text-primary">Xpensly</h1>
            <p className="text-[13px] text-secondary">Welcome Back</p>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Email/Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-secondary ml-1" htmlFor="identifier">
                Email or Phone
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" />
                <input
                  id="identifier"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or phone"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-[15px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] text-secondary" htmlFor="password">Password</label>
                <button type="button" className="text-[11px] text-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-10 text-[15px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-error-container px-3 py-2 text-[13px] text-danger-red">{error}</p>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-[17px] font-[500] text-on-primary transition-colors hover:bg-primary-green-dark disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Login'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] text-secondary">Or sign up with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface py-3 text-[13px] text-on-surface transition-colors hover:bg-gray-50"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.4 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.7 7.1 29.1 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.7 7.1 29.1 5 24 5c-7.6 0-14.2 4.2-17.7 9.7z"/>
              <path fill="#4CAF50" d="M24 45c5 0 9.6-1.9 13-5l-6-5.2C29.3 36.5 26.8 37.5 24 37.5c-5.2 0-9.5-3.5-11.1-8.2l-6.5 5C9.7 40.7 16.4 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6 5.2C40.8 35.7 44 30.8 44 25c0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            Google
          </button>

          {/* Switch to signup */}
          <p className="text-center text-[13px] text-secondary">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="ml-1 text-[17px] font-[500] text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      ) : (
        /* ── SIGN UP CARD ── */
        <div className="w-full rounded-xl border border-gray-200 bg-surface-container-lowest overflow-hidden flex flex-col">
          {/* Top bar */}
          <header className="flex w-full items-center justify-center gap-2 border-b border-gray-200 bg-surface px-4 py-6">
            <Sprout size={28} className="text-primary" />
            <h1 className="text-[24px] font-bold text-primary">Xpensly</h1>
          </header>

          {/* Form */}
          <div className="flex flex-col gap-4 p-4">
            <div className="mb-1">
              <h2 className="text-[20px] font-[600] text-on-surface">Create your account</h2>
              <p className="text-[13px] text-secondary mt-1">Start tracking your agricultural expenses today.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[17px] font-[500] text-on-surface" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <User size={20} className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammad Ali"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-2 text-[15px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Email/Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-[17px] font-[500] text-on-surface" htmlFor="signupEmail">Email or Phone</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    id="signupEmail"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-2 text-[15px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[17px] font-[500] text-on-surface" htmlFor="signupPassword">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    id="signupPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-9 text-[15px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="mt-1 flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-[18px] w-[18px] cursor-pointer rounded border-gray-200 bg-gray-50 text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="cursor-pointer text-[13px] text-secondary">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                </label>
              </div>

              {error && (
                <p className="rounded-lg bg-error-container px-3 py-2 text-[13px] text-danger-red">{error}</p>
              )}
              {success && (
                <p className="rounded-lg bg-surface-green px-3 py-2 text-[13px] text-primary">{success}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-[6px] bg-primary py-3 text-[17px] font-[500] text-on-primary transition-colors hover:bg-primary-container active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Create Account'}
                {!loading && <ArrowRight size={20} />}
              </button>

              {/* Switch to login */}
              <p className="mt-1 text-center text-[13px] text-secondary">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-primary font-[500] hover:underline"
                >
                  Log in here
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
