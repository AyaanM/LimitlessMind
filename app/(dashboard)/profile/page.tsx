'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { AvatarBuilder } from '@/components/auth/AvatarBuilder'
import { AccessibilityPanel } from '@/components/layout/AccessibilityPanel'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { ROLE_LABELS } from '@/lib/constants'
import type { Profile } from '@/types/database'
import type { UserRole } from '@/types/database'
import type { AvatarId } from '@/lib/constants'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('autistic_adult')
  const [avatarId, setAvatarId] = useState<AvatarId>('avatar-1')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const profileData = data as Profile | null
      if (profileData) {
        setProfile(profileData)
        setName(profileData.display_name ?? '')
        setRole(profileData.role)
        setAvatarId((profileData.avatar_id as AvatarId) ?? 'avatar-1')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSaved(false)

    const supabase = createClient()
    await (supabase.from('profiles') as any).update({
      display_name: name.trim(),
      role,
      avatar_id: avatarId,
    }).eq('id', profile.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-10 max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
        <p className="text-muted-foreground">Update your name, role, and avatar.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar preview */}
        <div className="flex items-center gap-5">
          <img
            src={`/avatars/${avatarId}.svg`}
            alt="Your current avatar"
            className="h-20 w-20 rounded-full border-2 border-border"
          />
          <div>
            <p className="font-semibold text-foreground">{name || 'Your name'}</p>
            <p className="text-sm text-muted-foreground">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        {/* Display name */}
        <div className="space-y-1.5">
          <label htmlFor="display-name" className="block text-sm font-medium text-foreground">
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Your name or nickname"
          />
        </div>

        {/* Avatar */}
        <div>
          <AvatarBuilder value={avatarId} onChange={setAvatarId} />
        </div>

        {/* Role */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Your role</p>
          <RoleSelector value={role} onChange={setRole} />
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save changes'}
        </button>
      </form>

      {/* Accessibility settings */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Accessibility settings</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Font size, theme, zoom, and more</p>
        </div>
        <AccessibilityPanel />
      </div>

      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Account</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Subscription</p>
            <Link href="/subscription" className="text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              Manage subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
