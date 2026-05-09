'use client'

import { VIDEO_CATEGORIES } from '@/lib/constants'
import type { VideoCategory } from '@/types/database'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  value: VideoCategory | 'all'
  onChange: (cat: VideoCategory | 'all') => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by category"
    >
      {VIDEO_CATEGORIES.map((cat) => {
        const active = value === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id as VideoCategory | 'all')}
            aria-pressed={active}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              active
                ? 'bg-accent text-white'
                : 'bg-card border border-border text-muted-foreground hover:border-accent/40 hover:text-accent'
            )}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
