import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EmployeeDashboardClient } from './EmployeeDashboardClient'
import type { Video, ContactCard, Speaker, Collection, Playlist, ExternalOrganization } from '@/types/database'

export default async function EmployeeDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const profile = await getProfile(supabase, user.id)
  if (!profile?.is_employee) redirect('/home')

  const [
    { data: rawVideos },
    { data: rawContacts },
    { data: allProgress },
    { data: rawSpeakers },
    { data: rawCollections },
    { data: rawPlaylists },
    { data: rawOrgs },
  ] = await Promise.all([
    supabase.from('videos').select('*').order('created_at', { ascending: false }),
    supabase.from('contact_cards').select('*').order('display_order'),
    supabase.from('watch_progress').select('video_id, completed, user_id'),
    (supabase as any).from('speakers').select('*').order('name'),
    (supabase as any).from('collections').select('*').order('title'),
    (supabase as any).from('playlists').select('*').order('title'),
    (supabase as any).from('external_organizations').select('*').order('name'),
  ])

  const videos = (rawVideos ?? []) as Video[]
  const contacts = (rawContacts ?? []) as ContactCard[]
  const speakers = (rawSpeakers ?? []) as Speaker[]
  const collections = (rawCollections ?? []) as Collection[]
  const playlists = (rawPlaylists ?? []) as Playlist[]
  const orgs = (rawOrgs ?? []) as ExternalOrganization[]

  const progressSummary: Record<string, { started: number; completed: number }> = {}
  for (const p of allProgress ?? []) {
    const pr = p as { video_id: string; completed: boolean; user_id: string }
    if (!progressSummary[pr.video_id]) progressSummary[pr.video_id] = { started: 0, completed: 0 }
    progressSummary[pr.video_id].started++
    if (pr.completed) progressSummary[pr.video_id].completed++
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar profile={profile} />
      <main id="main-content" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <EmployeeDashboardClient
            initialVideos={videos}
            initialContacts={contacts}
            progressSummary={progressSummary}
            initialSpeakers={speakers}
            initialCollections={collections}
            initialPlaylists={playlists}
            initialOrgs={orgs}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
