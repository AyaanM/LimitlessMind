'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft } from 'lucide-react'
import { SpeakerCard } from '@/components/shared/SpeakerCard'
import { VideoCard } from '@/components/video/VideoCard'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Speaker, Video } from '@/types/database'
import Link from 'next/link'

export default function SpeakerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const [
        { data: speakerData },
        { data: sub },
      ] = await Promise.all([
        (supabase as any).from('speakers').select('*').eq('id', id).single(),
        supabase.from('subscriptions').select('plan,status').eq('user_id', user.id).single(),
      ])

      if (!speakerData) { router.push('/library'); return }
      setSpeaker(speakerData as Speaker)

      const subData = sub as { plan: string; status: string } | null
      const premium = subData?.plan === 'premium' && subData?.status === 'active'
      setIsPremium(premium)

      // Load videos linked to this speaker via video_speakers
      const { data: vsRows } = await (supabase as any)
        .from('video_speakers')
        .select('video_id')
        .eq('speaker_id', id)

      const videoIds = ((vsRows ?? []) as { video_id: string }[]).map((r) => r.video_id)

      if (videoIds.length > 0) {
        const { data: vidData } = await supabase
          .from('videos')
          .select('*')
          .in('id', videoIds)
          .order('created_at', { ascending: false })
        setVideos(((vidData ?? []) as Video[]).filter((v) => !v.is_premium || premium))
      }

      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) return <PageLoader />
  if (!speaker) return null

  return (
    <div className="space-y-8">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to library
      </Link>

      <SpeakerCard speaker={speaker} />

      <section className="space-y-4" aria-label="Videos by this speaker">
        <h2 className="text-lg font-semibold text-foreground">
          Sessions by {speaker.name}
        </h2>

        {videos.length === 0 ? (
          <EmptyState
            icon="📹"
            title="No sessions yet"
            description="Videos by this speaker will appear here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} isPremiumUser={isPremium} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
