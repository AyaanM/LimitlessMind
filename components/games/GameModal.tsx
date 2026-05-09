'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Game } from '@/types/database'

interface GameModalProps {
  game: Game | null
  onClose: () => void
  onComplete?: (gameId: string, score: number) => void
}

// ─── Emotion Match ────────────────────────────────────────────────────────────
const EMOTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😨', label: 'Scared' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤗', label: 'Excited' },
]

function EmotionMatchGame({ onScore }: { onScore: (score: number) => void }) {
  const [pairs] = useState(() => [...EMOTIONS, ...EMOTIONS].map((e, i) => ({ ...e, id: i, matched: false, flipped: false })))
  const [cards, setCards] = useState(pairs.sort(() => Math.random() - 0.5))
  const [selected, setSelected] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    if (matches === EMOTIONS.length) onScore(Math.max(0, 100 - moves * 2))
  }, [matches, moves, onScore])

  function flip(idx: number) {
    if (selected.length === 2 || cards[idx].matched || cards[idx].flipped) return
    const next = [...cards]
    next[idx] = { ...next[idx], flipped: true }
    setCards(next)

    if (selected.length === 1) {
      setMoves((m) => m + 1)
      const [firstIdx] = selected
      if (next[firstIdx].label === next[idx].label) {
        next[firstIdx] = { ...next[firstIdx], matched: true }
        next[idx] = { ...next[idx], matched: true }
        setCards([...next])
        setMatches((m) => m + 1)
        setSelected([])
      } else {
        setSelected([firstIdx, idx])
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) =>
            i === firstIdx || i === idx ? { ...c, flipped: false } : c
          ))
          setSelected([])
        }, 1200)
      }
    } else {
      setSelected([idx])
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Match the emotion cards. Take your time — there is no rush.</p>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => flip(i)}
            disabled={card.matched}
            aria-label={card.flipped || card.matched ? card.label : 'Hidden card'}
            className={`aspect-square rounded-xl text-3xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${card.flipped || card.matched ? 'bg-accent-light border-2 border-accent' : 'bg-surface border border-border'}
              ${card.matched ? 'opacity-60' : 'hover:bg-surface/80'}`}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Moves: {moves} · Matches: {matches} of {EMOTIONS.length}</p>
    </div>
  )
}

