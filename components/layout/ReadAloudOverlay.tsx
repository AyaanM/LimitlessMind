'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { useAccessibility } from '@/context/AccessibilityContext'
import { cn } from '@/lib/utils'

const TEXT_SELECTORS = 'p, h1, h2, h3, h4, h5, h6, li, label, blockquote'

export function ReadAloudOverlay() {
  const { readAloud } = useAccessibility()
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [targetText, setTargetText] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!readAloud) {
      setPos(null)
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
      return
    }

    function handleOver(e: MouseEvent) {
      const el = e.target as HTMLElement
      if (!el.matches(TEXT_SELECTORS)) return
      const text = el.textContent?.trim() ?? ''
      if (text.length < 3) return
      clearTimeout(hideTimer.current)
      const rect = el.getBoundingClientRect()
      setPos({ x: rect.right - 34, y: rect.top - 6 })
      setTargetText(text)
    }

    function handleOut() {
      hideTimer.current = setTimeout(() => setPos(null), 700)
    }

    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)
    return () => {
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
    }
  }, [readAloud])

  function speak() {
    if (!targetText || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(targetText)
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  if (!readAloud || !pos) return null

  return (
    <button
      onMouseEnter={() => clearTimeout(hideTimer.current)}
      onMouseLeave={() => { hideTimer.current = setTimeout(() => setPos(null), 200) }}
      onClick={speak}
      aria-label="Read this text aloud"
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9998 }}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow-md transition-colors hover:bg-accent-hover',
        speaking && 'ring-2 ring-accent ring-offset-1'
      )}
    >
      <Volume2 className={cn('h-3.5 w-3.5', speaking && 'animate-pulse')} />
    </button>
  )
}
