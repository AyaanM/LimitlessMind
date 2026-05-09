'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CategoryFilter } from '@/components/video/CategoryFilter'
import { VideoGrid } from '@/components/video/VideoGrid'
import { AISearchPanel } from '@/components/ai/AISearchPanel'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import type { Video, VideoCategory } from '@/types/database'

type Filter = VideoCategory | 'all'
type PremiumFilter = 'all' | 'free' | 'premium'

export default function LibraryPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  const [category, setCategory] = useState<Filter>('all')
  const [premiumFilter, setPremiumFilter] = useState<PremiumFilter>('all')
  const [search, setSearch] = useState('')
  const [showAISearch, setShowAISearch] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: vids }, { data: sub }, { data: saved }, { data: progress }] = await Promise.all([
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase.from('saved_videos').select('video_id').eq('user_id', user.id),
        supabase.from('watch_progress').select('video_id, progress_seconds').eq('user_id', user.id),
      ])

      const sub2 = sub as { plan: string; status: string } | null
      const premium = sub2?.plan === 'premium' && sub2?.status === 'active'
      setIsPremium(premium)
      setVideos(((vids ?? []) as Video[]).filter((v) => !v.is_premium || premium))
      setSavedIds(new Set((saved ?? []).map((s) => (s as { video_id: string }).video_id)))
      const pm: Record<string, number> = {}
      for (const p of (progress ?? [])) {
        const row = p as { video_id: string; progress_seconds: number }
        pm[row.video_id] = row.progress_seconds
      }
      setProgressMap(pm)
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveToggle = useCallback(async (videoId: string, save: boolean) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (save) {
      await (supabase.from('saved_videos') as any).upsert({ user_id: user.id, video_id: videoId })
      setSavedIds((prev) => { const s = new Set(Array.from(prev)); s.add(videoId); return s })
    } else {
      await supabase.from('saved_videos').delete().eq('user_id', user.id).eq('video_id', videoId)
      setSavedIds((prev) => { const s = new Set(Array.from(prev)); s.delete(videoId); return s })
    }
  }, [])

  const filtered = videos.filter((v) => {
    if (category !== 'all' && v.category !== category) return false
    if (premiumFilter === 'free' && v.is_premium) return false
    if (premiumFilter === 'premium' && !v.is_premium) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        v.title.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.speaker?.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Video Library</h1>
        <p className="text-muted-foreground">Browse all videos across every topic.</p>
      </div>

      <div className="space-y-4">
        {/* Search row */}
        <div className="flex gap-2">
          <label htmlFor="lib-search" className="sr-only">Search videos</label>
          <input
            id="lib-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, topic, or speaker…"
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {isPremium && (
            <button
              onClick={() => setShowAISearch((v) => !v)}
              className="rounded-lg border border-accent/30 bg-accent-light px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              ✨ AI Search
            </button>
          )}
        </div>

        {/* AI Search panel (premium) */}
        {isPremium && showAISearch && (
          <AISearchPanel
            isPremiumUser={isPremium}
            savedIds={savedIds}
            onSaveToggle={handleSaveToggle}
          />
        )}

        {/* Category filter */}
        <CategoryFilter value={category} onChange={setCategory} />

        {/* Free / Premium filter */}
        <div className="flex gap-2" role="group" aria-label="Filter by plan">
          {(['all', 'free', 'premium'] as PremiumFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPremiumFilter(f)}
              aria-pressed={premiumFilter === f}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent capitalize ${
                premiumFilter === f
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
              }`}
            >
              {f === 'all' ? 'All plans' : f === 'free' ? 'Free only' : 'Premium only'}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} video{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <VideoGrid
        videos={filtered}
        progressMap={progressMap}
        savedIds={savedIds}
        isPremiumUser={isPremium}
        onSaveToggle={handleSaveToggle}
      />
    </div>
  )
}
