'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck, CheckCircle, ChevronLeft, Clock, Phone, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VimeoPlayer } from '@/components/video/VimeoPlayer'
import { VideoCard } from '@/components/video/VideoCard'
import { AISummaryBox } from '@/components/ai/AISummaryBox'
import { AIChatBox } from '@/components/ai/AIChatBox'
import { PremiumGate } from '@/components/shared/PremiumGate'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import { SpeakerCard } from '@/components/shared/SpeakerCard'
import { DiscussionSection } from '@/components/shared/DiscussionSection'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import { formatDuration, cn } from '@/lib/utils'
import type { Video, VideoActivity, VideoTranscriptSegment, Speaker } from '@/types/database'
import Link from 'next/link'

export default function VideoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [related, setRelated] = useState<Video[]>([])
  const [activities, setActivities] = useState<VideoActivity[]>([])
  const [segments, setSegments] = useState<VideoTranscriptSegment[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progressSeconds, setProgressSeconds] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userDisplayName, setUserDisplayName] = useState<string>('Community member')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'transcript' | 'activities'>('transcript')

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
        { data: segs },
        { data: profile },
        { data: vsRows },
      ] = await Promise.all([
        supabase.from('videos').select('*').eq('id', id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase.from('saved_videos').select('id').eq('user_id', user.id).eq('video_id', id).maybeSingle(),
        supabase.from('watch_progress').select('*').eq('user_id', user.id).eq('video_id', id).maybeSingle(),
        supabase.from('video_activities').select('*').eq('video_id', id),
        supabase.from('video_transcript_segments').select('*').eq('video_id', id).order('start_time'),
        supabase.from('profiles').select('display_name').eq('id', user.id).single(),
        (supabase as any).from('video_speakers').select('speaker_id').eq('video_id', id),
      ])

      const vidData = vid as Video | null
      if (!vidData) { router.push('/library'); return }

      const subData = sub as { plan: string; status: string } | null
      const progressData = progress as { completed: boolean; progress_seconds: number } | null
      const premium = subData?.plan === 'premium' && subData?.status === 'active'
      setIsPremium(premium)
      setVideo(vidData)
      setIsSaved(!!savedRow)
      setIsCompleted(progressData?.completed ?? false)
      setProgressSeconds(progressData?.progress_seconds ?? 0)
      setActivities((acts ?? []) as VideoActivity[])
      setSegments((segs ?? []) as VideoTranscriptSegment[])
      setUserDisplayName((profile as any)?.display_name ?? 'Community member')

      // Load structured speaker profiles
      const speakerIds = ((vsRows ?? []) as { speaker_id: string }[]).map((r) => r.speaker_id)
      if (speakerIds.length > 0) {
        const { data: spData } = await (supabase as any)
          .from('speakers')
          .select('*')
          .in('id', speakerIds)
        setSpeakers((spData ?? []) as Speaker[])
      }

      // Load related videos — prefer same topic, then same category, excluding current
      let relatedVids: Video[] = []
      if (vidData.topic_id) {
        const { data: topicRelated } = await supabase
          .from('videos')
          .select('*')
          .eq('topic_id', vidData.topic_id)
          .neq('id', id)
          .limit(4)
        relatedVids = (topicRelated ?? []) as Video[]
      }
      if (relatedVids.length < 4) {
        const { data: catRelated } = await supabase
          .from('videos')
          .select('*')
          .eq('category', vidData.category)
          .neq('id', id)
          .limit(4 - relatedVids.length)
        const existing = new Set(relatedVids.map((v) => v.id))
        relatedVids = [...relatedVids, ...((catRelated ?? []) as Video[]).filter((v) => !existing.has(v.id))]
      }
      setRelated(relatedVids.filter((v) => !v.is_premium || premium))

      setLoading(false)
    }
    load()
  }, [id, router])

  const handleProgress = useCallback(async (seconds: number) => {
    if (!userId || !video) return
    setProgressSeconds(seconds)
    const completed = video.duration_seconds ? seconds >= video.duration_seconds * 0.9 : false
    const supabase = createClient()
    await (supabase.from('watch_progress') as any).upsert({
      user_id: userId,
      video_id: video.id,
      progress_seconds: seconds,
      completed,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: 'user_id,video_id' })
    if (completed) setIsCompleted(true)
  }, [userId, video])

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
    if (!userId || !video) return
    const supabase = createClient()
    await (supabase.from('watch_progress') as any).upsert({
      user_id: userId,
      video_id: video.id,
      progress_seconds: video.duration_seconds ?? 0,
      completed: true,
      last_watched_at: new Date().toISOString(),
    }, { onConflict: 'user_id,video_id' })
    setIsCompleted(true)
  }, [userId, video])

  if (loading) return <PageLoader />
  if (!video) return null

  const isLocked = video.is_premium && !isPremium
  const catColor = CATEGORY_COLORS[video.category] ?? 'bg-surface text-muted-foreground'
  const catIcon = CATEGORY_ICONS[video.category] ?? '📹'

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to library
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {isLocked ? (
            <PremiumGate title="Premium Video" message="This video is part of the Premium plan. Upgrade to watch it and access all premium content." />
          ) : (
            <VimeoPlayer
              vimeoId={video.vimeo_id}
              title={video.title}
              startAt={progressSeconds}
              onProgress={handleProgress}
            />
          )}

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
              {video.estimated_learning_minutes > 0 && (
                <span className="text-xs text-muted-foreground bg-surface border border-border rounded-full px-2.5 py-1">
                  {video.estimated_learning_minutes} min learning
                </span>
              )}
            </div>

            {video.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{video.description}</p>
            )}

            {/* Tags */}
            {video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {video.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
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

          {/* AI Summary */}
          <AISummaryBox videoId={video.id} isPremiumUser={isPremium} />

          {/* Transcript + Activities tabs */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="flex border-b border-border" role="tablist">
              {(['transcript', 'activities'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
                    activeTab === tab
                      ? 'border-b-2 border-accent text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                  {tab === 'activities' && activities.length > 0 && (
                    <span className="ml-2 rounded-full bg-accent-light px-1.5 py-0.5 text-xs text-accent">
                      {activities.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5" role="tabpanel">
              {activeTab === 'transcript' && (
                segments.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                    {segments.map((seg) => (
                      <div key={seg.id} className="flex gap-3">
                        <span className="shrink-0 text-xs text-muted-foreground pt-0.5 w-10">
                          {Math.floor(seg.start_time / 60)}:{String(Math.floor(seg.start_time % 60)).padStart(2,'0')}
                        </span>
                        <p className="text-sm text-foreground">{seg.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No transcript available for this video yet.</p>
                )
              )}

              {activeTab === 'activities' && (
                activities.length > 0 ? (
                  <div className="space-y-4">
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
                ) : (
                  <p className="text-sm text-muted-foreground">No activities for this video yet.</p>
                )
              )}
            </div>
          </div>

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
          {/* AI Chat */}
          {isPremium ? (
            <AIChatBox context={video.title} />
          ) : (
            <PremiumGate
              title="AI Learning Assistant"
              message="Ask questions about this video and get helpful answers — available with Premium."
            />
          )}

          {/* Related videos */}
          {related.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Related sessions</h2>
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
