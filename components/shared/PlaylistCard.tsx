import Link from 'next/link'
import { ListVideo, Clock } from 'lucide-react'
import { SubscriptionBadge } from './SubscriptionBadge'
import type { Playlist } from '@/types/database'
import { cn } from '@/lib/utils'

interface PlaylistCardProps {
  playlist: Playlist
  videoCount?: number
  isPremiumUser?: boolean
}

export function PlaylistCard({ playlist, videoCount, isPremiumUser }: PlaylistCardProps) {
  const isLocked = playlist.is_premium && !isPremiumUser

  return (
    <Link
      href={isLocked ? '/subscription' : `/playlists/${playlist.id}`}
      className={cn(
        'block rounded-xl border border-border bg-card p-5 space-y-3 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        isLocked && 'opacity-60'
      )}
      aria-label={`${playlist.title}${isLocked ? ' — Premium' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm leading-tight">{playlist.title}</h3>
          {playlist.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{playlist.description}</p>
          )}
        </div>
        <SubscriptionBadge isPremium={playlist.is_premium} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ListVideo className="h-3 w-3" aria-hidden="true" />
          {typeof videoCount === 'number' ? `${videoCount} video${videoCount !== 1 ? 's' : ''}` : 'Playlist'}
        </span>
      </div>

      {playlist.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {playlist.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground border border-border">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
