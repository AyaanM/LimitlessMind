'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AIFloatingChatProps {
  isPremium: boolean
}

export function AIFloatingChat({ isPremium }: AIFloatingChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your learning assistant. Ask me anything about autism, the topics on this platform, or how to navigate your learning journey.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

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

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'I had trouble responding. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="fixed bottom-6 right-[84px] z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="AI learning assistant"
          className="w-80 rounded-2xl border border-border bg-card shadow-card-hover animate-fade-in overflow-hidden flex flex-col"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 shrink-0">
            <Bot className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground flex-1">AI Learning Assistant</span>
            <span className="rounded-full bg-sage-light px-2 py-0.5 text-xs text-sage font-medium">Premium</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="ml-1 rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!isPremium ? (
            /* Upgrade prompt */
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center flex-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-light">
                <Bot className="h-7 w-7 text-accent" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Premium feature</p>
                <p className="text-sm text-muted-foreground">Upgrade to Premium to chat with the AI learning assistant.</p>
              </div>
              <Link
                href="/subscription"
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Upgrade to Premium
              </Link>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-light">
                        <Bot className="h-3.5 w-3.5 text-accent" />
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[80%] rounded-xl px-3 py-2.5 text-sm leading-relaxed',
                      msg.role === 'assistant' ? 'bg-surface text-foreground' : 'bg-accent text-white'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 justify-start">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-light">
                      <Bot className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div className="rounded-xl bg-surface px-3 py-2.5">
                      <LoadingSpinner size="sm" label="Thinking…" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 shrink-0">
                <div className="flex gap-2">
                  <label htmlFor="float-chat-input" className="sr-only">Type your message</label>
                  <textarea
                    id="float-chat-input"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything…"
                    rows={1}
                    className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    aria-label="Send message"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">Enter to send · Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="AI learning assistant"
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-white shadow-card-hover transition-all hover:bg-sage-hover hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
      >
        <Bot className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
