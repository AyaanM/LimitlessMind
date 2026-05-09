import { ExternalLink, MapPin } from 'lucide-react'
import type { ExternalOrganization } from '@/types/database'

interface ResourceCardProps {
  org: ExternalOrganization
}

export function ResourceCard({ org }: ResourceCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground">{org.name}</h3>
          {org.organization_type && (
            <span className="shrink-0 rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">
              {org.organization_type}
            </span>
          )}
        </div>
        {org.location && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {org.location}
          </span>
        )}
      </div>

      {org.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{org.description}</p>
      )}

      {org.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {org.topics.map((topic) => (
            <span key={topic} className="rounded-full bg-surface border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {topic}
            </span>
          ))}
        </div>
      )}

      {org.website_url && (
        <a
          href={org.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Visit website
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in new tab)</span>
        </a>
      )}
    </div>
  )
}
