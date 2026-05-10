import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Sparkles, Users, Home, Briefcase, Heart, UserCheck, Star } from 'lucide-react'

const CATEGORIES = [
  { icon: Home,       label: 'Housing',       desc: 'Navigate housing options and supports.' },
  { icon: Briefcase,  label: 'Employment',    desc: 'Prepare for work and understand your rights.' },
  { icon: Heart,      label: 'Mental Health', desc: 'Strategies for wellbeing and self-regulation.' },
  { icon: Users,      label: 'Relationships', desc: 'Build connections and set healthy boundaries.' },
  { icon: Star,       label: 'Identity',      desc: 'Explore your autistic identity with confidence.' },
]

const ROLES = [
  'Autistic Adult',
  'Caregiver / Parent / Guardian',
  'Professional',
  'Educator',
  'Employer',
]

export default async function LandingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  const introVideoId = process.env.NEXT_PUBLIC_INTRO_VIDEO_ID ?? ''

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-6">
        <div className="mx-auto flex max-w-content items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/img/logo.png" alt="Autism Edmonton" width={180} height={60} className="h-16 w-auto" />
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/about"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              About
            </Link>
            {isLoggedIn ? (
              <Link
                href="/home"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Go to platform →
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-content px-4 py-20 sm:px-6 text-center">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-sage-light px-4 py-2 text-sm font-medium text-sage">
              <span aria-hidden="true">🌿</span> A calm place to learn and grow
            </div>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Learning designed for{' '}
              <span className="text-accent">you</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Autism Edmonton LMS is a simple, peaceful learning platform for autistic people,
              caregivers, educators, and employers. Browse videos, play games, and learn at your
              own pace — with no pressure, no clutter, and no noise.
            </p>
            {isLoggedIn ? (
              <Link
                href="/home"
                className="inline-block rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Go to platform →
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Create a free account
                </Link>
                <Link
                  href="/sign-in"
                  className="w-full sm:w-auto rounded-xl border border-border bg-card px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Welcome video */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
              Welcome to Autism Edmonton LMS
            </h2>
            <div className="overflow-hidden rounded-2xl shadow-card-hover">
              {introVideoId ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${introVideoId}`}
                    title="Welcome to Autism Edmonton LMS"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-accent-light flex items-center justify-center">
                  <div className="text-center space-y-3 px-8">
                    <div className="text-5xl" aria-hidden="true">🎬</div>
                    <p className="text-base font-medium text-accent">Welcome video coming soon</p>
                    <p className="text-sm text-muted-foreground">
                      Add <code className="rounded bg-white/60 px-1">NEXT_PUBLIC_INTRO_VIDEO_ID=yourYouTubeID</code> to your <code className="rounded bg-white/60 px-1">.env.local</code> to embed the video.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Video categories */}
        <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">What you can learn</h2>
            <p className="text-muted-foreground">Five topic areas, all designed for you.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORIES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-card p-6 shadow-card text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light">
                  <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-foreground">{label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Free vs Premium */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-content px-4 sm:px-6">
            <h2 className="mb-10 text-center text-2xl font-semibold text-foreground">
              Free and Premium plans
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
              {/* Free */}
              <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
                <div className="mb-4">
                  <span className="rounded-full bg-sage-light px-3 py-1 text-sm font-medium text-sage">Free</span>
                </div>
                <p className="mb-1 text-2xl font-bold text-foreground">Free forever</p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {['All free videos', 'Basic games', 'Progress tracking', 'Save videos'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-sage font-bold" aria-hidden="true">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up"
                  className="mt-8 block rounded-lg border border-border bg-surface py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Get started free
                </Link>
              </div>

              {/* Premium */}
              <div className="rounded-2xl border-2 border-accent bg-card p-8 shadow-card-hover">
                <div className="mb-4">
                  <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-white">Premium</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">$10 / month</p>
                  <p className="text-sm text-muted-foreground">CAD, cancel anytime</p>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {['Everything in Free', 'All premium videos', 'AI learning assistant', 'AI video summaries', 'AI smart search', 'All games', 'Personalized recommendations'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-accent font-bold" aria-hidden="true">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up"
                  className="mt-8 block rounded-lg bg-accent py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Start with Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Who is this for */}
        <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">
            Who can join
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {ROLES.map((role) => (
              <div
                key={role}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground"
              >
                <UserCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                {role}
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground max-w-md mx-auto">
            You choose your role when you create your profile. We use it to show you the most helpful content first.
          </p>
        </section>

        {/* Features */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-content px-4 sm:px-6">
            <h2 className="mb-10 text-center text-2xl font-semibold text-foreground">Designed for comfort</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: BookOpen, title: 'Calm design', desc: 'Soft colors, large text, lots of space. No clutter, no noise, no flashing.' },
                { icon: Sparkles, title: 'AI assistant', desc: 'Ask questions and get gentle, helpful answers — Premium feature.' },
                { icon: Gamepad2, title: 'Calm games', desc: 'Practice social skills and daily routines with simple, low-pressure games.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light">
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-content px-4 py-20 sm:px-6 text-center">
          <div className="rounded-2xl bg-accent-light p-12 space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Ready to begin?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your free profile in minutes. Choose your role, pick an avatar, and start exploring.
            </p>
            <Link
              href="/sign-up"
              className="inline-block rounded-xl bg-accent px-10 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Create your free profile
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Autism Edmonton · This platform is not an emergency service.{' '}
          <strong>In an emergency, call 911.</strong>
        </p>
      </footer>
    </div>
  )
}
