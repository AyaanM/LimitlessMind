'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Subscription } from '@/types/database'

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
      setSubscription(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleUpgrade() {
    setUpgrading(true)
    // Stripe checkout would go here.
    // For now: toggle via API (dev mode)
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'premium' }),
    })
    if (res.ok) {
      const data = await res.json()
      setSubscription(data)
    }
    setUpgrading(false)
  }

  async function handleDowngrade() {
    setUpgrading(true)
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'free' }),
    })
    if (res.ok) {
      const data = await res.json()
      setSubscription(data)
    }
    setUpgrading(false)
  }

  if (loading) return <PageLoader />

  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active'

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Subscription</h1>
        <p className="text-muted-foreground">
          Choose the plan that works for you. Free features are always available.
        </p>
      </div>

      {/* Current status */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <p className="text-sm font-medium text-muted-foreground">Your current plan</p>
        <p className="mt-1 text-2xl font-bold text-foreground capitalize">
          {subscription?.plan ?? 'Free'}
        </p>
        {subscription?.plan === 'premium' && subscription.current_period_end && (
          <p className="mt-1 text-sm text-muted-foreground">
            Renews {new Date(subscription.current_period_end).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Plan comparison */}
      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
        {/* Free plan */}
        <div className={`rounded-2xl border p-8 shadow-card ${!isPremium ? 'border-sage bg-sage-light/30' : 'border-border bg-card'}`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-sage-light px-3 py-1 text-sm font-medium text-sage">Free</span>
            {!isPremium && <span className="text-xs font-medium text-sage">✓ Current plan</span>}
          </div>
          <p className="text-2xl font-bold text-foreground">Free forever</p>
          <ul className="mt-6 space-y-3">
            {SUBSCRIPTION_PLANS.free.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-bold text-sage" aria-hidden="true">✓</span> {f}
              </li>
            ))}
          </ul>
          {isPremium && (
            <button
              onClick={handleDowngrade}
              disabled={upgrading}
              className="mt-8 w-full rounded-lg border border-border bg-surface py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
            >
              {upgrading ? 'Updating…' : 'Switch to Free'}
            </button>
          )}
        </div>

        {/* Premium plan */}
        <div className={`rounded-2xl border-2 p-8 shadow-card-hover ${isPremium ? 'border-sage' : 'border-accent'} bg-card`}>
          <div className="mb-4 flex items-center justify-between">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${isPremium ? 'bg-sage text-white' : 'bg-accent text-white'}`}>Premium</span>
            {isPremium && <span className="text-xs font-medium text-sage">✓ Current plan</span>}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">$10 / month</p>
            <p className="text-sm text-muted-foreground">CAD, cancel anytime</p>
          </div>
          <ul className="mt-6 space-y-3">
            {SUBSCRIPTION_PLANS.premium.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-bold text-accent" aria-hidden="true">✓</span> {f}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="mt-8 w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
            >
              {upgrading ? 'Processing…' : 'Upgrade to Premium'}
            </button>
          )}
        </div>
      </div>

      {/* Dev note */}
      <div className="rounded-xl bg-premium-light border border-premium/20 p-5 text-sm text-muted-foreground max-w-2xl">
        <p className="font-semibold text-premium mb-1">Development mode</p>
        <p>
          Stripe payment integration is ready to be connected. Until then, the &quot;Upgrade&quot; button
          activates Premium directly in the database. Set{' '}
          <code className="rounded bg-card px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_MOCK_SUBSCRIPTION=true</code>{' '}
          to give all users premium access for testing.
        </p>
      </div>
    </div>
  )
}
