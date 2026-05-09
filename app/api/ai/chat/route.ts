import { NextRequest, NextResponse } from 'next/server'

// Mock responses keyed to common question patterns.
// Replace body of generateReply() with an Anthropic SDK call when ready:
//   import Anthropic from '@anthropic-ai/sdk'
//   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
//   const msg = await client.messages.create({ ... })

const KEYWORD_RESPONSES: [RegExp, string][] = [
  [/housing|apartment|living|rent|supported/i,
   "Great question about housing! There are several options available for autistic adults — from fully independent living to supported housing where staff are available to help. A Housing Navigator at Autism Edmonton can walk you through what's available in Alberta. Would you like me to explain any specific option?"],

  [/job|interview|work|employment|career|hire|accommodation/i,
   "Preparing for work is something many people find challenging, and that's completely okay. Some helpful steps: practise answering common interview questions out loud, prepare a short description of your strengths, and know that you can ask for workplace accommodations — things like a quiet workspace, written instructions, or flexible break times. Would you like more detail on any of these?"],

  [/anxiety|stress|overwhelm|nervous|worry|calm/i,
   "Feeling anxious or overwhelmed is very common, and there are gentle strategies that can help. Things like box breathing, stepping outside for a moment, having a sensory kit nearby, or using a calm-down app can make a real difference. It also helps to identify your triggers so you can plan ahead. Is there a specific situation you'd like help with?"],

  [/friend|relationship|social|conversation|boundary/i,
   "Building and keeping relationships takes practice for everyone. Clear communication, setting boundaries kindly, and taking breaks when social situations feel like too much are all healthy strategies. It's also okay to connect with people who share your interests — those friendships often feel more natural. What would you like to know more about?"],

  [/identity|autistic|autism|self|who am i/i,
   "Understanding your autistic identity is a journey, and it can be really positive. Many autistic people find that learning about neurodiversity helps them understand their own strengths, communication style, and needs. Self-advocacy — knowing what you need and asking for it — is a powerful skill. Would you like resources on this?"],

  [/mental health|therapist|counsellor|support|help/i,
   "Mental health support is important and available. You can ask your doctor for a referral to a therapist who works with autistic adults. Autism Edmonton also has staff who can help connect you with the right support. Remember, asking for help is a strength, not a weakness."],

  [/hello|hi|hey|good morning|good afternoon/i,
   "Hello! I'm glad you're here. I can help you understand topics from the videos, find resources, or answer questions about housing, employment, mental health, relationships, and identity. What would you like to explore?"],
]

function generateReply(message: string, context?: string): string {
  for (const [pattern, reply] of KEYWORD_RESPONSES) {
    if (pattern.test(message)) return reply
  }

  if (context) {
    return `That's a thoughtful question related to "${context}". While I don't have a specific answer for that, I'd encourage you to explore the full video transcript and related resources. You can also reach out to Autism Edmonton staff directly — they're happy to help.`
  }

  return "Thank you for your question. I'm here to help with topics covered on this platform — housing, employment, mental health, relationships, and identity. Could you tell me a bit more about what you'd like to know?"
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json() as { message: string; context?: string }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Simulate a short delay (remove when using real AI)
    await new Promise((r) => setTimeout(r, 600))

    const reply = generateReply(message.trim(), context)
    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
