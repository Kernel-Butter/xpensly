'use client'

import { useRouter } from 'next/navigation'
import { RefreshCw, Pencil, ChevronRight, Bell, Shield, HelpCircle, LogOut, Plus, MoreVertical, CircleUser } from 'lucide-react'
import { TopAppBar } from '@/components/shared/TopAppBar'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app.store'

const TEAM = [
  { id: '1', name: 'Sarah Miller', role: 'Manager',  initials: 'SM', hasAvatar: false },
  { id: '2', name: 'David Barnes', role: 'Foreman',  initials: 'DB', hasAvatar: false },
]

export default function ProfilePage() {
  const router = useRouter()
  const activeBusiness = useAppStore((s) => s.activeBusiness)

  async function handleSignOut() {
    useAppStore.getState().resetSession()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <TopAppBar
        leftSlot={
          <button className="rounded-full p-1 text-on-surface-variant hover:bg-gray-100 transition-colors">
            <RefreshCw size={20} />
          </button>
        }
        rightSlot={
          <button className="rounded-full p-1 text-on-surface-variant hover:bg-gray-100 transition-colors">
            <CircleUser size={20} />
          </button>
        }
      />

      <main className="mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-6">
        {/* Profile card */}
        <section className="relative flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-surface p-4">
          <button className="absolute top-3 right-3 rounded-full p-2 text-primary hover:bg-gray-100 transition-colors">
            <Pencil size={18} />
          </button>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-container-high border-2 border-primary">
            <CircleUser size={48} className="text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-headline-sm text-on-surface">{activeBusiness?.name ?? 'My Business'}</h2>
            <p className="text-body-base text-on-surface-variant mt-1">Farm Operations</p>
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-surface-green text-primary rounded-full border border-primary/20">
              <Shield size={14} />
              <span className="text-title-md text-[13px]">Owner</span>
            </div>
          </div>
        </section>

        {/* Business Details */}
        <ProfileGroup title="Business Details">
          <ProfileRow
            icon={<span className="text-lg">🌾</span>}
            label="Farm Name"
            subtitle={activeBusiness?.name ?? 'Not set'}
          />
          <ProfileRow
            icon={<span className="text-lg">📍</span>}
            label="Location"
            subtitle="Pakistan"
            last
          />
        </ProfileGroup>

        {/* Team Members */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-title-md text-on-surface">Team Members</h3>
            <button className="text-title-md text-primary text-[15px] hover:underline">Manage</button>
          </div>
          <div className="rounded-xl border border-gray-200 bg-surface overflow-hidden divide-y divide-gray-100">
            {TEAM.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-secondary text-headline-sm font-bold">
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-title-md text-on-surface">{member.name}</p>
                    <p className="text-body-sm text-on-surface-variant">{member.role}</p>
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-gray-200 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-1 py-3 text-primary text-title-md hover:bg-gray-50 transition-colors">
              <Plus size={18} /> Invite Member
            </button>
          </div>
        </section>

        {/* Preferences */}
        <ProfileGroup title="Preferences">
          <ProfileRow icon={<Bell size={18} className="text-on-surface-variant" />} label="Notifications" />
          <ProfileRow icon={<Shield size={18} className="text-on-surface-variant" />} label="Security" />
          <ProfileRow icon={<HelpCircle size={18} className="text-on-surface-variant" />} label="Help & Support" last />
        </ProfileGroup>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-error-container py-3 text-title-md text-on-error-container active:scale-[0.98] transition-all"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </main>
    </div>
  )
}

function ProfileGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-title-md text-on-surface px-1">{title}</h3>
      <div className="rounded-xl border border-gray-200 bg-surface overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </section>
  )
}

function ProfileRow({
  icon, label, subtitle, last,
}: {
  icon: React.ReactNode
  label: string
  subtitle?: string
  last?: boolean
}) {
  return (
    <div className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${last ? '' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container">
          {icon}
        </div>
        <div>
          <p className="text-title-md text-on-surface">{label}</p>
          {subtitle && <p className="text-body-sm text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-on-surface-variant" />
    </div>
  )
}
