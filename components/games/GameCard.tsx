import type { Game } from '@/types/database'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: Game
  isCompleted?: boolean
  isPremiumUser?: boolean
  onPlay?: (game: Game) => void
}

const GAME_ICONS: Record<string, string> = {
  'Emotion Match':           '😊',
  'Calm Breathing':          '🌬️',
  'Memory Cards':            '🃏',
  'Job Interview Practice':  '💼',
  'Daily Routine Builder':   '📅',
  'Communication Choices':   '💬',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   'bg-sage-light text-sage',
  medium: 'bg-accent-light text-accent',
  hard:   'bg-premium-light text-premium',
}

export function GameCard({ game, isCompleted, isPremiumUser, onPlay }: GameCardProps) {
  const isLocked = game.is_premium && !isPremiumUser
  const icon = GAME_ICONS[game.title] ?? '🎮'

  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface text-3xl">
          <span aria-hidden="true">{icon}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SubscriptionBadge isPremium={game.is_premium} />
          {isCompleted && (
            <span className="rounded bg-sage-light px-2 py-0.5 text-xs font-medium text-sage">
              ✓ Done
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex-1">
        <h3 className="font-semibold text-foreground">{game.title}</h3>
        {game.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{game.description}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={cn(
          'rounded px-2 py-0.5 text-xs font-medium capitalize',
          DIFFICULTY_COLORS[game.difficulty] ?? 'bg-surface text-muted-foreground'
        )}>
          {game.difficulty}
        </span>

        <button
          onClick={() => onPlay?.(game)}
          disabled={isLocked}
          aria-label={isLocked ? `${game.title} — Premium required` : `Play ${game.title}`}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            isLocked
              ? 'bg-surface text-muted-foreground cursor-not-allowed'
              : 'bg-accent text-white hover:bg-accent-hover'
          )}
        >
          {isLocked ? '🔒 Premium' : isCompleted ? 'Play again' : 'Play'}
        </button>
      </div>
    </article>
  )
}
