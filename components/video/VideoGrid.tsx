import { VideoCard } from './VideoCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Video } from '@/types/database'

interface VideoGridProps {
  videos: Video[]
  progressMap?: Record<string, number>
  savedIds?: Set<string>
  isPremiumUser?: boolean
  onSaveToggle?: (videoId: string, saved: boolean) => void
}

export function VideoGrid({
  videos,
  progressMap = {},
  savedIds = new Set(),
  isPremiumUser = false,
  onSaveToggle,
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No videos found"
        description="Try adjusting your filters or search to find what you're looking for."
      />
    )
  }

  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="list"
      aria-label="Video results"
    >
      {videos.map((video) => (
        <div key={video.id} role="listitem">
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
  )
}
