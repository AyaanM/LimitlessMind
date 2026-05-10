'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CategoryFilter } from '@/components/video/CategoryFilter'
import { VideoGrid } from '@/components/video/VideoGrid'
import { CollectionCard } from '@/components/shared/CollectionCard'
import { PlaylistCard } from '@/components/shared/PlaylistCard'
import { AISearchPanel } from '@/components/ai/AISearchPanel'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils'
import type { Video, VideoCategory, Collection, Playlist, Speaker } from '@/types/database'

type Filter = VideoCategory | 'all'
type PremiumFilter = 'all' | 'free' | 'premium'
type LibraryTab = 'videos' | 'collections' | 'playlists'

export default function LibraryPage() {
  const [tab, setTab] = useState<LibraryTab>('videos')
  const [videos, setVideos] = useState<Video[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [collectionVideoCounts, setCollectionVideoCounts] = useState<Record<string, number>>({})
  const [playlistVideoCounts, setPlaylistVideoCounts] = useState<Record<string, number>>({})
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  const [category, setCategory] = useState<Filter>('all')
  const [premiumFilter, setPremiumFilter] = useState<PremiumFilter>('all')
  const [search, setSearch] = useState('')
  const [speakerFilter, setSpeakerFilter] = useState<string | null>(null)
  const [certFilter, setCertFilter] = useState(false)
  const [showAISearch, setShowAISearch] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: vids },
        { data: sub },
        { data: saved },
        { data: progress },
        { data: cols },
        { data: plists },
        { data: spks },
      ] = await Promise.all([
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase.from('saved_videos').select('video_id').eq('user_id', user.id),
        supabase.from('watch_progress').select('video_id, progress_seconds').eq('user_id', user.id),
        (supabase as any).from('collections').select('*').order('title'),
        (supabase as any).from('playlists').select('*').order('title'),
        (supabase as any).from('speakers').select('id, name, organization').order('name'),
      ])

      const sub2 = sub as { plan: string; status: string } | null
      const premium = sub2?.plan === 'premium' && sub2?.status === 'active'
      setIsPremium(premium)
      setVideos((vids ?? []) as Video[])
      setCollections((cols ?? []) as Collection[])
      setPlaylists((plists ?? []) as Playlist[])
      setSpeakers((spks ?? []) as Speaker[])
      setSavedIds(new Set((saved ?? []).map((s) => (s as { video_id: string }).video_id)))
      const pm: Record<string, number> = {}
      for (const p of (progress ?? [])) {
        const row = p as { video_id: string; progress_seconds: number }
        pm[row.video_id] = row.progress_seconds
      }
      setProgressMap(pm)

      // Get video counts for collections and playlists
      const [{ data: ciRows }, { data: piRows }] = await Promise.all([
        (supabase as any).from('collection_items').select('collection_id'),
        (supabase as any).from('playlist_items').select('playlist_id'),
      ])
      const cc: Record<string, number> = {}
      for (const r of (ciRows ?? []) as { collection_id: string }[]) {
        cc[r.collection_id] = (cc[r.collection_id] ?? 0) + 1
      }
      setCollectionVideoCounts(cc)
      const pc: Record<string, number> = {}
      for (const r of (piRows ?? []) as { playlist_id: string }[]) {
        pc[r.playlist_id] = (pc[r.playlist_id] ?? 0) + 1
      }
      setPlaylistVideoCounts(pc)

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

  // Filter videos by speaker via the text speaker field (backward compat + structured speakers)
  const filteredVideos = videos.filter((v) => {
    if (category !== 'all' && v.category !== category) return false
    if (premiumFilter === 'free' && v.is_premium) return false
    if (premiumFilter === 'premium' && !v.is_premium) return false
    if (certFilter && !v.certificate_eligible) return false
    if (speakerFilter) {
      const spk = speakers.find((s) => s.id === speakerFilter)
      if (spk && !v.speaker?.toLowerCase().includes(spk.name.toLowerCase())) return false
    }
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

  const filteredCollections = collections.filter((c) => {
    if (certFilter && !c.certificate_eligible) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  const filteredPlaylists = playlists.filter((p) => {
    if (search) {
      const q = search.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Video Library</h1>
        <p className="text-muted-foreground">Browse videos, collections, and playlists across every topic.</p>
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
            placeholder="Search by title, topic, tag, or speaker…"
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

        {/* Library tabs */}
        <div className="flex gap-1 border-b border-border" role="tablist">
          {(['videos', 'collections', 'playlists'] as LibraryTab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
                tab === t
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'videos'
                ? `Videos (${filteredVideos.length})`
                : t === 'collections'
                ? `Collections (${filteredCollections.length})`
                : `Playlists (${filteredPlaylists.length})`
              }
            </button>
          ))}
        </div>

        {/* Videos-only filters */}
        {tab === 'videos' && (
          <>
            <CategoryFilter value={category} onChange={setCategory} />

            <div className="flex flex-wrap gap-3">
              {/* Free/Premium */}
              <div className="flex gap-2" role="group" aria-label="Filter by plan">
                {(['all', 'free', 'premium'] as PremiumFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setPremiumFilter(f)}
                    aria-pressed={premiumFilter === f}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent capitalize',
                      premiumFilter === f
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                    )}
                  >
                    {f === 'all' ? 'All plans' : f === 'free' ? 'Free only' : 'Premium only'}
                  </button>
                ))}
              </div>

              {/* Certificate eligible toggle */}
              <button
                onClick={() => setCertFilter((v) => !v)}
                aria-pressed={certFilter}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
                  certFilter
                    ? 'border-sage bg-sage text-white'
                    : 'border-border bg-card text-muted-foreground hover:text-sage'
                )}
              >
                🏅 Certificate eligible
              </button>
            </div>

            {/* Speaker filter */}
            {speakers.length > 0 && (
              <div>
                <label htmlFor="speaker-filter" className="sr-only">Filter by speaker</label>
                <select
                  id="speaker-filter"
                  value={speakerFilter ?? ''}
                  onChange={(e) => setSpeakerFilter(e.target.value || null)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">All speakers</option>
                  {speakers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Collections-only filters */}
        {tab === 'collections' && (
          <button
            onClick={() => setCertFilter((v) => !v)}
            aria-pressed={certFilter}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
              certFilter
                ? 'border-sage bg-sage text-white'
                : 'border-border bg-card text-muted-foreground hover:text-sage'
            )}
          >
            🏅 Certificate eligible only
          </button>
        )}
      </div>

      {/* Content panel */}
      {tab === 'videos' && (
        <VideoGrid
          videos={filteredVideos}
          progressMap={progressMap}
          savedIds={savedIds}
          isPremiumUser={isPremium}
          onSaveToggle={handleSaveToggle}
        />
      )}

      {tab === 'collections' && (
        filteredCollections.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            No collections found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCollections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                isPremiumUser={isPremium}
              />
            ))}
          </div>
        )
      )}

      {tab === 'playlists' && (
        filteredPlaylists.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            No playlists found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaylists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                videoCount={playlistVideoCounts[pl.id]}
                isPremiumUser={isPremium}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}
