'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses',  icon: List            },
  { href: '/reports',  label: 'Reports',   icon: BarChart2       },
  { href: '/settings', label: 'Settings',  icon: Settings        },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white safe-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2"
            >
              <div className="relative flex flex-col items-center">
                {active && (
                  <span className="absolute -top-2 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary-light" />
                )}
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={cn(active ? 'text-primary-light' : 'text-gray-400')}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active ? 'text-primary-light' : 'text-gray-400',
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
