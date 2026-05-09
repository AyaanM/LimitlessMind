'use client'

import { AVATAR_IDS } from '@/lib/constants'
import type { AvatarId } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface AvatarBuilderProps {
  value: AvatarId | string
  onChange: (id: AvatarId) => void
}

export function AvatarBuilder({ value, onChange }: AvatarBuilderProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-foreground">Choose your avatar</p>
      <div
        className="grid grid-cols-4 gap-3"
        role="radiogroup"
        aria-label="Choose your avatar"
      >
        {AVATAR_IDS.map((id) => {
          const selected = value === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Avatar ${id.replace('avatar-', '')}`}
              onClick={() => onChange(id)}
              className={cn(
                'relative flex items-center justify-center rounded-xl border-2 p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                selected
                  ? 'border-accent bg-accent-light'
                  : 'border-border bg-card hover:border-accent/40 hover:bg-surface'
              )}
            >
              <img
                src={`/avatars/${id}.svg`}
                alt=""
                className="h-16 w-16 rounded-lg"
                aria-hidden="true"
              />
              {selected && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                  <span className="text-xs" aria-hidden="true">✓</span>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
