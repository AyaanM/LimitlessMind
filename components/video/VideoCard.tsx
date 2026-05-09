'use client'

import Link from 'next/link'
import { Bookmark, BookmarkCheck, Lock, Clock } from 'lucide-react'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants'
import { formatDuration, getYouTubeThumbnail, getProgressPercent, cn } from '@/lib/utils'
import type { Video } from '@/types/database'

interface VideoCardProps {
  video: Video
  progressSeconds?: number
  isSaved?: boolean
  isPremiumUser?: boolean
  onSaveToggle?: (videoId: string, saved: boolean) => void
}

export function VideoCard({
  video,
  progressSeconds = 0,
  isSaved = false,
  isPremiumUser = false,
  onSaveToggle,
}: VideoCardProps) {
  const isLocked = video.is_premium && !isPremiumUser
  const progressPct = getProgressPercent(progressSeconds, video.duration_seconds)
  const thumbnail = video.thumbnail_url ?? getYouTubeThumbnail(video.youtube_id)
  const categoryColor = CATEGORY_COLORS[video.category] ?? 'bg-surface text-muted-foreground'
  const categoryIcon = CATEGORY_ICONS[video.category] ?? '📹'

  return (
    <article className="group relative flex flex-col rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover">
      <Link
        href={`/video/${video.id}`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 rounded-t-xl"
        aria-label={`Watch: ${video.title}${isLocked ? ' (Premium)' : ''}`}
        tabIndex={0}
      >
        <div className="relative overflow-hidden rounded-t-xl">
          <div className="aspect-video bg-surface">
            <img
              src={thumbnail}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              aria-hidden="true"
            />
          </div>

          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-1 text-white">
                <Lock className="h-8 w-8" aria-hidden="true" />
                <span className="text-xs font-medium">Premium</span>
              </div>
            </div>
          )}

          {progressPct > 0 && !isLocked && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progressPct}%` }}
                aria-label={`${progressPct}% watched`}
              />
            </div>
          )}

          <div className="absolute bottom-2 right-2">
            <SubscriptionBadge isPremium={video.is_premium} />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/video/${video.id}`}
            className="flex-1 focus-visible:outline-none"
            tabIndex={-1}
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-accent">
              {video.title}
            </h3>
          </Link>

          {onSaveToggle && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onSaveToggle(video.id, !isSaved)
              }}
              aria-label={isSaved ? `Remove "${video.title}" from saved` : `Save "${video.title}"`}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {isSaved
                ? <BookmarkCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                : <Bookmark className="h-4 w-4" aria-hidden="true" />
              }
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium', categoryColor)}>
            <span aria-hidden="true">{categoryIcon}</span>
            {video.category}
          </span>

          {video.duration_seconds && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatDuration(video.duration_seconds)}
            </span>
          )}
        </div>

        {video.speaker && (
          <p className="text-xs text-muted-foreground">
            {video.speaker}
          </p>
        )}
      </div>
    </article>
  )
}
