import { cn } from '@/lib/utils'

interface ProgressCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon?: string
  color?: 'blue' | 'green' | 'amber'
  className?: string
}

export function ProgressCard({ label, value, subLabel, icon, color = 'blue', className }: ProgressCardProps) {
  const colorClasses = {
    blue:  'bg-accent-light border-accent/20 text-accent',
    green: 'bg-sage-light border-sage/20 text-sage',
    amber: 'bg-premium-light border-premium/20 text-premium',
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6 shadow-card',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl', colorClasses[color])}>
            <span aria-hidden="true">{icon}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {subLabel && <p className="mt-1 text-xs text-muted-foreground">{subLabel}</p>}
        </div>
      </div>
    </div>
  )
}
