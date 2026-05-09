'use client'

import { useEffect, useRef, useState } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface VimeoPlayerProps {
  vimeoId: string
  title: string
  startAt?: number
  onProgress?: (seconds: number) => void
}

export function VimeoPlayer({ vimeoId, title, startAt = 0, onProgress }: VimeoPlayerProps) {
  const [loaded, setLoaded] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const src = `https://player.vimeo.com/video/${vimeoId}?autoplay=0&muted=0&dnt=1&title=0&byline=0&portrait=0${startAt > 0 ? `#t=${startAt}s` : ''}`

  useEffect(() => {
    if (!onProgress) return

    // Poll progress every 5 seconds via postMessage from Vimeo player
    function handleMessage(event: MessageEvent) {
      if (event.origin !== 'https://player.vimeo.com') return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data.event === 'timeupdate' && typeof data.data?.seconds === 'number') {
          onProgress?.(Math.floor(data.data.seconds))
        }
      } catch {
        // ignore malformed messages
      }
    }

    window.addEventListener('message', handleMessage)

    // Request timeupdates from the Vimeo player
    const requestUpdates = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }),
        'https://player.vimeo.com'
      )
    }

    intervalRef.current = setInterval(requestUpdates, 1000)

    return () => {
      window.removeEventListener('message', handleMessage)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [vimeoId, onProgress])

  return (
    <div className="relative overflow-hidden rounded-xl bg-foreground/5">
      <div className="aspect-video">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface">
            <LoadingSpinner label="Loading video player…" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className="h-full w-full rounded-xl"
        />
      </div>
    </div>
  )
}
