'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { AvatarBuilder } from '@/components/auth/AvatarBuilder'
import type { UserRole } from '@/types/database'
import type { AvatarId } from '@/lib/constants'
import Image from 'next/image'

const STEPS = ['Your role', 'Your name', 'Your avatar']

export default function ProfileSetupPage() {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<UserRole | null>(null)
  const [name, setName] = useState('')
  const [avatarId, setAvatarId] = useState<AvatarId>('avatar-1')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/sign-in')
    })
  }, [router])

  async function handleFinish() {
    if (!role || !name.trim()) return
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    const { error: saveError } = await (supabase.from('profiles') as any)
      .update({
        email: user.email,
        display_name: name.trim(),
        role,
        avatar_id: avatarId,
        font_size: 'normal',
      })
      .eq('id', user.id)

    if (saveError) {
      console.error('Profile save failed:', saveError)
      setError('Something went wrong saving your profile. Please try again.')
      setSaving(false)
      return
    }

    router.push('/home')
    router.refresh()
  }

  const canNext = step === 0 ? !!role : step === 1 ? name.trim().length >= 1 : true

  return (
    <div className="min-h-dvh bg-background py-12 px-4">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/img/logo.png" alt="Autism Edmonton" width={180} height={60} className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set up your profile</h1>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex gap-2" role="list" aria-label="Setup steps">
          {STEPS.map((s, i) => (
            <div
              key={s}
              role="listitem"
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-accent' : 'bg-border'
              }`}
              aria-label={`Step ${i + 1}: ${s}${i < step ? ' — complete' : i === step ? ' — current' : ''}`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card space-y-6">
          {step === 0 && (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Who are you?</h2>
                <p className="text-sm text-muted-foreground">
                  Choose the role that describes you best. This helps us show you the most useful content.
                </p>
              </div>
              <RoleSelector value={role} onChange={setRole} />
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">What should we call you?</h2>
                <p className="text-sm text-muted-foreground">
                  This is how your name will appear in the app.
                </p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="display-name" className="block text-sm font-medium text-foreground">
                  Display name
                </label>
                <input
                  id="display-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or nickname"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Pick your avatar</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a simple avatar to represent you. You can change this later.
                </p>
              </div>
              <AvatarBuilder value={avatarId} onChange={setAvatarId} />
            </>
          )}

          {error && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-lg border border-border bg-surface py-3 text-sm font-medium text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving || !canNext}
                className="flex-1 rounded-lg bg-sage py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Finish setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
