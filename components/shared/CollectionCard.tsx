import Link from 'next/link'
import { Award, Clock } from 'lucide-react'
import { SubscriptionBadge } from './SubscriptionBadge'
import type { Collection } from '@/types/database'
import { cn } from '@/lib/utils'

interface CollectionCardProps {
  collection: Collection
  completionPercent?: number
  isPremiumUser?: boolean
}

export function CollectionCard({ collection, completionPercent, isPremiumUser }: CollectionCardProps) {
  const isLocked = collection.is_premium && !isPremiumUser

  return (
    <Link
      href={isLocked ? '/subscription' : `/collections/${collection.id}`}
      className={cn(
        'block rounded-xl border border-border bg-card p-5 space-y-3 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        isLocked && 'opacity-60'
      )}
      aria-label={`${collection.title}${isLocked ? ' — Premium' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm leading-tight">{collection.title}</h3>
            {collection.certificate_eligible && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-light px-2 py-0.5 text-xs font-medium text-sage">
                <Award className="h-3 w-3" aria-hidden="true" /> Certificate
              </span>
            )}
          </div>
          {collection.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{collection.description}</p>
          )}
        </div>
        <SubscriptionBadge isPremium={collection.is_premium} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {collection.estimated_hours > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {collection.estimated_hours}h
          </span>
        )}
      </div>

      {collection.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {collection.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground border border-border">
              {tag}
            </span>
          ))}
        </div>
      )}

      {typeof completionPercent === 'number' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border">
            <div
              className="h-full rounded-full bg-sage transition-all"
              style={{ width: `${completionPercent}%` }}
              role="progressbar"
              aria-valuenow={completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
