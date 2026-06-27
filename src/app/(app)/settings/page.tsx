'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2, Tag, LogOut, ChevronRight, CircleUser, Users, MapPin,
} from 'lucide-react'
import { TopAppBar } from '@/components/shared/TopAppBar'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app.store'
import { useBusinesses } from '@/hooks/queries/useBusinesses'

export default function SettingsPage() {
  const router = useRouter()
  const { activeBusiness, resetSession } = useAppStore()
  const { data: businesses = [] } = useBusinesses()

  async function handleSignOut() {
    resetSession()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <TopAppBar />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 space-y-6">
        {/* Active business card */}
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-surface p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
            <CircleUser size={28} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-title-md text-on-surface truncate">{activeBusiness?.name ?? 'No business selected'}</p>
            <p className="text-body-sm text-on-surface-variant capitalize">{activeBusiness?.type ?? '—'}</p>
          </div>
          <Link
            href="/settings/businesses"
            className="text-body-sm text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-surface-green transition-colors shrink-0"
          >
            Switch
          </Link>
        </div>

        {/* Businesses */}
        <SettingsGroup title="Businesses">
          <SettingsRow
            icon={<Building2 size={20} className="text-primary" />}
            label="My Businesses"
            trailing={
              <span className="text-body-sm text-on-surface-variant mr-1">{businesses.length}</span>
            }
            href="/settings/businesses"
            last
          />
        </SettingsGroup>

        {/* Manage */}
        <SettingsGroup title="Manage">
          <SettingsRow
            icon={<Tag size={20} className="text-primary" />}
            label="Categories"
            trailing={
              <span className="text-body-sm text-on-surface-variant mr-1">
                {activeBusiness?.config?.categories?.length ?? 0}
              </span>
            }
            href="/settings/categories"
          />
          <SettingsRow
            icon={<Users size={20} className="text-primary" />}
            label="Workers"
            href="/settings/workers"
          />
          <SettingsRow
            icon={<MapPin size={20} className="text-primary" />}
            label="Fields"
            href="/settings/fields"
            last
          />
        </SettingsGroup>

        {/* Account */}
        <SettingsGroup title="Account">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-between p-3 hover:bg-red-50 transition-colors rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <LogOut size={20} className="text-red-500" />
              </div>
              <span className="text-body-base text-red-500">Sign Out</span>
            </div>
          </button>
        </SettingsGroup>

        <p className="text-center text-label-xs text-on-surface-variant pb-2">Xpensly v1.0.0</p>
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
