import { VideoCard } from './VideoCard'
import type { Video } from '@/types/database'

interface VideoRowProps {
  title: string
  subtitle?: string
  videos: Video[]
  progressMap?: Record<string, number>
  savedIds?: Set<string>
  isPremiumUser?: boolean
  onSaveToggle?: (videoId: string, saved: boolean) => void
  emptyMessage?: string
}

export function VideoRow({
  title,
  subtitle,
  videos,
  progressMap = {},
  savedIds = new Set(),
  isPremiumUser = false,
  onSaveToggle,
  emptyMessage,
}: VideoRowProps) {
  if (videos.length === 0) {
    if (emptyMessage) {
      return (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </section>
      )
    }
    return null
  }

  return (
    <section className="space-y-3" aria-label={title}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin"
        role="list"
        aria-label={`${title} videos`}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            role="listitem"
            className="w-64 shrink-0 sm:w-72"
          >
            <VideoCard
              video={video}
              progressSeconds={progressMap[video.id]}
              isSaved={savedIds.has(video.id)}
              isPremiumUser={isPremiumUser}
              onSaveToggle={onSaveToggle}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
