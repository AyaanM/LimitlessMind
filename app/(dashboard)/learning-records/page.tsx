'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Award, Clock, CheckCircle, BookOpen, GraduationCap } from 'lucide-react'
import { CertificateCard } from '@/components/shared/CertificateCard'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProgressCard } from '@/components/shared/ProgressCard'
import { formatDate } from '@/lib/utils'
import type { Certificate, WatchProgress, Video } from '@/types/database'
import Link from 'next/link'

export default function LearningRecordsPage() {
  const [loading, setLoading] = useState(true)
  const [certs, setCerts] = useState<Certificate[]>([])
  const [watchRows, setWatchRows] = useState<WatchProgress[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: certData },
        { data: watchData },
        { data: profileData },
        { data: vidData },
      ] = await Promise.all([
        (supabase as any).from('certificates').select('*').eq('user_id', user.id).order('issued_at', { ascending: false }),
        supabase.from('watch_progress').select('*').eq('user_id', user.id).order('last_watched_at', { ascending: false }),
        supabase.from('profiles').select('display_name').eq('id', user.id).single(),
        supabase.from('videos').select('id, title, category, duration_seconds, topic_id, certificate_eligible').order('title'),
      ])

      setCerts((certData ?? []) as Certificate[])
      setWatchRows((watchData ?? []) as WatchProgress[])
      setDisplayName((profileData as any)?.display_name ?? 'Learner')
      setVideos((vidData ?? []) as Video[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const completedRows = watchRows.filter((w) => w.completed)
  const inProgressRows = watchRows.filter((w) => !w.completed && w.progress_seconds > 0)
  const totalSeconds = watchRows.reduce((sum, w) => sum + w.progress_seconds, 0)
  const totalHours = (totalSeconds / 3600).toFixed(1)
  const totalMinutes = Math.round(totalSeconds / 60)

  const videoMap = Object.fromEntries(videos.map((v) => [v.id, v]))

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Learning Records</h1>
        <p className="text-muted-foreground">Your continuing education history and certificates.</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressCard
          label="Total watch time"
          value={totalMinutes >= 60 ? `${totalHours}h` : `${totalMinutes}m`}
          icon="⏱️"
          color="blue"
        />
        <ProgressCard
          label="Videos completed"
          value={completedRows.length}
          icon="✅"
          color="green"
        />
        <ProgressCard
          label="In progress"
          value={inProgressRows.length}
          icon="▶️"
          color="blue"
        />
        <ProgressCard
          label="Certificates earned"
          value={certs.length}
          icon="🏅"
          color="green"
        />
      </div>

      {/* Certificates section */}
      <section className="space-y-4" aria-label="Your certificates">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-sage" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">Certificates</h2>
        </div>

        {certs.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
            <GraduationCap className="h-10 w-10 text-muted-foreground/40 mx-auto" aria-hidden="true" />
            <p className="text-muted-foreground">No certificates yet.</p>
            <p className="text-sm text-muted-foreground">Complete certificate-eligible collections to earn your first certificate.</p>
            <Link
              href="/library"
              className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Browse collections
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certs.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </section>

      {/* Learning history */}
      <section className="space-y-4" aria-label="Learning history">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">Learning History</h2>
        </div>

        {watchRows.length === 0 ? (
          <EmptyState
            icon="📺"
            title="No videos watched yet"
            description="Start watching videos and your learning history will appear here."
            action={
              <Link href="/library" className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Browse the library
              </Link>
            }
          />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Video</th>
                  <th className="px-4 py-3 font-medium text-foreground hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 font-medium text-foreground">Watch time</th>
                  <th className="px-4 py-3 font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-foreground hidden md:table-cell">Last watched</th>
                </tr>
              </thead>
              <tbody>
                {watchRows.map((row) => {
                  const vid = videoMap[row.video_id]
                  const mins = Math.round(row.progress_seconds / 60)
                  return (
                    <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                      <td className="px-4 py-3">
                        {vid ? (
                          <Link
                            href={`/video/${vid.id}`}
                            className="font-medium text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded line-clamp-1"
                          >
                            {vid.title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Unavailable</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {vid?.category ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {mins < 1 ? '< 1 min' : `${mins} min`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.completed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sage-light px-2.5 py-0.5 text-xs font-medium text-sage">
                            <CheckCircle className="h-3 w-3" aria-hidden="true" /> Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">
                            ▶ In progress
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                        {formatDate(row.last_watched_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
