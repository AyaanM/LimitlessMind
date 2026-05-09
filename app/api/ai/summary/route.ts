import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock summaries keyed by category.
// To use real AI: pass transcript text to Anthropic API and return structured summary.
const MOCK_SUMMARIES: Record<string, { summary: string; keyPoints: string[] }> = {
  'Housing': {
    summary: 'This video provides a clear overview of housing options available to autistic adults in Alberta, including what to expect from supported living arrangements and how to access housing support programs.',
    keyPoints: [
      'Supported living means staff are available to help with daily tasks, but you still have your own space.',
      'Independent living is possible with the right planning and community supports.',
      'Alberta has programs that can help cover housing costs — a navigator can walk you through the application.',
      'It\'s okay to ask questions and take your time finding the right fit.',
    ],
  },
  'Employment': {
    summary: 'This video walks through practical strategies for entering or returning to the workforce as an autistic person, including your rights, how to request accommodations, and how to prepare for interviews.',
    keyPoints: [
      'You have the right to request reasonable workplace accommodations.',
      'Preparation is the key to interview success — practice answers out loud.',
      'Disclosing your autism is a personal choice; you don\'t have to share more than you\'re comfortable with.',
      'Job coaches and employment specialists can support you through the process.',
    ],
  },
  'Mental Health': {
    summary: 'This video explores the relationship between autism and mental health, covering common challenges like anxiety and burnout, and introducing gentle strategies for daily self-regulation.',
    keyPoints: [
      'Anxiety is very common among autistic people and is treatable.',
      'Burnout can happen when we push ourselves too hard — rest is important.',
      'Sensory tools, breathing exercises, and routines can help regulate your nervous system.',
      'Reaching out for professional support is a sign of strength.',
    ],
  },
  'Relationships': {
    summary: 'This video provides accessible guidance on building and maintaining healthy relationships, including friendships, family connections, and professional relationships.',
    keyPoints: [
      'Boundaries are healthy and important in all relationships.',
      'Clear, direct communication helps avoid misunderstandings.',
      'It\'s okay to have a smaller social circle — quality matters more than quantity.',
      'Shared interests are a great foundation for friendships.',
    ],
  },
  'Identity': {
    summary: 'This video explores what it means to be autistic in a positive, affirming way — covering neurodiversity, self-advocacy, and how to build a confident sense of self.',
    keyPoints: [
      'Being autistic is a different way of experiencing the world, not a deficit.',
      'Self-advocacy means knowing your needs and asking for what helps you.',
      'Many autistic people find community and connection in neurodiversity spaces.',
      'Your identity is yours — you get to decide how you talk about it.',
    ],
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')

  if (!videoId) {
    return NextResponse.json({ error: 'videoId required' }, { status: 400 })
  }

  try {
    const supabase = createClient()

    const { data: video } = await supabase
      .from('videos')
      .select('category')
      .eq('id', videoId)
      .single()

    const v = video as { category: string } | null
    const category = v?.category ?? 'Housing'
    return NextResponse.json(MOCK_SUMMARIES[category] ?? MOCK_SUMMARIES['Housing'])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
