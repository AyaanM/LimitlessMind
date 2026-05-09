'use client'

import { useFontSize } from '@/context/FontSizeContext'
import { cn } from '@/lib/utils'
import type { FontSize } from '@/types/database'

const sizes: { id: FontSize; label: string; ariaLabel: string }[] = [
  { id: 'small',  label: 'A',  ariaLabel: 'Small text' },
  { id: 'normal', label: 'A',  ariaLabel: 'Normal text' },
  { id: 'large',  label: 'A',  ariaLabel: 'Large text' },
]

export function FontSizeControl() {
  const { fontSize, setFontSize } = useFontSize()

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Text Size</p>
      <div className="flex gap-1" role="group" aria-label="Adjust text size">
        {sizes.map((size, i) => (
          <button
            key={size.id}
            onClick={() => setFontSize(size.id)}
            aria-label={size.ariaLabel}
            aria-pressed={fontSize === size.id}
            className={cn(
              'flex h-9 flex-1 items-center justify-center rounded-md border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              i === 0 && 'text-xs',
              i === 1 && 'text-sm',
              i === 2 && 'text-base',
              fontSize === size.id
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
            )}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  )
}
