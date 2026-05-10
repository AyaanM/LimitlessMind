'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Gamepad2,
  BarChart3,
  CreditCard,
  User,
  Phone,
  MessageSquare,
  Building2,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface SidebarProps {
  profile: Profile | null
}

const navItems = [
  { href: '/home',             label: 'Home',             icon: Home },
  { href: '/library',          label: 'Library',           icon: BookOpen },
  { href: '/games',            label: 'Games',             icon: Gamepad2 },
  { href: '/community',        label: 'Community',         icon: MessageSquare },
  { href: '/resources',        label: 'Resources',         icon: Building2 },
  { href: '/learning-records', label: 'Learning Records',  icon: GraduationCap },
  { href: '/progress',         label: 'Progress',          icon: BarChart3 },
  { href: '/subscription',     label: 'Subscription',      icon: CreditCard },
  { href: '/profile',          label: 'Profile',           icon: User },
  { href: '/contact',          label: 'Contact',           icon: Phone },
]

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="hidden sm:flex flex-col w-56 shrink-0 border-r border-border bg-card"
      aria-label="Main navigation"
    >
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1" role="list">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    active
                      ? 'bg-accent-light text-accent'
                      : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}

        </ul>
      </nav>
    </aside>
  )
}
