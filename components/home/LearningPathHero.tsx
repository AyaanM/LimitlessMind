import Link from 'next/link'
import { Play, Clock, Lock } from 'lucide-react'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import { formatDuration, getYouTubeThumbnail, cn } from '@/lib/utils'
import type { Video } from '@/types/database'

interface LearningPathHeroProps {
  video: Video
  reason: string
  isPremiumUser: boolean
  progressSeconds?: number
}

export function LearningPathHero({ video, reason, isPremiumUser, progressSeconds = 0 }: LearningPathHeroProps) {
  const isLocked = video.is_premium && !isPremiumUser
  const thumbnail = video.thumbnail_url ?? getYouTubeThumbnail(video.youtube_id)
  const catColor = CATEGORY_COLORS[video.category] ?? 'bg-surface text-muted-foreground'
  const catIcon = CATEGORY_ICONS[video.category] ?? '📹'
  const progressPct = video.duration_seconds && progressSeconds
    ? Math.round((progressSeconds / video.duration_seconds) * 100)
    : 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-card-hover">
      {/* Background thumbnail */}
      <div className="absolute inset-0">
        <img
          src={thumbnail}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-8 sm:px-10 sm:py-12 max-w-xl">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow">
          <span aria-hidden="true">▶</span> Up next in your learning path
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-2">
          {video.title}
        </h2>

        <p className="text-sm text-white/70 mb-4 italic">{reason}</p>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium', catColor)}>
            <span aria-hidden="true">{catIcon}</span> {video.category}
          </span>
          {video.duration_seconds && (
            <span className="flex items-center gap-1 text-xs text-white/70">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDuration(video.duration_seconds)}
            </span>
          )}
          {video.speaker && (
            <span className="text-xs text-white/70">{video.speaker}</span>
          )}
        </div>

        {/* Progress bar */}
        {progressPct > 0 && (
          <div className="mb-4">
            <div className="h-1 w-full rounded-full bg-white/20">
              <div className="h-full rounded-full bg-accent" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="mt-1 text-xs text-white/60">{progressPct}% watched</p>
          </div>
        )}

        {isLocked ? (
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Lock className="h-4 w-4" aria-hidden="true" /> Unlock with Premium
          </Link>
        ) : (
          <Link
            href={`/video/${video.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Play className="h-4 w-4 translate-x-0.5" aria-hidden="true" />
            {progressPct > 0 ? 'Continue watching' : 'Watch now'}
          </Link>
        )}
      </div>
    </div>
  )
}
