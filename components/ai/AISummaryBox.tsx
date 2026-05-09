'use client'

import { useEffect, useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PremiumGate } from '@/components/shared/PremiumGate'

interface AISummaryBoxProps {
  videoId: string
  isPremiumUser: boolean
}

interface Summary {
  summary: string
  keyPoints: string[]
}

export function AISummaryBox({ videoId, isPremiumUser }: AISummaryBoxProps) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!isPremiumUser) return

    setLoading(true)
    fetch(`/api/ai/summary?videoId=${videoId}`)
      .then((r) => r.json())
      .then((data) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [videoId, isPremiumUser])

  if (!isPremiumUser) {
    return (
      <PremiumGate
        title="AI Video Summary"
        message="Get a clear, simple summary of what this video covers — available with Premium."
      />
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
        aria-expanded={expanded}
      >
        <Sparkles className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold text-foreground">AI Summary</span>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        }
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          {loading ? (
            <LoadingSpinner label="Generating summary…" />
          ) : summary ? (
            <>
              <p className="text-sm leading-relaxed text-muted-foreground">{summary.summary}</p>
              {summary.keyPoints.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Key points</p>
                  <ul className="space-y-2">
                    {summary.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent">
                          {i + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No summary available for this video yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
