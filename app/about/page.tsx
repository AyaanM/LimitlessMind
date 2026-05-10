import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Users, BookOpen, Shield, Lightbulb, Globe } from 'lucide-react'

const VALUES = [
  {
    icon: Heart,
    title: 'Dignity First',
    desc: 'Every person with autism deserves to be treated with respect, understanding, and dignity. Our platform reflects this in every interaction.',
  },
  {
    icon: Lightbulb,
    title: 'Strengths-Based',
    desc: 'We focus on what autistic people can do, not what they cannot. Our content highlights capabilities, talents, and pathways to independence.',
  },
  {
    icon: Users,
    title: 'Community-Centred',
    desc: 'Built with and for the Edmonton autism community — autistic adults, families, caregivers, educators, and employers working together.',
  },
  {
    icon: BookOpen,
    title: 'Lifelong Learning',
    desc: 'Learning does not stop after school. We provide resources for every stage of life, from early adulthood through employment and beyond.',
  },
  {
    icon: Shield,
    title: 'Safe & Accessible',
    desc: 'A calm, low-clutter environment designed to reduce sensory overwhelm. No flashing content, no noise, no pressure.',
  },
  {
    icon: Globe,
    title: 'Free to Access',
    desc: 'Core content is always free. We believe cost should never be a barrier to information that helps people live fuller, more independent lives.',
  },
]

const TEAM = [
  {
    name: 'Autism Edmonton Staff',
    role: 'Content & Programming',
    desc: 'Our team selects and reviews every video and resource to ensure it is accurate, respectful, and relevant to the Edmonton community.',
  },
  {
    name: 'Autistic Advisors',
    role: 'Community Input',
    desc: 'Autistic adults from the Edmonton area help shape our content priorities, platform design, and learning pathways.',
  },
  {
    name: 'Partner Speakers',
    role: 'Expert Educators',
    desc: 'Specialists in autism, employment, mental health, housing, and relationships contribute talks and learning resources.',
  },
]

export default async function AboutPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-6">
        <div className="mx-auto flex max-w-content items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg">
            <Image src="/img/logo.png" alt="Autism Edmonton" width={180} height={60} className="h-16 w-auto" />
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/about"
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
              <span aria-hidden="true">🌿</span> About Autism Edmonton LMS
            </div>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Learning built for the{' '}
              <span className="text-accent">autism community</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Autism Edmonton LMS is a free learning platform created by Autism Edmonton to help
              autistic individuals, caregivers, and professionals access practical, high-quality
              education — at their own pace, in a calm and welcoming space.
            </p>
          </div>
        </section>

        {/* About Autism Edmonton */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-content px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-5">
                <h2 className="text-2xl font-semibold text-foreground">About Autism Edmonton</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Autism Edmonton is a non-profit organization based in Edmonton, Alberta, dedicated
                  to supporting autistic individuals and their families throughout every stage of life.
                  Since our founding, we have worked to build an inclusive community where autistic
                  people are understood, valued, and empowered.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We provide programs, resources, and advocacy that address the real challenges faced
                  by autistic Edmontonians — from navigating housing and employment to building
                  relationships and understanding their own identity.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This learning platform is an extension of that mission: making Autism Edmonton's
                  knowledge and expertise available to anyone, anywhere, at any time.
                </p>
                <a
                  href="https://www.autismedmonton.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Visit autismedmonton.org →
                </a>
              </div>

              <div className="rounded-2xl border border-border bg-card p-8 shadow-card space-y-5">
                <h3 className="font-semibold text-foreground text-lg">Our mission</h3>
                <blockquote className="border-l-4 border-accent pl-5 italic text-muted-foreground leading-relaxed">
                  "To support, empower, and advocate for autistic individuals and their families
                  in Edmonton and the surrounding region — ensuring every person has access to the
                  resources, community, and opportunities they deserve."
                </blockquote>
                <div className="pt-2 grid grid-cols-2 gap-4 text-center">
                  {[
                    { stat: '25+', label: 'Years serving Edmonton' },
                    { stat: '5', label: 'Learning topic areas' },
                    { stat: 'Free', label: 'Core content, always' },
                    { stat: 'All ages', label: 'Adults, families & pros' },
                  ].map(({ stat, label }) => (
                    <div key={label} className="rounded-xl bg-accent-light p-4">
                      <p className="text-xl font-bold text-accent">{stat}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is the LMS */}
        <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">What is the LMS?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              LMS stands for Learning Management System — a platform designed to deliver and
              track educational content. Ours is built specifically for the autism community.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Browse videos',
                desc: 'Watch expert talks organized into five topic areas: Housing, Employment, Mental Health, Relationships, and Identity.',
              },
              {
                step: '02',
                title: 'Learn through games',
                desc: 'Practice daily life skills and social situations with calm, low-pressure games designed for autistic learners.',
              },
              {
                step: '03',
                title: 'Track your progress',
                desc: 'See what you have watched, earn certificates, and build a personal learning record at your own pace.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-3 text-3xl font-bold text-accent opacity-30">{step}</div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-content px-4 sm:px-6">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Our values</h2>
              <p className="text-muted-foreground">The principles that guide every decision we make.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light">
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who creates the content */}
        <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Who creates the content</h2>
            <p className="text-muted-foreground">Content is developed with community involvement at every step.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            {TEAM.map(({ name, role, desc }) => (
              <div key={name} className="rounded-xl border border-border bg-card p-6 shadow-card text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent font-bold text-lg">
                  {name[0]}
                </div>
                <h3 className="font-semibold text-foreground">{name}</h3>
                <p className="text-xs text-accent font-medium mt-0.5">{role}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-10 text-center text-2xl font-semibold text-foreground">Common questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Is this platform free?',
                  a: 'Yes — core content is always free. A Premium plan ($10/month CAD) unlocks additional videos, AI features, and all games. You can cancel anytime.',
                },
                {
                  q: 'Who is this platform for?',
                  a: 'Anyone connected to the autism community: autistic adults, caregivers, parents, guardians, educators, employers, and other professionals. You choose your role when you sign up.',
                },
                {
                  q: 'Do I need to be from Edmonton?',
                  a: 'No. While the platform is built by and for the Edmonton community, anyone in the world is welcome to learn here.',
                },
                {
                  q: 'Is my information private?',
                  a: 'Yes. We only collect what is needed to run your account. We do not sell data and we do not share personal information with third parties.',
                },
                {
                  q: 'Can I suggest topics or videos?',
                  a: 'Absolutely. Use the Contact page inside your account to send suggestions to the Autism Edmonton team.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="font-semibold text-foreground">{q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-content px-4 py-20 sm:px-6 text-center">
          <div className="rounded-2xl bg-accent-light p-12 space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Ready to start learning?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create a free account in minutes. No payment required to get started.
            </p>
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