// ─── Calm Breathing ────────────────────────────────────────────────────────────
function CalmBreathingGame({ onScore }: { onScore: (score: number) => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'rest'>('rest')
  const [count, setCount] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const timings: Record<typeof phase, number> = { in: 4, hold: 4, out: 6, rest: 2 }
    const next: Record<typeof phase, typeof phase> = { in: 'hold', hold: 'out', out: 'rest', rest: 'in' }

    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= timings[phase] - 1) {
          const nextPhase = next[phase]
          setPhase(nextPhase)
          if (nextPhase === 'in') setCycles((cy) => cy + 1)
          return 0
        }
        return c + 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running, phase])

  useEffect(() => {
    if (cycles >= 5) {
      setRunning(false)
      onScore(100)
    }
  }, [cycles, onScore])

  const phaseText = { in: 'Breathe in', hold: 'Hold', out: 'Breathe out', rest: 'Rest' }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 transition-all duration-1000
        ${phase === 'in' ? 'scale-125 border-sage bg-sage-light' : ''}
        ${phase === 'hold' ? 'scale-125 border-accent bg-accent-light' : ''}
        ${phase === 'out' ? 'scale-100 border-muted-foreground/30 bg-surface' : ''}
        ${phase === 'rest' ? 'scale-100 border-border bg-card' : ''}
      `}>
        <div className="text-center">
          <p className="text-2xl">{phase === 'rest' && !running ? '🌬️' : count + 1}</p>
        </div>
      </div>
      <p className="text-xl font-semibold text-foreground">{running ? phaseText[phase] : 'Ready when you are'}</p>
      <p className="text-sm text-muted-foreground">Cycle {cycles} of 5</p>
      {!running ? (
        <button
          onClick={() => { setRunning(true); setPhase('in'); setCount(0) }}
          className="rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white hover:bg-sage-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          Start breathing exercise
        </button>
      ) : (
        <button
          onClick={() => setRunning(false)}
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Pause
        </button>
      )}
    </div>
  )
}

// ─── Memory Cards ─────────────────────────────────────────────────────────────
const SYMBOLS = ['🏠', '💼', '🌟', '🤝', '🧠', '🎨']

function MemoryGame({ onScore }: { onScore: (score: number) => void }) {
  const [cards, setCards] = useState(() =>
    [...SYMBOLS, ...SYMBOLS]
      .map((s, i) => ({ symbol: s, id: i, matched: false, flipped: false }))
      .sort(() => Math.random() - 0.5)
  )
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const matches = cards.filter((c) => c.matched).length / 2

  useEffect(() => {
    if (matches === SYMBOLS.length) onScore(Math.max(0, 120 - moves * 3))
  }, [matches, moves, onScore])

  function flip(idx: number) {
    if (selected.length === 2 || cards[idx].matched || cards[idx].flipped) return
    const next = [...cards]
    next[idx] = { ...next[idx], flipped: true }
    setCards(next)

    if (selected.length === 1) {
      setMoves((m) => m + 1)
      const [fi] = selected
      if (next[fi].symbol === next[idx].symbol) {
        next[fi] = { ...next[fi], matched: true }
        next[idx] = { ...next[idx], matched: true }
        setCards([...next])
        setSelected([])
      } else {
        setSelected([fi, idx])
        setTimeout(() => {
          setCards((p) => p.map((c, i) => i === fi || i === idx ? { ...c, flipped: false } : c))
          setSelected([])
        }, 1100)
      }
    } else {
      setSelected([idx])
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Flip cards to find matching pairs. Take your time.</p>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <button key={i} onClick={() => flip(i)} disabled={card.matched}
            aria-label={card.flipped || card.matched ? card.symbol : 'Hidden'}
            className={`aspect-square rounded-xl text-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${card.flipped || card.matched ? 'bg-accent-light border-2 border-accent' : 'bg-surface border border-border hover:bg-muted'}
              ${card.matched ? 'opacity-50' : ''}`}
          >
            {card.flipped || card.matched ? card.symbol : '·'}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Moves: {moves}</p>
    </div>
  )
}

// ─── Job Interview Practice ────────────────────────────────────────────────────
const INTERVIEW_QUESTIONS = [
  { q: 'Tell me about yourself.', hint: 'Share your name, a strength, and something you enjoy doing.' },
  { q: 'What are you good at?', hint: 'Think about skills you use at home, school, or work.' },
  { q: 'Why do you want this job?', hint: 'What interests you about this role or company?' },
  { q: 'How do you handle a stressful situation?', hint: 'Describe a strategy that helps you stay calm.' },
]

function JobInterviewGame({ onScore }: { onScore: (score: number) => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(INTERVIEW_QUESTIONS.length).fill(''))

  function handleNext() {
    if (step < INTERVIEW_QUESTIONS.length - 1) setStep((s) => s + 1)
    else onScore(100)
  }

  const q = INTERVIEW_QUESTIONS[step]
  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">Question {step + 1} of {INTERVIEW_QUESTIONS.length}</p>
      <div className="rounded-xl bg-accent-light p-4">
        <p className="font-semibold text-foreground">{q.q}</p>
        <p className="mt-1 text-sm text-muted-foreground">{q.hint}</p>
      </div>
      <div>
        <label htmlFor={`answer-${step}`} className="mb-1 block text-sm font-medium text-foreground">Your answer</label>
        <textarea
          id={`answer-${step}`}
          value={answers[step]}
          onChange={(e) => {
            const next = [...answers]
            next[step] = e.target.value
            setAnswers(next)
          }}
          rows={4}
          placeholder="Write your answer here…"
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <button
        onClick={handleNext}
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {step < INTERVIEW_QUESTIONS.length - 1 ? 'Next question' : 'Finish practice'}
      </button>
    </div>
  )
}

// ─── Daily Routine Builder ─────────────────────────────────────────────────────
const ACTIVITIES = ['Wake up', 'Breakfast', 'Get dressed', 'Brush teeth', 'Exercise', 'Work / School', 'Lunch', 'Rest', 'Hobby time', 'Dinner', 'Wind down', 'Bedtime']

function DailyRoutineGame({ onScore }: { onScore: (score: number) => void }) {
  const [routine, setRoutine] = useState<string[]>([])
  const add = (a: string) => setRoutine((r) => r.includes(a) ? r.filter((x) => x !== a) : [...r, a])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Select activities to build your ideal daily routine. You can choose as many as you like.</p>
      <div className="flex flex-wrap gap-2">
        {ACTIVITIES.map((a) => (
          <button key={a} onClick={() => add(a)}
            aria-pressed={routine.includes(a)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${routine.includes(a) ? 'bg-accent text-white' : 'bg-surface border border-border text-foreground hover:border-accent/40'}`}
          >
            {a}
          </button>
        ))}
      </div>
      {routine.length > 0 && (
        <div className="rounded-xl bg-surface p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Your routine</p>
          <ol className="space-y-1">
            {routine.map((a, i) => (
              <li key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
          <button
            onClick={() => onScore(100)}
            className="mt-2 rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            Save routine
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Communication Choices ─────────────────────────────────────────────────────
const SCENARIOS = [
  {
    situation: 'Your coworker is talking very loudly and it is bothering you.',
    options: [
      { text: 'Say nothing and hope it stops', outcome: 'It might continue. You feel frustrated.', good: false },
      { text: 'Politely say: "Excuse me, would you mind speaking a bit quieter?"', outcome: 'Most people appreciate being asked kindly. This is a great choice!', good: true },
      { text: 'Leave without saying anything', outcome: 'The problem is not solved, but you gave yourself space.', good: false },
    ],
  },
  {
    situation: 'You need help understanding a task at work but feel unsure how to ask.',
    options: [
      { text: 'Guess and hope for the best', outcome: 'This can lead to mistakes. Asking is better.', good: false },
      { text: 'Send a message: "Could you clarify step 3 for me?"', outcome: 'Clear and professional. Great choice!', good: true },
      { text: 'Ask a trusted coworker for help', outcome: 'This works well if your manager is unavailable.', good: true },
    ],
  },
]

function CommunicationGame({ onScore }: { onScore: (score: number) => void }) {
  const [step, setStep] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const s = SCENARIOS[step]

  function pick(i: number) { setChosen(i) }
  function next() {
    setChosen(null)
    if (step < SCENARIOS.length - 1) setStep((s) => s + 1)
    else onScore(100)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Situation {step + 1} of {SCENARIOS.length}</p>
      <div className="rounded-xl bg-accent-light p-4">
        <p className="font-semibold text-foreground">{s.situation}</p>
      </div>
      <div className="space-y-2">
        {s.options.map((opt, i) => (
          <button key={i} onClick={() => pick(i)}
            className={`w-full rounded-xl border p-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${chosen === i ? (opt.good ? 'border-sage bg-sage-light' : 'border-destructive/30 bg-destructive/5') : 'border-border bg-card hover:bg-surface'}`}
          >
            {opt.text}
            {chosen === i && (
              <p className={`mt-2 text-xs ${opt.good ? 'text-sage' : 'text-muted-foreground'}`}>{opt.outcome}</p>
            )}
          </button>
        ))}
      </div>
      {chosen !== null && (
        <button onClick={next} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          {step < SCENARIOS.length - 1 ? 'Next situation' : 'Finish'}
        </button>
      )}
    </div>
  )
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
export function GameModal({ game, onClose, onComplete }: GameModalProps) {
  const [finished, setFinished] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  if (!game) return null

  function handleScore(score: number) {
    setFinalScore(score)
    setFinished(true)
    onComplete?.(game!.id, score)
  }

  const gameComponents: Record<string, JSX.Element> = {
    'Emotion Match':           <EmotionMatchGame onScore={handleScore} />,
    'Calm Breathing':          <CalmBreathingGame onScore={handleScore} />,
    'Memory Cards':            <MemoryGame onScore={handleScore} />,
    'Job Interview Practice':  <JobInterviewGame onScore={handleScore} />,
    'Daily Routine Builder':   <DailyRoutineGame onScore={handleScore} />,
    'Communication Choices':   <CommunicationGame onScore={handleScore} />,
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-card shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{game.title}</h2>
          <button
            onClick={onClose}
            aria-label="Close game"
            className="rounded-lg p-2 text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          {finished ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-5xl" aria-hidden="true">🎉</div>
              <h3 className="text-xl font-semibold text-foreground">Well done!</h3>
              <p className="text-muted-foreground">You finished {game.title}.</p>
              {finalScore > 0 && (
                <div className="rounded-xl bg-sage-light px-6 py-3 text-lg font-bold text-sage">
                  Score: {finalScore}
                </div>
              )}
              <button
                onClick={onClose}
                className="mt-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Close
              </button>
            </div>
          ) : (
            gameComponents[game.title] ?? (
              <p className="text-muted-foreground">This game will be available soon.</p>
            )
          )}
        </div>
      </div>
    </div>
  )
}
