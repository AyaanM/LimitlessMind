// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DB = any

export async function getProfile(supabase: DB, userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function getSubscription(supabase: DB, userId: string) {
  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).single()
  return data
}

export async function getVideos(supabase: DB) {
  const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function getWatchProgress(supabase: DB, userId: string) {
  const { data } = await supabase.from('watch_progress').select('*').eq('user_id', userId)
  return data ?? []
}

export async function getSavedVideos(supabase: DB, userId: string) {
  const { data } = await supabase.from('saved_videos').select('video_id').eq('user_id', userId)
  return data ?? []
}

export async function getGames(supabase: DB) {
  const { data } = await supabase.from('games').select('*').order('is_premium')
  return data ?? []
}

export async function getGameProgress(supabase: DB, userId: string) {
  const { data } = await supabase.from('game_progress').select('*').eq('user_id', userId)
  return data ?? []
}

export async function getContactCards(supabase: DB) {
  const { data } = await supabase.from('contact_cards').select('*').eq('is_visible', true).order('display_order')
  return data ?? []
}

export function isPremiumActive(sub: { plan: string; status: string } | null): boolean {
  return sub?.plan === 'premium' && sub?.status === 'active'
}
