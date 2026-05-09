'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Subscription } from '@/types/database'

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const mockEnabled = process.env.NEXT_PUBLIC_MOCK_SUBSCRIPTION === 'true'

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    if (mockEnabled) {
      setSubscription({
        id: 'mock',
        user_id: userId,
        plan: 'premium',
        status: 'active',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        price_cents: 1000,
        currency: 'CAD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        setSubscription(data)
        setLoading(false)
      })
  }, [userId, mockEnabled])

  const isPremium =
    mockEnabled ||
    (subscription?.plan === 'premium' && subscription?.status === 'active')

  return { subscription, isPremium, loading }
}
