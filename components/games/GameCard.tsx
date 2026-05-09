import { Lock, Play, CheckCircle } from 'lucide-react'
import type { Game } from '@/types/database'
import { SubscriptionBadge } from '@/components/shared/SubscriptionBadge'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: Game
  isCompleted?: boolean
  isPremiumUser?: boolean
  onPlay?: (game: Game) => void
}

const GAME_META: Record<string, { icon: string; gradient: string }> = {
  'Emotion Match':          { icon: '😊', gradient: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40' },
  'Calm Breathing':         { icon: '🌬️', gradient: 'from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40' },
  'Memory Cards':           { icon: '🃏', gradient: 'from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40' },
  'Job Interview Practice': { icon: '💼', gradient: 'from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40' },
  'Daily Routine Builder':  { icon: '📅', gradient: 'from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40' },
  'Communication Choices':  { icon: '💬', gradient: 'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40' },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   'bg-sage-light text-sage',
  medium: 'bg-accent-light text-accent',
  hard:   'bg-premium-light text-premium',
}

export function GameCard({ game, isCompleted, isPremiumUser, onPlay }: GameCardProps) {
  const isLocked = game.is_premium && !isPremiumUser
  const meta = GAME_META[game.title] ?? { icon: '🎮', gradient: 'from-slate-100 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/40' }

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {game.thumbnail_url ? (
          <img
            src={game.thumbnail_url}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br', meta.gradient)}>
            <span className="text-5xl select-none" aria-hidden="true">{meta.icon}</span>
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-foreground/40 backdrop-blur-[2px] text-white">
            <Lock className="h-7 w-7" aria-hidden="true" />
            <span className="text-xs font-semibold">Premium</span>
          </div>
        )}

        {isCompleted && !isLocked && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sage px-2 py-0.5 text-xs font-semibold text-white shadow">
              <CheckCircle className="h-3 w-3" aria-hidden="true" /> Done
            </span>
          </div>
        )}

        <div className="absolute bottom-2 right-2">
          <SubscriptionBadge isPremium={game.is_premium} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold text-foreground leading-snug group-hover:text-accent transition-colors">
            {game.title}
          </h3>
          {game.description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {game.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 mt-auto">
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
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              isLocked
                ? 'bg-surface text-muted-foreground cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-hover'
            )}
          >
            {!isLocked && <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            {isLocked ? 'Premium' : isCompleted ? 'Play again' : 'Play'}
          </button>
        </div>
      </div>
    </article>
  )
}
