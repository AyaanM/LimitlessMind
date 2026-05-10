import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { XP_REWARDS, getLevelInfo, checkNewBadges, type XPAction } from '@/lib/gamification'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await request.json() as { action: XPAction }
    if (!action || !(action in XP_REWARDS)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level, streak_days, last_active_date, badges, total_videos_completed, total_games_completed')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const p = profile as {
      xp: number; level: number; streak_days: number; last_active_date: string | null
      badges: string[]; total_videos_completed: number; total_games_completed: number
    }

    // Streak logic
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let streakDays = p.streak_days
    let extraXP = 0

    if (p.last_active_date !== today) {
      if (p.last_active_date === yesterday) {
        streakDays += 1
      } else if (p.last_active_date !== today) {
        streakDays = 1
      }
      extraXP += XP_REWARDS.daily_streak
      if (streakDays === 7)  extraXP += XP_REWARDS.streak_7
      if (streakDays === 30) extraXP += XP_REWARDS.streak_30
    }

    const gained = XP_REWARDS[action] + extraXP
    const newXP = p.xp + gained
    const { current: prevLevel } = getLevelInfo(p.xp)
    const { current: newLevel } = getLevelInfo(newXP)
    const leveledUp = newLevel.level > prevLevel.level

    // Update completion counts
    const totalVids = p.total_videos_completed + (action === 'complete_video' ? 1 : 0)
    const totalGames = p.total_games_completed + (action === 'complete_game' ? 1 : 0)

    // Check for new badges
    const { data: certs } = await (supabase as any)
      .from('certificates')
      .select('title')
      .eq('user_id', user.id)
    const hasSilverCert = ((certs ?? []) as { title: string }[]).some((c) => c.title.includes('Silver Autism Edmonton'))

    const newBadges = checkNewBadges(p.badges ?? [], {
      videosCompleted: totalVids,
      gamesCompleted: totalGames,
      streakDays,
      level: newLevel.level,
      hasSilverCert,
    })
    const allBadges = [...(p.badges ?? []), ...newBadges]

    await (supabase as any).from('profiles').update({
      xp: newXP,
      level: newLevel.level,
      streak_days: streakDays,
      last_active_date: today,
      badges: allBadges,
      total_videos_completed: totalVids,
      total_games_completed: totalGames,
    }).eq('id', user.id)

    return NextResponse.json({
      xpGained: gained,
      newXP,
      newLevel: newLevel.level,
      leveledUp,
      levelTitle: newLevel.title,
      newBadges,
      streakDays,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
