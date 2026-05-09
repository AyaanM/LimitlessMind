'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, Search } from 'lucide-react'
import { ResourceCard } from '@/components/shared/ResourceCard'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import type { ExternalOrganization } from '@/types/database'

const ORG_TYPES = ['All', 'National Non-Profit', 'Professional Association', 'Advocacy Organization', 'Community Organization', 'National Advocacy']
const TOPIC_FILTERS = ['All', 'Autism', 'Employment', 'Housing', 'Mental Health', 'Family', 'Health Care']

export default function ResourcesPage() {
  const [orgs, setOrgs] = useState<ExternalOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await (supabase as any)
        .from('external_organizations')
        .select('*')
        .eq('is_visible', true)
        .order('name')
      setOrgs((data ?? []) as ExternalOrganization[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = orgs.filter((o) => {
    if (typeFilter !== 'All' && o.organization_type !== typeFilter) return false
    if (topicFilter !== 'All' && !o.topics.includes(topicFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        o.name.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q) ||
        o.topics.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Partner Resources</h1>
        <p className="text-muted-foreground">Organizations and supports across the autism community in Canada and Alberta.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">External links:</strong> The resources below link to external websites.
          Autism Edmonton does not endorse or control these sites. Always verify information directly with the organization.
        </p>
      </div>

      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="resources-search" className="sr-only">Search resources</label>
          <input
            id="resources-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, topic, or location…"
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Type filter */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Organization type</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by organization type">
            {ORG_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                aria-pressed={typeFilter === t}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  typeFilter === t
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-card text-muted-foreground hover:text-accent'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Topic filter */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Topic area</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
            {TOPIC_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTopicFilter(t)}
                aria-pressed={topicFilter === t}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  topicFilter === t
                    ? 'border-sage bg-sage text-white'
                    : 'border-border bg-card text-muted-foreground hover:text-sage'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} organization{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="No organizations found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((org) => (
            <ResourceCard key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  )
}
