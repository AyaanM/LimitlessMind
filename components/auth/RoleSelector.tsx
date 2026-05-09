'use client'

import { USER_ROLES } from '@/lib/constants'
import type { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

interface RoleSelectorProps {
  value: UserRole | null
  onChange: (role: UserRole) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Select your role">
      {USER_ROLES.map((role) => {
        const selected = value === role.id
        return (
          <button
            key={role.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(role.id)}
            className={cn(
              'flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              selected
                ? 'border-accent bg-accent-light'
                : 'border-border bg-card hover:border-accent/40 hover:bg-surface'
            )}
          >
            <span className="text-3xl" aria-hidden="true">{role.icon}</span>
            <div className="min-w-0">
              <p className={cn(
                'font-semibold',
                selected ? 'text-accent' : 'text-foreground'
              )}>
                {role.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
