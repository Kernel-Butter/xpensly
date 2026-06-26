'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Store, Wallet, Bell, AlertTriangle, Moon,
  Shield, LogOut, ChevronRight, CircleUser,
} from 'lucide-react'
import { TopAppBar } from '@/components/shared/TopAppBar'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app.store'

export default function SettingsPage() {
  const router = useRouter()
  const activeBusiness = useAppStore((s) => s.activeBusiness)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <TopAppBar />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 space-y-6">
        {/* Profile card */}
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-surface p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
            <CircleUser size={32} className="text-primary" />
          </div>
          <div>
            <p className="text-title-md text-on-surface">{activeBusiness?.name ?? 'My Business'}</p>
            <p className="text-body-sm text-on-surface-variant">Farm Operations</p>
          </div>
        </div>

        {/* Business Settings */}
        <SettingsGroup title="Business Settings">
          <SettingsRow
            icon={<Store size={20} className="text-primary" />}
            label="Business Profile"
            href="/settings/business"
          />
          <SettingsRow
            icon={<Wallet size={20} className="text-primary" />}
            label="Currency & Formats"
            trailing={<span className="text-currency-sm text-on-surface-variant">PKR (₨)</span>}
            href="/settings/currency"
            last
          />
        </SettingsGroup>

        {/* Manage */}
        <SettingsGroup title="Manage">
          <SettingsRow
            icon={<Bell size={20} className="text-primary" />}
            label="Manage Categories"
            href="/settings/categories"
          />
          <SettingsRow
            icon={<Shield size={20} className="text-primary" />}
            label="Manage Workers"
            href="/settings/workers"
            last
          />
        </SettingsGroup>

        {/* Notifications */}
        <SettingsGroup title="Notifications">
          <SettingsRow
            icon={<Bell size={20} className="text-primary" />}
            label="Push Notifications"
            trailing={<Toggle on />}
          />
          <SettingsRow
            icon={<AlertTriangle size={20} className="text-primary" />}
            label="Budget Alerts"
            href="/settings/alerts"
            last
          />
        </SettingsGroup>

        {/* Appearance */}
        <SettingsGroup title="Appearance">
          <SettingsRow
            icon={<Moon size={20} className="text-primary" />}
            label="Theme"
            trailing={<span className="text-body-sm text-on-surface-variant">System</span>}
            href="/settings/theme"
            last
          />
        </SettingsGroup>

        {/* Account */}
        <SettingsGroup title="Account">
          <SettingsRow
            icon={<Shield size={20} className="text-primary" />}
            label="Security & Privacy"
            href="/settings/security"
          />
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-between p-3 hover:bg-error-container transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-container/50">
                <LogOut size={20} className="text-error" />
              </div>
              <span className="text-body-base text-error">Sign Out</span>
            </div>
          </button>
        </SettingsGroup>

        <p className="text-center text-body-sm text-on-surface-variant pb-2">Xpensly v1.0.0</p>
      </main>
    </div>
  )
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-title-md text-primary mb-2 px-1">{title}</h3>
      <div className="rounded-xl border border-gray-200 bg-surface overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({
  icon, label, trailing, href, last,
}: {
  icon: React.ReactNode
  label: string
  trailing?: React.ReactNode
  href?: string
  last?: boolean
}) {
  const inner = (
    <div className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors ${last ? '' : 'border-b border-gray-100'}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container">
          {icon}
        </div>
        <span className="text-body-base text-on-surface">{label}</span>
      </div>
      <div className="flex items-center gap-1 text-on-surface-variant">
        {trailing}
        {href && <ChevronRight size={18} />}
      </div>
    </div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`relative inline-block h-6 w-12 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-gray-200'}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${on ? 'left-7' : 'left-1'}`} />
    </div>
  )
}
