'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'
import { cn } from '@/lib/utils'

interface NavbarProps {
  profile: Profile | null
}

export function Navbar({ profile }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const avatarSrc = profile?.avatar_id
    ? `/avatars/${profile.avatar_id}.svg`
    : '/avatars/avatar-1.svg'

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            href="/home"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <img src="/img/logo.png" alt="Autism Edmonton" className="h-10 rounded-lg" />
          </Link>

          <div className="flex items-center gap-2">
            {profile && (
              <Link
                href="/profile"
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  pathname === '/profile'
                    ? 'bg-accent-light text-accent'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                )}
                aria-label="Go to your profile"
              >
                <img
                  src={avatarSrc}
                  alt=""
                  className="h-7 w-7 rounded-full border border-border"
                  aria-hidden="true"
                />
                <span className="hidden sm:block max-w-[120px] truncate">
                  {profile.display_name ?? 'My Profile'}
                </span>
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
