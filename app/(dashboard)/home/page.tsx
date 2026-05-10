import { createClient } from '@/lib/supabase/server'
import { getProfile, getSubscription, getVideos, getWatchProgress, getSavedVideos, isPremiumActive } from '@/lib/supabase/queries'
import { VideoRow } from '@/components/video/VideoRow'
import { LearningPathHero } from '@/components/home/LearningPathHero'
import { GamificationCard } from '@/components/home/GamificationCard'
import { redirect } from 'next/navigation'
import type { Video } from '@/types/database'

const ROLE_LABELS: Record<string, string> = {
  autistic_adult: 'autistic adult',
  caregiver:      'caregiver',
  professional:   'professional',
  educator:       'educator',
  employer:       'employer',
}

const ROLE_CATEGORIES: Record<string, string[]> = {
  autistic_adult: ['Mental Health', 'Identity', 'Relationships', 'Housing', 'Employment'],
  caregiver:      ['Mental Health', 'Housing', 'Relationships', 'Identity', 'Employment'],
  professional:   ['Mental Health', 'Identity', 'Employment', 'Relationships', 'Housing'],
  educator:       ['Identity', 'Relationships', 'Mental Health', 'Employment', 'Housing'],
  employer:       ['Employment', 'Identity', 'Relationships', 'Mental Health', 'Housing'],
}

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

  // Update streak server-side (safe since this is a server component with the user's session)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const p = profile as typeof profile & {
    xp?: number; level?: number; streak_days?: number
    last_active_date?: string | null; badges?: string[]
  }
  if (p && p.last_active_date !== today) {
    const newStreak = p.last_active_date === yesterday ? (p.streak_days ?? 0) + 1 : 1
    const streakXP = 5 + (newStreak === 7 ? 50 : 0) + (newStreak === 30 ? 200 : 0)
    const newXP = (p.xp ?? 0) + streakXP
    await (supabase.from('profiles') as any).update({
      streak_days: newStreak,
      last_active_date: today,
      xp: newXP,
      level: newXP >= 15000 ? 10 : newXP >= 10000 ? 9 : newXP >= 6000 ? 8 : newXP >= 3500 ? 7
           : newXP >= 2000 ? 6 : newXP >= 1000 ? 5 : newXP >= 500 ? 4 : newXP >= 250 ? 3 : newXP >= 100 ? 2 : 1,
    }).eq('id', user.id)
    // Refresh profile to reflect updates
    ;(p as any).streak_days = newStreak
    ;(p as any).xp = newXP
    ;(p as any).last_active_date = today
  }

  type WatchRow = { video_id: string; progress_seconds: number; completed: boolean; last_watched_at: string }
  const isPremium = isPremiumActive(subscription)
  const allVids: Video[] = allVideos as Video[]
  // Show all videos but pass isPremiumUser so VideoCard handles the lock
  const watchRows: WatchRow[] = watchProgressRows as WatchRow[]

  const progressMap: Record<string, number> = {}
  for (const p of watchRows) progressMap[p.video_id] = p.progress_seconds

  const savedIds = new Set<string>((savedRows as { video_id: string }[]).map((s) => s.video_id))
  const watchedIds = new Set<string>(watchRows.map((p) => p.video_id))

  // ── Learning path: figure out what to recommend next ────────────────────────
  const role = profile?.role ?? 'autistic_adult'
  const roleLabel = ROLE_LABELS[role] ?? 'learner'
  const roleOrder = ROLE_CATEGORIES[role] ?? ROLE_CATEGORIES.autistic_adult

  // Tally how many videos the user has watched per category
  const categoryWatched: Record<string, number> = {}
  for (const w of watchRows) {
    const vid = allVids.find((v) => v.id === w.video_id)
    if (vid) categoryWatched[vid.category] = (categoryWatched[vid.category] ?? 0) + 1
  }

  // The "active" category is the one they're currently engaged with that still has unwatched videos
  const topEngaged = Object.entries(categoryWatched).sort((a, b) => b[1] - a[1])[0]?.[0]

  // Next in path: first unwatched video in the most-engaged category, falling back to role order
  const searchOrder = topEngaged
    ? [topEngaged, ...roleOrder.filter((c) => c !== topEngaged)]
    : roleOrder

  let nextVideo: Video | null = null
  let pathReason = ''

  for (const cat of searchOrder) {
    const candidate = allVids.find((v) => v.category === cat && !watchedIds.has(v.id))
    if (candidate) {
      nextVideo = candidate
      pathReason = topEngaged && cat === topEngaged
        ? `You've been exploring ${cat} — here's what to watch next.`
        : `Recommended for ${roleLabel}s to explore next in ${cat}.`
      break
    }
  }

  // If everything is watched, pick the most popular unwatched (or fallback to any)
  if (!nextVideo) {
    nextVideo = [...allVids].sort((a, b) => b.popularity_score - a.popularity_score)
      .find((v) => !watchedIds.has(v.id)) ?? allVids[0] ?? null
    if (nextVideo) pathReason = 'You\'ve made great progress — here\'s something new to explore.'
  }

  // ── Rows ────────────────────────────────────────────────────────────────────
  const continueWatching = allVids.filter((v) => {
    const prog = watchRows.find((p) => p.video_id === v.id)
    return prog && prog.progress_seconds > 0 && !prog.completed
  })

  // Category-based rows (Netflix-style "Because you watched X")
  const categoryRows: { title: string; subtitle: string; videos: Video[] }[] = []
  for (const cat of searchOrder.slice(0, 3)) {
    const vids = allVids.filter((v) => v.category === cat && v.id !== nextVideo?.id).slice(0, 10)
    if (vids.length > 0) {
      const watched = categoryWatched[cat] ?? 0
      categoryRows.push({
        title: cat,
        subtitle: watched > 0 ? `Because you've been watching ${cat}` : `Explore ${cat}`,
        videos: vids,
      })
    }
  }

  const newVideos      = allVids.filter((v) => v.is_new_this_month).slice(0, 10)
  const aePicksVideos  = allVids.filter((v) => v.is_autism_edmonton_pick).slice(0, 10)
  const popular        = [...allVids].sort((a, b) => b.popularity_score - a.popularity_score).slice(0, 10)
  const recentlyWatched = [...watchRows]
    .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())
    .slice(0, 10)
    .map((p) => allVids.find((v) => v.id === p.video_id))
    .filter((v): v is Video => !!v)

  const name = profile?.display_name ?? 'there'
  const rowProps = { progressMap, savedIds, isPremiumUser: isPremium }

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Hello, {name} 👋</h1>
        <p className="text-muted-foreground">Welcome back. What would you like to explore today?</p>
      </div>

      {/* Gamification card */}
      <GamificationCard
        xp={(p as any)?.xp ?? 0}
        level={(p as any)?.level ?? 1}
        streakDays={(p as any)?.streak_days ?? 0}
        badges={(p as any)?.badges ?? []}
        displayName={name}
      />

      {/* Netflix-style hero — next in learning path */}
      {nextVideo && (
        <LearningPathHero
          video={nextVideo}
          reason={pathReason}
          isPremiumUser={isPremium}
          progressSeconds={progressMap[nextVideo.id]}
        />
      )}

      {continueWatching.length > 0 && (
        <VideoRow title="Continue Watching" videos={continueWatching} {...rowProps} />
      )}

      {/* Category rows with "because you watched" reasoning */}
      {categoryRows.map(({ title, subtitle, videos }) => (
        <VideoRow key={title} title={title} subtitle={subtitle} videos={videos} {...rowProps} />
      ))}

      {recentlyWatched.length > 0 && (
        <VideoRow title="Recently Watched" videos={recentlyWatched} {...rowProps} />
      )}
      {newVideos.length > 0 && (
        <VideoRow title="New This Month" videos={newVideos} {...rowProps} />
      )}
      {aePicksVideos.length > 0 && (
        <VideoRow title="Autism Edmonton Picks" videos={aePicksVideos} {...rowProps} />
      )}
      {popular.length > 0 && (
        <VideoRow title="Most Popular" videos={popular} {...rowProps} />
      )}

      {allVids.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-3">
          <div className="text-4xl" aria-hidden="true">🎬</div>
          <p className="font-semibold text-foreground">Videos coming soon</p>
          <p className="text-sm text-muted-foreground">Autism Edmonton staff will add videos soon.</p>
        </div>
      )}
    </div>
  )
}
