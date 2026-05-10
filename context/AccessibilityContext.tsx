'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { FontSize } from '@/types/database'

export type { FontSize }
export type ColorTheme = 'light' | 'dark'
export type ZoomLevel = '100' | '115' | '130'
export type LineHeight = 'normal' | 'relaxed' | 'loose'
export type TextAlign = 'default' | 'left' | 'center'
export type Saturation = 'normal' | 'low' | 'none'

export interface AccessibilitySettings {
  fontSize: FontSize
  theme: ColorTheme
  highContrast: boolean
  invertColors: boolean
  zoom: ZoomLevel
  highlightLinks: boolean
  textSpacing: boolean
  hideImages: boolean
  dyslexiaFont: boolean
  lineHeight: LineHeight
  textAlign: TextAlign
  saturation: Saturation
  readAloud: boolean
}

const DEFAULTS: AccessibilitySettings = {
  fontSize: 'normal',
  theme: 'light',
  highContrast: false,
  invertColors: false,
  zoom: '100',
  highlightLinks: false,
  textSpacing: false,
  hideImages: false,
  dyslexiaFont: false,
  lineHeight: 'normal',
  textAlign: 'default',
  saturation: 'normal',
  readAloud: false,
}

interface AccessibilityContextValue extends AccessibilitySettings {
  update: (patch: Partial<AccessibilitySettings>) => void
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  ...DEFAULTS,
  update: () => {},
})

function applySettings(s: AccessibilitySettings) {
  const html = document.documentElement

  // Font size
  const fontSizeMap: Record<FontSize, string> = { small: '14px', normal: '16px', large: '20px' }
  html.style.fontSize = fontSizeMap[s.fontSize]
  html.dataset.fontSize = s.fontSize

  // Theme
  html.classList.toggle('dark', s.theme === 'dark')

  // Zoom
  html.style.zoom = `${s.zoom}%`

  // High contrast
  html.classList.toggle('high-contrast', s.highContrast)

  // Combined CSS filter (invert + saturation)
  const filters: string[] = []
  if (s.invertColors) filters.push('invert(1) hue-rotate(180deg)')
  if (s.saturation === 'low') filters.push('saturate(0.5)')
  else if (s.saturation === 'none') filters.push('saturate(0)')
  html.style.filter = filters.join(' ')

  // Toggle classes for new options
  html.classList.toggle('highlight-links', s.highlightLinks)
  html.classList.toggle('text-spacing', s.textSpacing)
  html.classList.toggle('hide-images', s.hideImages)
  html.classList.toggle('dyslexia-font', s.dyslexiaFont)

  html.classList.remove('line-height-relaxed', 'line-height-loose')
  if (s.lineHeight !== 'normal') html.classList.add(`line-height-${s.lineHeight}`)

  html.classList.remove('text-align-left', 'text-align-center')
  if (s.textAlign !== 'default') html.classList.add(`text-align-${s.textAlign}`)
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULTS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('lms-accessibility')
    const parsed = stored ? (JSON.parse(stored) as Partial<AccessibilitySettings>) : {}
    const merged = { ...DEFAULTS, ...parsed }
    setSettings(merged)
    applySettings(merged)
    setMounted(true)
  }, [])

  function update(patch: Partial<AccessibilitySettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem('lms-accessibility', JSON.stringify(next))
      applySettings(next)
      return next
    })
  }

  if (!mounted) return <>{children}</>

  return (
    <AccessibilityContext.Provider value={{ ...settings, update }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

// Backwards-compat shim for FontSizeContext usage
export function useFontSize() {
  const { fontSize, update } = useAccessibility()
  return { fontSize, setFontSize: (size: FontSize) => update({ fontSize: size }) }
}
