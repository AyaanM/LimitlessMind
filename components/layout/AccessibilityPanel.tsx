'use client'

import { useState } from 'react'
import { Settings, Sun, Moon, ZoomIn, Type, Contrast, Blend, ChevronDown, ChevronUp } from 'lucide-react'
import { useAccessibility } from '@/context/AccessibilityContext'
import type { FontSize, ColorTheme, ZoomLevel } from '@/context/AccessibilityContext'
import { cn } from '@/lib/utils'

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false)
  const { fontSize, theme, highContrast, invertColors, zoom, update } = useAccessibility()

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left font-medium">Accessibility</span>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0" aria-hidden="true" />
          : <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
        }
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4 animate-fade-in">

          {/* Theme */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Sun className="h-3 w-3" aria-hidden="true" /> Display
            </p>
            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Color theme">
              {([['light', 'Light', Sun], ['dark', 'Dark', Moon]] as [ColorTheme, string, typeof Sun][]).map(([id, label, Icon]) => (
                <button key={id} onClick={() => update({ theme: id })} aria-pressed={theme === id}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    theme === id ? 'border-accent bg-accent text-white' : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                  )}
                >
                  <Icon className="h-3 w-3" aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Type className="h-3 w-3" aria-hidden="true" /> Text Size
            </p>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Text size">
              {([['small', 'A', 'Small'], ['normal', 'A', 'Normal'], ['large', 'A', 'Large']] as [FontSize, string, string][]).map(([id, label, ariaLabel], i) => (
                <button key={id} onClick={() => update({ fontSize: id })} aria-label={ariaLabel} aria-pressed={fontSize === id}
                  className={cn(
                    'rounded-lg border py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    i === 0 ? 'text-xs' : i === 1 ? 'text-sm' : 'text-base',
                    fontSize === id ? 'border-accent bg-accent text-white' : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <ZoomIn className="h-3 w-3" aria-hidden="true" /> Zoom
            </p>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Page zoom">
              {(['100', '115', '130'] as ZoomLevel[]).map((level) => (
                <button key={level} onClick={() => update({ zoom: level })} aria-pressed={zoom === level}
                  className={cn(
                    'rounded-lg border py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    zoom === level ? 'border-accent bg-accent text-white' : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                  )}
                >
                  {level}%
                </button>
              ))}
            </div>
          </div>

          {/* Toggle options */}
          <div className="space-y-2">
            {[
              { id: 'highContrast', label: 'High Contrast', icon: Contrast, value: highContrast },
              { id: 'invertColors', label: 'Invert Colors', icon: Blend, value: invertColors },
            ].map(({ id, label, icon: Icon, value }) => (
              <button
                key={id}
                onClick={() => update({ [id]: !value } as Partial<ReturnType<typeof useAccessibility>>)}
                role="switch"
                aria-checked={value}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                </span>
                <span className={cn(
                  'h-5 w-9 rounded-full border transition-colors',
                  value ? 'bg-accent border-accent' : 'bg-surface border-border'
                )}>
                  <span className={cn(
                    'block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5',
                    value ? 'translate-x-4' : 'translate-x-0.5'
                  )} />
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => update({ fontSize: 'normal', theme: 'light', highContrast: false, invertColors: false, zoom: '100' })}
            className="w-full rounded-lg border border-border py-1.5 text-xs text-muted-foreground hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  )
}
