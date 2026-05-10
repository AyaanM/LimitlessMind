import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystemPrompt(videoTitle?: string, videoDescription?: string): string {
  const base = `You are a calm, friendly learning assistant on the Autism Edmonton LMS — a platform for autistic adults, caregivers, educators, and employers. Your tone is warm, clear, and patient. Use short sentences and plain language. Never be dismissive. If you don't know something, say so honestly and suggest contacting Autism Edmonton staff directly.`

  if (videoTitle && videoDescription) {
    return `${base}

The user is watching a video titled "${videoTitle}". Here is the video description:
"""
${videoDescription}
"""

Answer the user's questions based on this description. If their question goes beyond what the description covers, answer from your general knowledge about autism, but make clear when you're doing so. Keep answers to 2–4 sentences unless more detail is genuinely needed.`
  }

  if (videoTitle) {
    return `${base}

The user is watching a video titled "${videoTitle}". Answer questions related to this topic. Keep answers to 2–4 sentences unless more detail is genuinely needed.`
  }

  return `${base} Keep answers to 2–4 sentences unless more detail is genuinely needed.`
}

// Keyword fallback used when ANTHROPIC_API_KEY is not set
const KEYWORD_RESPONSES: [RegExp, string][] = [
  [/housing|apartment|living|rent|supported/i,
   "There are several housing options for autistic adults — from fully independent living to supported housing with staff available to help. A Housing Navigator at Autism Edmonton can walk you through what's available in Alberta."],
  [/job|interview|work|employment|career|hire|accommodation/i,
   "Preparing for work can feel challenging, and that's okay. Practise answering common interview questions, prepare a short description of your strengths, and know that you can ask for workplace accommodations like a quiet space or written instructions."],
  [/anxiety|stress|overwhelm|nervous|worry|calm/i,
   "Feeling anxious is very common, and there are gentle strategies that help. Box breathing, stepping outside, or using a sensory kit can make a real difference. Identifying your triggers ahead of time also helps you plan."],
  [/friend|relationship|social|conversation|boundary/i,
   "Clear communication, setting boundaries kindly, and taking breaks when social situations feel like too much are all healthy strategies. Connecting with people who share your interests often makes friendships feel more natural."],
  [/identity|autistic|autism|self|who am i/i,
   "Understanding your autistic identity is a journey, and it can be really positive. Many autistic people find that learning about neurodiversity helps them understand their own strengths and needs. Self-advocacy is a powerful skill."],
  [/mental health|therapist|counsellor|support|help/i,
   "Mental health support is important and available. Ask your doctor for a referral to a therapist who works with autistic adults. Autism Edmonton also has staff who can connect you with the right support."],
  [/hello|hi|hey|good morning|good afternoon/i,
   "Hello! I can help you understand topics from this video or answer general questions about housing, employment, mental health, relationships, and identity. What would you like to explore?"],
]

function keywordFallback(message: string, videoTitle?: string, videoDescription?: string): string {
  // If we have a description, try to answer from it directly
  if (videoDescription) {
    const desc = videoDescription.toLowerCase()
    const q = message.toLowerCase()
    // Check if any keywords from the question appear in the description
    const words = q.split(/\s+/).filter((w) => w.length > 4)
    const matches = words.filter((w) => desc.includes(w))
    if (matches.length > 0) {
      return `Based on the video description: ${videoDescription} — Does that answer your question, or would you like more detail?`
    }
    return `This video covers: "${videoDescription}". For more specific details, watch the full video or contact Autism Edmonton staff directly.`
  }

  for (const [pattern, reply] of KEYWORD_RESPONSES) {
    if (pattern.test(message)) return reply
  }

  return videoTitle
    ? `That's a good question related to "${videoTitle}". I'd encourage you to explore the video and related resources, or reach out to Autism Edmonton staff — they're happy to help.`
    : "Thank you for your question. I'm here to help with topics on this platform — housing, employment, mental health, relationships, and identity. Could you tell me a bit more about what you'd like to know?"
}

export async function POST(request: NextRequest) {
  try {
    const { message, videoTitle, videoDescription } = await request.json() as {
      message: string
      videoTitle?: string
      videoDescription?: string
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      await new Promise((r) => setTimeout(r, 400))
      const reply = keywordFallback(message.trim(), videoTitle, videoDescription)
      return NextResponse.json({ reply })
    }

    const systemPrompt = buildSystemPrompt(videoTitle, videoDescription)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: message.trim() }],
    })

    const reply = (response.content[0] as { type: string; text: string }).text ?? 'I had trouble generating a response. Please try again.'
    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
