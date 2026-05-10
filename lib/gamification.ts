// XP earned per action
export const XP_REWARDS = {
  watch_video:      10,   // first time opening a video
  complete_video:   25,   // mark as complete
  play_game:        15,   // open and play a game
  complete_game:    50,   // finish a game
  earn_certificate: 100,  // earn any certificate
  daily_streak:      5,   // each consecutive day
  streak_7:          50,  // 7-day streak bonus
  streak_30:        200,  // 30-day streak bonus
} as const

export type XPAction = keyof typeof XP_REWARDS

// Level thresholds (XP needed to reach that level)
export const LEVELS = [
  { level: 1,  min: 0,     title: 'Curious Learner' },
  { level: 2,  min: 100,   title: 'Engaged Explorer' },
  { level: 3,  min: 250,   title: 'Active Learner' },
  { level: 4,  min: 500,   title: 'Dedicated Learner' },
  { level: 5,  min: 1000,  title: 'Knowledge Seeker' },
  { level: 6,  min: 2000,  title: 'Community Champion' },
  { level: 7,  min: 3500,  title: 'Learning Leader' },
  { level: 8,  min: 6000,  title: 'Expert Learner' },
  { level: 9,  min: 10000, title: 'Master Learner' },
  { level: 10, min: 15000, title: 'Autism Edmonton Champion' },
]

export function getLevelInfo(xp: number) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) {
      current = LEVELS[i]
      next = LEVELS[i + 1] ?? null
      break
    }
  }
  const progressToNext = next
    ? Math.round(((xp - current.min) / (next.min - current.min)) * 100)
    : 100
  return { current, next, progressToNext, xp }
}

// Badge definitions
export const BADGES: { id: string; label: string; description: string; icon: string }[] = [
  { id: 'first_video',      label: 'First Step',        description: 'Watched your first video',            icon: '▶️' },
  { id: 'first_game',       label: 'Game On',           description: 'Played your first game',              icon: '🎮' },
  { id: 'streak_3',         label: '3-Day Streak',      description: 'Learned 3 days in a row',             icon: '🔥' },
  { id: 'streak_7',         label: 'Week Warrior',      description: 'Learned 7 days in a row',             icon: '🌟' },
  { id: 'streak_30',        label: 'Month Master',      description: 'Learned 30 days in a row',            icon: '🏆' },
  { id: 'videos_5',         label: 'Binge Learner',     description: 'Completed 5 videos',                  icon: '📚' },
  { id: 'videos_10',        label: 'Dedicated',         description: 'Completed 10 videos',                 icon: '🎓' },
  { id: 'games_5',          label: 'Game Champion',     description: 'Completed 5 games',                   icon: '🏅' },
  { id: 'silver_cert',      label: 'Silver Scholar',    description: 'Earned the Silver certificate',       icon: '🥈' },
  { id: 'level_5',          label: 'Knowledge Seeker',  description: 'Reached Level 5',                     icon: '⭐' },
  { id: 'level_10',         label: 'AE Champion',       description: 'Reached Level 10',                    icon: '👑' },
]

export function checkNewBadges(
  existing: string[],
  stats: {
    videosCompleted: number
    gamesCompleted: number
    streakDays: number
    level: number
    hasSilverCert: boolean
  }
): string[] {
  const earned = new Set(existing)
  const newOnes: string[] = []

  function award(id: string) {
    if (!earned.has(id)) { earned.add(id); newOnes.push(id) }
  }

  if (stats.videosCompleted >= 1) award('first_video')
  if (stats.gamesCompleted >= 1)  award('first_game')
  if (stats.streakDays >= 3)      award('streak_3')
  if (stats.streakDays >= 7)      award('streak_7')
  if (stats.streakDays >= 30)     award('streak_30')
  if (stats.videosCompleted >= 5)  award('videos_5')
  if (stats.videosCompleted >= 10) award('videos_10')
  if (stats.gamesCompleted >= 5)   award('games_5')
  if (stats.hasSilverCert)         award('silver_cert')
  if (stats.level >= 5)            award('level_5')
  if (stats.level >= 10)           award('level_10')

  return newOnes
}
