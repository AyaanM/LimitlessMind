import { getLevelInfo, BADGES } from '@/lib/gamification'
import { Flame, Star, Trophy } from 'lucide-react'

interface GamificationCardProps {
  xp: number
  level: number
  streakDays: number
  badges: string[]
  displayName: string
}

export function GamificationCard({ xp, level, streakDays, badges, displayName }: GamificationCardProps) {
  const { current, next, progressToNext } = getLevelInfo(xp)
  const earnedBadges = BADGES.filter((b) => badges.includes(b.id))

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-accent to-accent-hover px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Your Progress</p>
            <p className="text-lg font-bold text-white">{displayName}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5">
            <Star className="h-4 w-4 text-yellow-300" aria-hidden="true" />
            <span className="text-sm font-bold text-white">Level {level}</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* XP progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">{current.title}</span>
            <span className="text-muted-foreground">{xp} XP</span>
          </div>
          <div className="h-3 rounded-full bg-surface overflow-hidden border border-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${progressToNext}%` }}
              role="progressbar"
              aria-valuenow={progressToNext}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progressToNext}% progress to next level`}
            />
          </div>
          {next && (
            <p className="text-xs text-muted-foreground text-right">
              {next.min - xp} XP to Level {next.level} · {next.title}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-surface p-3 space-y-1">
            <Flame className="h-5 w-5 text-orange-400 mx-auto" aria-hidden="true" />
            <p className="text-lg font-bold text-foreground">{streakDays}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </div>
          <div className="rounded-xl bg-surface p-3 space-y-1">
            <Star className="h-5 w-5 text-accent mx-auto" aria-hidden="true" />
            <p className="text-lg font-bold text-foreground">{xp}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div className="rounded-xl bg-surface p-3 space-y-1">
            <Trophy className="h-5 w-5 text-sage mx-auto" aria-hidden="true" />
            <p className="text-lg font-bold text-foreground">{earnedBadges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* Earned badges */}
        {earnedBadges.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Earned Badges</p>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((b) => (
                <div
                  key={b.id}
                  title={b.description}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
                >
                  <span aria-hidden="true">{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next badges to unlock */}
        {earnedBadges.length < BADGES.length && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Next to Unlock</p>
            <div className="flex flex-wrap gap-2">
              {BADGES.filter((b) => !badges.includes(b.id)).slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  title={b.description}
                  className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground opacity-60"
                >
                  <span aria-hidden="true">{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
