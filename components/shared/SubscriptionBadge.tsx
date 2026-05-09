import { cn } from '@/lib/utils'

interface SubscriptionBadgeProps {
  isPremium?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function SubscriptionBadge({ isPremium, className, size = 'sm' }: SubscriptionBadgeProps) {
  if (isPremium) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded font-medium',
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
          'bg-premium-light text-premium',
          className
        )}
        aria-label="Premium content"
      >
        <span aria-hidden="true">★</span> Premium
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        'bg-sage-light text-sage',
        className
      )}
      aria-label="Free content"
    >
      Free
    </span>
  )
}
