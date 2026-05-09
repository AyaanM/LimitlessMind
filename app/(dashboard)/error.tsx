'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4">
        <div className="text-4xl" aria-hidden="true">⚠️</div>
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          There was a problem loading this page. This is likely a database configuration issue.
        </p>
        {error.message && (
          <p className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs font-mono text-destructive">
            {error.message}
          </p>
        )}
        <button
          onClick={reset}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
