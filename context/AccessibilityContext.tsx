'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { FontSize } from '@/types/database'

export type { FontSize }
export type ColorTheme = 'light' | 'dark'
export type ZoomLevel = '100' | '115' | '130'

export interface AccessibilitySettings {
  fontSize: FontSize
  theme: ColorTheme
  highContrast: boolean
  invertColors: boolean
  zoom: ZoomLevel
}

const DEFAULTS: AccessibilitySettings = {
  fontSize: 'normal',
  theme: 'light',
  highContrast: false,
  invertColors: false,
  zoom: '100',
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
  if (s.theme === 'dark') html.classList.add('dark')
  else html.classList.remove('dark')

  // Zoom
  html.style.setProperty('--ui-zoom', `${s.zoom}%`)
  html.style.zoom = `${s.zoom}%`

  // High contrast
  if (s.highContrast) html.classList.add('high-contrast')
  else html.classList.remove('high-contrast')

  // Invert
  if (s.invertColors) html.style.filter = 'invert(1) hue-rotate(180deg)'
  else html.style.filter = ''
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
