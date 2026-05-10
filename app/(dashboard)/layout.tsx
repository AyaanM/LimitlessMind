import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getSubscription, isPremiumActive } from '@/lib/supabase/queries'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { AccessibilityPanel } from '@/components/layout/AccessibilityPanel'
import { ReadAloudOverlay } from '@/components/layout/ReadAloudOverlay'
import { AIFloatingChat } from '@/components/ai/AIFloatingChat'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [profile, subscription] = await Promise.all([
    getProfile(supabase, user.id),
    getSubscription(supabase, user.id),
  ])
  const isPremium = isPremiumActive(subscription)

  if (!profile?.display_name) redirect('/profile-setup')

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar profile={profile} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar profile={profile} />
        <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
          <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
      <AIFloatingChat isPremium={isPremium} />
      <AccessibilityPanel />
      <ReadAloudOverlay />
    </div>
  )
}
