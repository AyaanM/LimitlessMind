'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck, CheckCircle, ChevronLeft, Clock, Phone, Award, ExternalLink, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VideoCard } from '@/components/video/VideoCard'
import { AIChatBox } from '@/components/ai/AIChatBox'
import { PremiumGate } from '@/components/shared/PremiumGate'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import { SpeakerCard } from '@/components/shared/SpeakerCard'
import { DiscussionSection } from '@/components/shared/DiscussionSection'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import { getYouTubeThumbnail, getYouTubeUrl, formatDuration, cn } from '@/lib/utils'
import type { Video, VideoActivity, Speaker } from '@/types/database'
import Link from 'next/link'

export default function VideoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [related, setRelated] = useState<Video[]>([])
  const [activities, setActivities] = useState<VideoActivity[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userDisplayName, setUserDisplayName] = useState<string>('Community member')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }
      setUserId(user.id)

      const [
        { data: vid },
        { data: sub },
        { data: savedRow },
        { data: progress },
        { data: acts },
        { data: profile },
        { data: vsRows },
      ] = await Promise.all([
        supabase.from('videos').select('*').eq('id', id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase.from('saved_videos').select('id').eq('user_id', user.id).eq('video_id', id).maybeSingle(),
        supabase.from('watch_progress').select('*').eq('user_id', user.id).eq('video_id', id).maybeSingle(),
        supabase.from('video_activities').select('*').eq('video_id', id),
        supabase.from('profiles').select('display_name').eq('id', user.id).single(),
        (supabase as any).from('video_speakers').select('speaker_id').eq('video_id', id),
      ])

      const vidData = vid as Video | null
      if (!vidData) { router.push('/library'); return }

      const subData = sub as { plan: string; status: string } | null
      const progressData = progress as { completed: boolean } | null
      const premium = subData?.plan === 'premium' && subData?.status === 'active'
      setIsPremium(premium)
      setVideo(vidData)
      setIsSaved(!!savedRow)
      setIsCompleted(progressData?.completed ?? false)
      setActivities((acts ?? []) as VideoActivity[])
      setUserDisplayName((profile as any)?.display_name ?? 'Community member')

      const speakerIds = ((vsRows ?? []) as { speaker_id: string }[]).map((r) => r.speaker_id)
      if (speakerIds.length > 0) {
        const { data: spData } = await (supabase as any).from('speakers').select('*').in('id', speakerIds)
        setSpeakers((spData ?? []) as Speaker[])
      }

      let relatedVids: Video[] = []
      if (vidData.topic_id) {
        const { data: topicRelated } = await supabase.from('videos').select('*').eq('topic_id', vidData.topic_id).neq('id', id).limit(4)
        relatedVids = (topicRelated ?? []) as Video[]
      }
      if (relatedVids.length < 4) {
        const { data: catRelated } = await supabase.from('videos').select('*').eq('category', vidData.category).neq('id', id).limit(4 - relatedVids.length)
        const existing = new Set(relatedVids.map((v) => v.id))
        relatedVids = [...relatedVids, ...((catRelated ?? []) as Video[]).filter((v) => !existing.has(v.id))]
      }
      setRelated(relatedVids.filter((v) => !v.is_premium || premium))
      setLoading(false)
    }
    load()
  }, [id, router])

  const handleSaveToggle = useCallback(async () => {
    if (!userId || !video) return
    const supabase = createClient()
    if (isSaved) {
      await supabase.from('saved_videos').delete().eq('user_id', userId).eq('video_id', video.id)
      setIsSaved(false)
    } else {
      await (supabase.from('saved_videos') as any).upsert({ user_id: userId, video_id: video.id })
      setIsSaved(true)
    }
  }, [isSaved, userId, video])

  const handleMarkComplete = useCallback(async () => {
    if (!userId || !video || isCompleted) return
    const supabase = createClient()
    await (supabase.from('watch_progress') as any).upsert({
      user_id: userId,
      video_id: video.id,
      progress_seconds: video.duration_seconds ?? 0,
      completed: true,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: 'user_id,video_id' })
    setIsCompleted(true)
  }, [userId, video, isCompleted])

  if (loading) return <PageLoader />
  if (!video) return null

  const isLocked = video.is_premium && !isPremium
  const catColor = CATEGORY_COLORS[video.category] ?? 'bg-surface text-muted-foreground'
  const catIcon = CATEGORY_ICONS[video.category] ?? '📹'
  const thumbnail = video.thumbnail_url ?? getYouTubeThumbnail(video.youtube_id)
  const youtubeUrl = getYouTubeUrl(video.youtube_id)

  return (
    <div className="space-y-8">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to library
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Thumbnail / watch hero */}
          <div className="relative overflow-hidden rounded-xl bg-foreground/5">
            <div className="aspect-video">
              <img
                src={thumbnail}
                alt={video.title}
                className="h-full w-full object-cover"
              />
            </div>
            {isLocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-foreground/60 backdrop-blur-[2px]">
                <p className="text-base font-semibold text-white">Premium video</p>
                <Link
                  href="/subscription"
                  className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
                >
                  Upgrade to watch
                </Link>
              </div>
            ) : (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-foreground/30 opacity-0 hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none"
                aria-label={`Watch "${video.title}" on YouTube`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl">
                  <Play className="h-7 w-7 translate-x-0.5 text-foreground" aria-hidden="true" />
                </div>
              </a>
            )}
          </div>

          {/* Meta */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-foreground leading-tight">{video.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                {video.certificate_eligible && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage-light px-2.5 py-1 text-xs font-medium text-sage">
                    <Award className="h-3.5 w-3.5" aria-hidden="true" /> Certificate
                  </span>
                )}
                <SubscriptionBadge isPremium={video.is_premium} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium', catColor)}>
                <span aria-hidden="true">{catIcon}</span> {video.category}
              </span>
              {video.speaker && speakers.length === 0 && (
                <span className="text-sm text-muted-foreground">by {video.speaker}</span>
              )}
              {video.duration_seconds && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {formatDuration(video.duration_seconds)}
                </span>
              )}
            </div>

            {video.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{video.description}</p>
            )}

            {video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {video.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {!isLocked && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" /> Watch on YouTube
                </a>
              )}

              <button
                onClick={handleSaveToggle}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={isSaved ? 'Remove from saved' : 'Save this video'}
              >
                {isSaved
                  ? <><BookmarkCheck className="h-4 w-4 text-accent" aria-hidden="true" /> Saved</>
                  : <><Bookmark className="h-4 w-4" aria-hidden="true" /> Save</>
                }
              </button>

              <button
                onClick={handleMarkComplete}
                disabled={isCompleted}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
                  isCompleted
                    ? 'bg-sage-light text-sage cursor-default'
                    : 'border border-border bg-card text-foreground hover:bg-surface'
                )}
              >
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                {isCompleted ? 'Completed' : 'Mark as complete'}
              </button>

              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> Contact Autism Edmonton
              </Link>
            </div>
          </div>

          {/* Speaker cards */}
          {speakers.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">About the speaker{speakers.length > 1 ? 's' : ''}</h2>
              <div className="space-y-3">
                {speakers.map((spk) => (
                  <SpeakerCard key={spk.id} speaker={spk} compact />
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {activities.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="border-b border-border px-5 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Learning activities
                  <span className="ml-2 rounded-full bg-accent-light px-1.5 py-0.5 text-xs text-accent">{activities.length}</span>
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="rounded-lg border border-border bg-surface p-4 space-y-2">
                    <p className="font-medium text-foreground">{act.title}</p>
                    {act.description && <p className="text-sm text-muted-foreground">{act.description}</p>}
                    <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-accent-light text-accent capitalize">
                      {act.activity_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussion */}
          {userId && (
            <DiscussionSection
              videoId={id}
              userId={userId}
              userDisplayName={userDisplayName}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {isPremium ? (
            <AIChatBox context={video.title} />
          ) : (
            <PremiumGate
              title="AI Learning Assistant"
              message="Ask questions about this topic and get helpful answers — available with Premium."
            />
          )}

          {related.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Related videos</h2>
              <div className="space-y-3">
                {related.map((rv) => (
                  <VideoCard key={rv.id} video={rv} isPremiumUser={isPremium} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
