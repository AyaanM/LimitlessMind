'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ListVideo } from 'lucide-react'
import { VideoCard } from '@/components/video/VideoCard'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { PremiumGate } from '@/components/shared/PremiumGate'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import type { Playlist, Video } from '@/types/database'
import Link from 'next/link'

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const [{ data: pl }, { data: sub }] = await Promise.all([
        (supabase as any).from('playlists').select('*').eq('id', id).single(),
        supabase.from('subscriptions').select('plan,status').eq('user_id', user.id).single(),
      ])

      if (!pl) { router.push('/library'); return }
      setPlaylist(pl as Playlist)

      const subData = sub as { plan: string; status: string } | null
      const premium = subData?.plan === 'premium' && subData?.status === 'active'
      setIsPremium(premium)

      const { data: items } = await (supabase as any)
        .from('playlist_items')
        .select('video_id, position')
        .eq('playlist_id', id)
        .order('position')

      const videoIds = ((items ?? []) as { video_id: string }[]).map((i) => i.video_id)

      if (videoIds.length > 0) {
        const [{ data: vidData }, { data: progress }] = await Promise.all([
          supabase.from('videos').select('*').in('id', videoIds),
          supabase.from('watch_progress').select('video_id, progress_seconds').eq('user_id', user.id),
        ])

        const vidMap = Object.fromEntries(((vidData ?? []) as Video[]).map((v) => [v.id, v]))
        const ordered = videoIds.map((vid_id) => vidMap[vid_id]).filter(Boolean) as Video[]
        setVideos(ordered.filter((v) => !v.is_premium || premium))

        const pm: Record<string, number> = {}
        for (const p of (progress ?? [])) {
          const r = p as { video_id: string; progress_seconds: number }
          pm[r.video_id] = r.progress_seconds
        }
        setProgressMap(pm)
      }

      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) return <PageLoader />
  if (!playlist) return null

  const isLocked = playlist.is_premium && !isPremium

  return (
    <div className="space-y-8">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to library
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <ListVideo className="h-5 w-5 text-accent" aria-hidden="true" />
              <h1 className="text-xl font-bold text-foreground">{playlist.title}</h1>
            </div>
            {playlist.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{playlist.description}</p>
            )}
            <p className="text-sm text-muted-foreground">{videos.length} video{videos.length !== 1 ? 's' : ''}</p>
          </div>
          <SubscriptionBadge isPremium={playlist.is_premium} />
        </div>
      </div>

      {isLocked ? (
        <PremiumGate
          title="Premium Playlist"
          message="This playlist is part of the Premium plan. Upgrade to access all videos."
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Videos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                progressSeconds={progressMap[v.id]}
                isPremiumUser={isPremium}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
