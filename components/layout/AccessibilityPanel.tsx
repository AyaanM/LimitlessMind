'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Accessibility, Sun, Moon, ZoomIn, Type, Contrast, Blend, X,
  Link2, SpaceIcon, ImageOff, BookOpen, AlignLeft, AlignCenter,
  Droplets, Volume2,
} from 'lucide-react'
import { useAccessibility } from '@/context/AccessibilityContext'
import type { FontSize, ColorTheme, ZoomLevel, LineHeight, TextAlign, Saturation } from '@/context/AccessibilityContext'
import { cn } from '@/lib/utils'

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false)
  const {
    fontSize, theme, highContrast, invertColors, zoom,
    highlightLinks, textSpacing, hideImages, dyslexiaFont,
    lineHeight, textAlign, saturation, readAloud,
    update,
  } = useAccessibility()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function Toggle({ id, label, icon: Icon, value }: { id: keyof ReturnType<typeof useAccessibility>; label: string; icon: typeof Accessibility; value: boolean }) {
    return (
      <button
        onClick={() => update({ [id]: !value } as any)}
        role="switch"
        aria-checked={value}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
        </span>
        <span className={cn('h-5 w-9 rounded-full border transition-colors', value ? 'bg-accent border-accent' : 'bg-surface border-border')}>
          <span className={cn('block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5', value ? 'translate-x-4' : 'translate-x-0.5')} />
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Accessibility settings"
          className="w-72 rounded-2xl border border-border bg-card shadow-card-hover animate-fade-in overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Accessibility</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close accessibility panel"
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[80vh] overflow-y-auto space-y-5 p-4">

            {/* Display */}
            <section aria-label="Display">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Sun className="h-3 w-3" /> Display
              </p>
              <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Color theme">
                {([['light', 'Light', Sun], ['dark', 'Dark', Moon]] as [ColorTheme, string, typeof Sun][]).map(([id, label, Icon]) => (
                  <button key={id} onClick={() => update({ theme: id })} aria-pressed={theme === id}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      theme === id ? 'border-accent bg-accent text-white' : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                    )}
                  >
                    <Icon className="h-3 w-3" /> {label}
                  </button>
                ))}
              </div>
            </section>

            {/* Text */}
            <section aria-label="Text">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Type className="h-3 w-3" /> Text
              </p>
              <div className="space-y-2">
                {/* Font size */}
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

                {/* Line height */}
                <div className="grid grid-cols-3 gap-1" role="group" aria-label="Line height">
                  {([['normal', 'Normal'], ['relaxed', 'Relaxed'], ['loose', 'Loose']] as [LineHeight, string][]).map(([id, label]) => (
                    <button key={id} onClick={() => update({ lineHeight: id })} aria-pressed={lineHeight === id}
                      className={cn(
                        'rounded-lg border py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        lineHeight === id ? 'border-accent bg-accent text-white' : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Text align */}
                <div className="grid grid-cols-3 gap-1" role="group" aria-label="Text alignment">
                  {([['default', 'Default', AlignLeft], ['left', 'Left', AlignLeft], ['center', 'Center', AlignCenter]] as [TextAlign, string, typeof AlignLeft][]).map(([id, label, Icon]) => (
                    <button key={id} onClick={() => update({ textAlign: id })} aria-pressed={textAlign === id}
                      className={cn(
                        'flex flex-col items-center gap-0.5 rounded-lg border py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        textAlign === id ? 'border-accent bg-accent text-white' : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                      )}
                    >
                      <Icon className="h-3 w-3" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Zoom */}
            <section aria-label="Zoom">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <ZoomIn className="h-3 w-3" /> Zoom
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
            </section>

            {/* Colour & Vision */}
            <section aria-label="Colour and vision">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Droplets className="h-3 w-3" /> Colour &amp; Vision
              </p>
              <div className="space-y-2">
                {/* Saturation */}
                <div className="grid grid-cols-3 gap-1" role="group" aria-label="Saturation">
                  {([['normal', 'Normal'], ['low', 'Low'], ['none', 'None']] as [Saturation, string][]).map(([id, label]) => (
                    <button key={id} onClick={() => update({ saturation: id })} aria-pressed={saturation === id}
                      className={cn(
                        'rounded-lg border py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        saturation === id ? 'border-accent bg-accent text-white' : 'border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Toggle id="highContrast" label="High Contrast" icon={Contrast} value={highContrast} />
                <Toggle id="invertColors" label="Invert Colours" icon={Blend} value={invertColors} />
              </div>
            </section>

            {/* Reading aids */}
            <section aria-label="Reading aids">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="h-3 w-3" /> Reading Aids
              </p>
              <div className="space-y-2">
                <Toggle id="highlightLinks" label="Highlight Links" icon={Link2} value={highlightLinks} />
                <Toggle id="textSpacing" label="Text Spacing" icon={SpaceIcon} value={textSpacing} />
                <Toggle id="hideImages" label="Hide Images" icon={ImageOff} value={hideImages} />
                <Toggle id="dyslexiaFont" label="Dyslexia Friendly Font" icon={Type} value={dyslexiaFont} />
                <Toggle id="readAloud" label="Read Aloud (hover text)" icon={Volume2} value={readAloud} />
              </div>
            </section>

            <button
              onClick={() => update({
                fontSize: 'normal', theme: 'light', highContrast: false, invertColors: false, zoom: '100',
                highlightLinks: false, textSpacing: false, hideImages: false, dyslexiaFont: false,
                lineHeight: 'normal', textAlign: 'default', saturation: 'normal', readAloud: false,
              })}
              className="w-full rounded-lg border border-border py-1.5 text-xs text-muted-foreground hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Accessibility settings"
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-card-hover transition-all hover:bg-accent-hover hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
