import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Video } from '@/types/database'

interface SearchResult {
  video: Video
  reason: string
  matchScore: number
}

function buildReason(video: Video, query: string): string {
  const q = query.toLowerCase()
  if (video.category.toLowerCase().includes(q)) {
    return `Matches category: ${video.category}`
  }
  if (video.title.toLowerCase().includes(q)) {
    return `Title contains your search term`
  }
  if (video.speaker?.toLowerCase().includes(q)) {
    return `Presented by ${video.speaker}`
  }
  if (video.tags.some((t) => t.toLowerCase().includes(q))) {
    return `Tagged with related topics`
  }
  return `Related to: ${video.category}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const supabase = createClient()

    // Keyword search across title, description, category, speaker, tags
    // Structure is ready for pgvector upgrade: replace with embedding similarity search
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .or([
        `title.ilike.%${query}%`,
        `description.ilike.%${query}%`,
        `category.ilike.%${query}%`,
        `speaker.ilike.%${query}%`,
        `tags.cs.{${query}}`,
      ].join(','))
      .limit(12)

    if (error) throw error

    // Also search transcript segments
    const { data: segments } = await supabase
      .from('video_transcript_segments')
      .select('video_id, text')
      .ilike('text', `%${query}%`)
      .limit(10)

    const segs = (segments ?? []) as { video_id: string; text: string }[]
    const transcriptVideoIds = new Set(segs.map((s) => s.video_id))

    // Merge transcript matches
    const transcriptVideoIdList = Array.from(transcriptVideoIds).filter(
      (id) => !(videos as Video[] | null)?.find((v) => v.id === id)
    )

    let transcriptVideos: Video[] = []
    if (transcriptVideoIdList.length > 0) {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .in('id', transcriptVideoIdList)
      transcriptVideos = (data ?? []) as Video[]
    }

    const allVideos: Video[] = [...((videos ?? []) as Video[]), ...transcriptVideos]

    // Score results
    const results: SearchResult[] = allVideos
      .map((video) => {
        const q = query.toLowerCase()
        let score = 0
        if (video.title.toLowerCase().includes(q)) score += 3
        if (video.category.toLowerCase().includes(q)) score += 2
        if (video.description?.toLowerCase().includes(q)) score += 1
        if (video.tags.some((t) => t.toLowerCase().includes(q))) score += 1
        if (transcriptVideoIds.has(video.id)) score += 2
        return {
          video,
          reason: buildReason(video, query),
          matchScore: score,
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
