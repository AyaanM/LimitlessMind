import type { ContactCard as ContactCardType } from '@/types/database'
import { Mail, Phone, Globe, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactCardProps {
  card: ContactCardType
  className?: string
}

export function ContactCard({ card, className }: ContactCardProps) {
  const isEmergency = card.category === 'emergency'

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6 shadow-card',
        isEmergency
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-border',
        className
      )}
    >
      {isEmergency && (
        <div className="mb-4 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold">Emergency Contact</span>
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{card.name}</h3>
        {card.title && (
          <p className="text-sm font-medium text-accent">{card.title}</p>
        )}
        {card.organization && (
          <p className="text-sm text-muted-foreground">{card.organization}</p>
        )}
      </div>

      {card.description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {card.description}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {card.email && (
          <a
            href={`mailto:${card.email}`}
            className="flex items-center gap-2 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{card.email}</span>
          </a>
        )}
        {card.phone && (
          <a
            href={`tel:${card.phone}`}
            className="flex items-center gap-2 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{card.phone}</span>
          </a>
        )}
        {card.website && (
          <a
            href={card.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Website</span>
          </a>
        )}
      </div>
    </div>
  )
}
