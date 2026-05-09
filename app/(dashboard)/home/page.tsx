import { createClient } from '@/lib/supabase/server'
import { getProfile, getSubscription, getVideos, getWatchProgress, getSavedVideos, isPremiumActive } from '@/lib/supabase/queries'
import { VideoRow } from '@/components/video/VideoRow'
import { redirect } from 'next/navigation'
import type { Video } from '@/types/database'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [profile, subscription, allVideos, watchProgressRows, savedRows] = await Promise.all([
    getProfile(supabase, user.id),
    getSubscription(supabase, user.id),
    getVideos(supabase),
    getWatchProgress(supabase, user.id),
    getSavedVideos(supabase, user.id),
  ])

  type WatchRow = { video_id: string; progress_seconds: number; completed: boolean; last_watched_at: string }
  const isPremium = isPremiumActive(subscription)
  const videos: Video[] = (allVideos as Video[]).filter((v) => !v.is_premium || isPremium)
  const watchRows: WatchRow[] = watchProgressRows as WatchRow[]

  const progressMap: Record<string, number> = {}
  for (const p of watchRows) progressMap[p.video_id] = p.progress_seconds

  const savedIds = new Set<string>((savedRows as { video_id: string }[]).map((s) => s.video_id))

  const continueWatching = videos.filter((v) => {
    const prog = watchRows.find((p) => p.video_id === v.id)
    return prog && prog.progress_seconds > 0 && !prog.completed
  })

  const newVideos = videos.filter((v) => v.is_new_this_month).slice(0, 8)
  const featured = videos.filter((v) => v.is_featured).slice(0, 8)
  const aePicksVideos = videos.filter((v) => v.is_autism_edmonton_pick).slice(0, 8)
  const popular = [...videos].sort((a, b) => b.popularity_score - a.popularity_score).slice(0, 8)
  const freeVideos = videos.filter((v) => !v.is_premium).slice(0, 8)

  const roleCategories: Record<string, string[]> = {
    autistic_adult: ['Mental Health', 'Identity', 'Relationships'],
    caregiver:      ['Mental Health', 'Housing', 'Relationships'],
    professional:   ['Mental Health', 'Identity', 'Employment'],
    educator:       ['Identity', 'Relationships', 'Mental Health'],
    employer:       ['Employment', 'Identity', 'Relationships'],
    employee:       ['Employment', 'Housing', 'Mental Health'],
  }
  const preferred = roleCategories[profile?.role ?? 'autistic_adult'] ?? []
  const recommended = videos.filter((v) => preferred.includes(v.category)).slice(0, 8)

  const recentlyWatched = [...watchRows]
    .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())
    .slice(0, 8)
    .map((p) => videos.find((v) => v.id === p.video_id))
    .filter((v): v is Video => !!v)

  const name = profile?.display_name ?? 'there'
  const rowProps = { progressMap, savedIds, isPremiumUser: isPremium }

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Hello, {name} 👋</h1>
        <p className="text-muted-foreground">Welcome back. What would you like to explore today?</p>
      </div>

      {continueWatching.length > 0 && (
        <VideoRow title="Continue Watching" videos={continueWatching} {...rowProps} />
      )}
      {recommended.length > 0 && (
        <VideoRow title="Recommended for You" videos={recommended} {...rowProps} />
      )}
      {recentlyWatched.length > 0 && (
        <VideoRow title="Recently Watched" videos={recentlyWatched} {...rowProps} />
      )}
      {newVideos.length > 0 && (
        <VideoRow title="New This Month" videos={newVideos} {...rowProps} />
      )}
      {featured.length > 0 && (
        <VideoRow title="Featured" videos={featured} {...rowProps} />
      )}
      {aePicksVideos.length > 0 && (
        <VideoRow title="Autism Edmonton Picks" videos={aePicksVideos} {...rowProps} />
      )}
      {popular.length > 0 && (
        <VideoRow title="Most Popular" videos={popular} {...rowProps} />
      )}
      {freeVideos.length > 0 && (
        <VideoRow title="Free for Everyone" videos={freeVideos} {...rowProps} />
      )}

      {videos.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-3">
          <div className="text-4xl" aria-hidden="true">🎬</div>
          <p className="font-semibold text-foreground">Videos coming soon</p>
          <p className="text-sm text-muted-foreground">
            Autism Edmonton staff will add videos through the employee dashboard.
          </p>
        </div>
      )}
    </div>
  )
}
