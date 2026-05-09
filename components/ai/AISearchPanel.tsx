'use client'

import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { VideoCard } from '@/components/video/VideoCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Video } from '@/types/database'

interface SearchResult {
  video: Video
  reason: string
  matchScore: number
}

interface AISearchPanelProps {
  isPremiumUser: boolean
  savedIds?: Set<string>
  onSaveToggle?: (videoId: string, saved: boolean) => void
}

export function AISearchPanel({ isPremiumUser, savedIds = new Set(), onSaveToggle }: AISearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch(`/api/ai/search?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setError('Search is unavailable right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <label htmlFor="ai-search" className="sr-only">Search videos by topic or question</label>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="ai-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isPremiumUser
              ? 'Ask a question or search by topic…'
              : 'Search by title, category, or keyword…'
            }
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          {isPremiumUser && <Sparkles className="h-4 w-4" aria-hidden="true" />}
          Search
        </button>
      </form>

      {isPremiumUser && (
        <div className="flex flex-wrap gap-2">
          {[
            'How do I prepare for a job interview?',
            'Housing support in Alberta',
            'Managing anxiety',
            'Setting boundaries',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner label="Searching videos…" />
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      {results !== null && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No videos matched your search. Try different words.
        </p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ video, reason }) => (
              <div key={video.id} className="space-y-1">
                <VideoCard
                  video={video}
                  isSaved={savedIds.has(video.id)}
                  isPremiumUser={isPremiumUser}
                  onSaveToggle={onSaveToggle}
                />
                {reason && (
                  <p className="px-1 text-xs text-muted-foreground">{reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
