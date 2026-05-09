'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { Speaker } from '@/types/database'

interface SpeakerCardProps {
  speaker: Speaker
  compact?: boolean
}

export function SpeakerCard({ speaker, compact = false }: SpeakerCardProps) {
  if (compact) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground text-sm">{speaker.name}</p>
            {speaker.credentials && (
              <p className="text-xs text-muted-foreground">{speaker.credentials}</p>
            )}
            {speaker.organization && (
              <p className="text-xs text-muted-foreground">{speaker.organization}</p>
            )}
          </div>
        </div>
        {speaker.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{speaker.bio}</p>
        )}
        {speaker.topic_specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {speaker.topic_specialties.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-accent-light px-2 py-0.5 text-xs text-accent">{t}</span>
            ))}
          </div>
        )}
        <Link
          href={`/speakers/${speaker.id}`}
          className="inline-block text-xs font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          View full profile →
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">{speaker.name}</h2>
        {speaker.credentials && (
          <p className="text-sm text-muted-foreground mt-0.5">{speaker.credentials}</p>
        )}
        {speaker.organization && (
          <p className="text-sm text-muted-foreground">{speaker.organization}</p>
        )}
      </div>

      {speaker.bio && (
        <p className="text-sm text-foreground leading-relaxed">{speaker.bio}</p>
      )}

      {speaker.topic_specialties.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topic Specialties</p>
          <div className="flex flex-wrap gap-1.5">
            {speaker.topic_specialties.map((t) => (
              <span key={t} className="rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        {speaker.website_url && (
          <a
            href={speaker.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            Website <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
        {speaker.contact_url && (
          <a
            href={speaker.contact_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            Contact <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  )
}
