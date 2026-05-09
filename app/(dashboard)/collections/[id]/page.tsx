'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Award, Clock } from 'lucide-react'
import { VideoCard } from '@/components/video/VideoCard'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { PremiumGate } from '@/components/shared/PremiumGate'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import type { Collection, Video } from '@/types/database'
import Link from 'next/link'

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const [{ data: col }, { data: sub }] = await Promise.all([
        (supabase as any).from('collections').select('*').eq('id', id).single(),
        supabase.from('subscriptions').select('plan,status').eq('user_id', user.id).single(),
      ])

      if (!col) { router.push('/library'); return }
      setCollection(col as Collection)

      const subData = sub as { plan: string; status: string } | null
      const premium = subData?.plan === 'premium' && subData?.status === 'active'
      setIsPremium(premium)

      // Load ordered videos in this collection
      const { data: items } = await (supabase as any)
        .from('collection_items')
        .select('video_id, position')
        .eq('collection_id', id)
        .order('position')

      const videoIds = ((items ?? []) as { video_id: string; position: number }[]).map((i) => i.video_id)

      if (videoIds.length > 0) {
        const [{ data: vidData }, { data: progress }, { data: saved }] = await Promise.all([
          supabase.from('videos').select('*').in('id', videoIds),
          supabase.from('watch_progress').select('video_id, progress_seconds').eq('user_id', user.id),
          supabase.from('saved_videos').select('video_id').eq('user_id', user.id),
        ])

        const vidMap = Object.fromEntries(((vidData ?? []) as Video[]).map((v) => [v.id, v]))
        const orderedVids = videoIds.map((vid_id) => vidMap[vid_id]).filter(Boolean) as Video[]
        setVideos(orderedVids.filter((v) => !v.is_premium || premium))

        const pm: Record<string, number> = {}
        for (const p of (progress ?? [])) {
          const r = p as { video_id: string; progress_seconds: number }
          pm[r.video_id] = r.progress_seconds
        }
        setProgressMap(pm)
        setSavedIds(new Set(((saved ?? []) as { video_id: string }[]).map((s) => s.video_id)))
      }

      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) return <PageLoader />
  if (!collection) return null

  const isLocked = collection.is_premium && !isPremium

  const completedCount = videos.filter((v) => {
    const prog = progressMap[v.id] ?? 0
    return v.duration_seconds ? prog >= v.duration_seconds * 0.9 : false
  }).length
  const completionPct = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0

  return (
    <div className="space-y-8">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to library
      </Link>

      {/* Collection header */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{collection.title}</h1>
              {collection.certificate_eligible && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-light px-2.5 py-1 text-xs font-medium text-sage">
                  <Award className="h-3.5 w-3.5" aria-hidden="true" /> Certificate Eligible
                </span>
              )}
            </div>
            {collection.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{collection.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {collection.estimated_hours > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {collection.estimated_hours}h estimated
                </span>
              )}
              <span>{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <SubscriptionBadge isPremium={collection.is_premium} />
        </div>

        {/* Progress bar */}
        {videos.length > 0 && !isLocked && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Your progress</span>
              <span>{completedCount} / {videos.length} complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-border">
              <div
                className="h-full rounded-full bg-sage transition-all"
                style={{ width: `${completionPct}%` }}
                role="progressbar"
                aria-valuenow={completionPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${completionPct}% complete`}
              />
            </div>
          </div>
        )}
      </div>

      {isLocked ? (
        <PremiumGate
          title="Premium Collection"
          message="This collection is part of the Premium plan. Upgrade to access all videos and earn your certificate."
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Videos in this collection</h2>
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
