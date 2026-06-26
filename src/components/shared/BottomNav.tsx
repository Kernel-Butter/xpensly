'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ReceiptText, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/',         label: 'Home',     Icon: Home        },
  { href: '/expenses', label: 'Expenses', Icon: ReceiptText },
  { href: '/reports',  label: 'Reports',  Icon: BarChart2   },
  { href: '/settings', label: 'Settings', Icon: Settings    },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-surface px-2 safe-bottom">
      {navItems.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex h-full flex-1 flex-col items-center justify-center gap-1',
              'transition-transform duration-150 active:scale-95',
              active ? 'text-primary' : 'text-on-surface-variant hover:text-primary',
            )}
          >
            {active && (
              <span className="absolute top-0 h-0.5 w-12 rounded-full bg-primary" />
            )}
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            <span className="text-label-xs">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
