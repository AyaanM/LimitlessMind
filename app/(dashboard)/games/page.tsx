'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GameCard } from '@/components/games/GameCard'
import { GameModal } from '@/components/games/GameModal'
import { PremiumGate } from '@/components/shared/PremiumGate'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Game } from '@/types/database'

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [isPremium, setIsPremium] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const gameStartTime = useRef<number | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: sub }, { data: allGames }, { data: progress }] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase.from('games').select('*').order('is_premium'),
        supabase.from('game_progress').select('game_id').eq('user_id', user.id).eq('completed', true),
      ])

      const sub2 = sub as { plan: string; status: string } | null
      const premium = sub2?.plan === 'premium' && sub2?.status === 'active'
      setIsPremium(premium)
      setGames((allGames ?? []) as any[])
      const ids = (progress ?? []).map((p) => (p as any).game_id as string)
      setCompletedIds(new Set(ids))
      setLoading(false)
    }
    load()
  }, [])

  async function handleGameComplete(gameId: string, score: number) {
    if (!userId) return
    const playSecs = gameStartTime.current ? Math.round((Date.now() - gameStartTime.current) / 1000) : 0
    gameStartTime.current = null
    const supabase = createClient()
    await (supabase.from('game_progress') as any).upsert({
      user_id: userId,
      game_id: gameId,
      completed: true,
      score,
      play_seconds: playSecs,
      played_at: new Date().toISOString(),
    }, { onConflict: 'user_id,game_id' })
    setCompletedIds((prev) => new Set([...prev, gameId]))
    fetch('/api/gamification/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete_game' }),
    }).catch(() => {})
  }

  if (loading) return <PageLoader />

  const freeGames = games.filter((g) => !g.is_premium)
  const premiumGames = games.filter((g) => g.is_premium)

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Games</h1>
        <p className="text-muted-foreground">
          Practice everyday skills with simple, calm activities. Take your time.
        </p>
      </div>

      {/* Free games */}
      <section className="space-y-4" aria-label="Free games">
        <h2 className="text-lg font-semibold text-foreground">Free games</h2>
        {freeGames.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {freeGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isCompleted={completedIds.has(game.id)}
                isPremiumUser={isPremium}
                onPlay={(game) => { gameStartTime.current = Date.now(); setActiveGame(game) }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Free games coming soon.</p>
        )}
      </section>

      {/* Premium games */}
      <section className="space-y-4" aria-label="Premium games">
        <h2 className="text-lg font-semibold text-foreground">Premium games</h2>
        {!isPremium ? (
          <PremiumGate
            title="Premium Games"
            message="Premium games include job interview practice, daily routine building, and communication scenarios — all calm and accessible."
          />
        ) : premiumGames.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {premiumGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isCompleted={completedIds.has(game.id)}
                isPremiumUser={isPremium}
                onPlay={(game) => { gameStartTime.current = Date.now(); setActiveGame(game) }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Premium games coming soon.</p>
        )}
      </section>

      <GameModal
        game={activeGame}
        onClose={() => setActiveGame(null)}
        onComplete={handleGameComplete}
      />
    </div>
  )
}
