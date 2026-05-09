import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getVimeoThumbnail(vimeoId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizeMap = { small: '295x166', medium: '640x360', large: '1280x720' }
  return `https://vumbnail.com/${vimeoId}_${sizeMap[size]}.jpg`
}

export function getProgressPercent(progressSeconds: number, durationSeconds: number | null): number {
  if (!durationSeconds || durationSeconds === 0) return 0
  return Math.min(100, Math.round((progressSeconds / durationSeconds) * 100))
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}
