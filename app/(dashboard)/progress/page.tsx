import { createClient } from '@/lib/supabase/server'
import { getProfile, getSubscription, getVideos, getWatchProgress, getSavedVideos, getGames, getGameProgress, isPremiumActive } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { ProgressCard } from '@/components/shared/ProgressCard'
import { VideoCard } from '@/components/video/VideoCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Video } from '@/types/database'
import Link from 'next/link'

export default async function ProgressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [subscription, allVideos, watchRows, savedRows, gameProgressRows] = await Promise.all([
    getSubscription(supabase, user.id),
    getVideos(supabase),
    getWatchProgress(supabase, user.id),
    getSavedVideos(supabase, user.id),
    getGameProgress(supabase, user.id),
  ])

  type WatchRow = { video_id: string; progress_seconds: number; completed: boolean; last_watched_at: string }
  type GameRow = { completed: boolean }
  const isPremium = isPremiumActive(subscription)
  const videos: Video[] = (allVideos as Video[]).filter((v) => !v.is_premium || isPremium)
  const watchRows2 = watchRows as WatchRow[]
  const gameRows = gameProgressRows as GameRow[]

  const completedVideos = watchRows2.filter((w) => w.completed)
  const inProgressVideos = watchRows2.filter((w) => !w.completed && w.progress_seconds > 0)
  const completedGames = gameRows.filter((g) => g.completed)

  const recentlyWatched = [...watchRows2]
    .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())
    .slice(0, 4)
    .map((w) => videos.find((v) => v.id === w.video_id))
    .filter((v): v is Video => !!v)

  const categoryCount: Record<string, number> = {}
  for (const w of watchRows2) {
    const vid = videos.find((v) => v.id === w.video_id)
    if (vid) categoryCount[vid.category] = (categoryCount[vid.category] ?? 0) + 1
  }
  const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0]

  const progressMap: Record<string, number> = {}
  for (const w of watchRows2) progressMap[w.video_id] = w.progress_seconds

  const watchedIds = new Set<string>(watchRows2.map((w) => w.video_id))
  const recommended = videos
    .filter((v) => !watchedIds.has(v.id) && v.category === favoriteCategory)
    .slice(0, 4)

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Your Progress</h1>
        <p className="text-muted-foreground">See how far you&apos;ve come and what to explore next.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressCard label="Videos completed" value={completedVideos.length} icon="✅" color="green" />
        <ProgressCard label="Videos in progress" value={inProgressVideos.length} icon="▶️" color="blue" />
        <ProgressCard label="Videos saved" value={savedRows.length} icon="🔖" color="blue" />
        <ProgressCard label="Games completed" value={completedGames.length} icon="🎮" color="green" />
      </div>

      <div className={`rounded-xl border p-5 ${isPremium ? 'border-sage/30 bg-sage-light/30' : 'border-border bg-surface'}`}>
        <p className="text-sm text-muted-foreground">Current plan</p>
        <p className="mt-1 text-lg font-semibold text-foreground capitalize">
          {(subscription as { plan?: string } | null)?.plan ?? 'Free'} plan
          {isPremium && <span className="ml-2 text-sage" aria-hidden="true">✓ Active</span>}
        </p>
        {!isPremium && (
          <Link href="/subscription" className="mt-2 inline-block text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            Upgrade to Premium →
          </Link>
        )}
      </div>

      {recentlyWatched.length > 0 && (
        <section className="space-y-4" aria-label="Recently watched">
          <h2 className="text-lg font-semibold text-foreground">Recently watched</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyWatched.map((v) => (
              <VideoCard key={v.id} video={v} progressSeconds={progressMap[v.id]} isPremiumUser={isPremium} />
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="space-y-4" aria-label="Recommended next">
          <h2 className="text-lg font-semibold text-foreground">Recommended for you next</h2>
          {favoriteCategory && (
            <p className="text-sm text-muted-foreground">Based on your interest in <strong>{favoriteCategory}</strong></p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((v) => (
              <VideoCard key={v.id} video={v} isPremiumUser={isPremium} />
            ))}
          </div>
        </section>
      )}

      {recentlyWatched.length === 0 && recommended.length === 0 && (
        <EmptyState
          icon="📺"
          title="No videos watched yet"
          description="Start watching videos and your progress will appear here."
          action={
            <Link href="/library" className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              Browse the library
            </Link>
          }
        />
      )}
    </div>
  )
}
