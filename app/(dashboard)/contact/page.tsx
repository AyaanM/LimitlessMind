import { createClient } from '@/lib/supabase/server'
import { getContactCards } from '@/lib/supabase/queries'
import { ContactCard } from '@/components/shared/ContactCard'
import { AlertCircle } from 'lucide-react'
import type { ContactCard as ContactCardType } from '@/types/database'

export default async function ContactPage() {
  const supabase = createClient()
  const cards: ContactCardType[] = await getContactCards(supabase)

  const emergency = cards.find((c) => c.category === 'emergency')
  const regular = cards.filter((c) => c.category !== 'emergency')

  return (
    <div className="space-y-10 max-w-reading">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Who to Talk To</h1>
        <p className="text-muted-foreground">
          Find the right person or team for your questions and needs.
        </p>
      </div>

      <div
        className="flex gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-5"
        role="region"
        aria-label="Emergency information"
      >
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">This platform is not for emergencies</p>
          <p className="text-sm text-muted-foreground">
            If you or someone else is in immediate danger, please call{' '}
            <strong>911</strong>. For mental health crises, call the Edmonton Distress Line at{' '}
            <a href="tel:780-482-4357" className="font-medium text-accent hover:underline">780-482-4357</a>.
          </p>
        </div>
      </div>

      <section className="space-y-4" aria-label="Contact guide">
        <h2 className="text-lg font-semibold text-foreground">Who should I contact?</h2>
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4 text-sm text-muted-foreground">
          {[
            { q: 'I have questions about this platform', a: 'Contact Autism Edmonton using the information below.' },
            { q: 'I need help with housing', a: 'Reach out to the Housing Navigator at Autism Edmonton.' },
            { q: 'I need help finding a job', a: 'Contact the Employment Support Team.' },
            { q: 'I am struggling with my mental health', a: 'Speak with a professional — your doctor or a registered psychologist can help.' },
            { q: 'I am in crisis right now', a: 'Call the Edmonton Distress Line: 780-482-4357, or call 911.' },
          ].map(({ q, a }) => (
            <div key={q} className="space-y-0.5">
              <p className="font-semibold text-foreground">Q: {q}</p>
              <p>A: {a}</p>
            </div>
          ))}
        </div>
      </section>

      {regular.length > 0 && (
        <section className="space-y-4" aria-label="Contact cards">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {regular.map((card) => <ContactCard key={card.id} card={card} />)}
          </div>
        </section>
      )}

      {emergency && (
        <section className="space-y-4" aria-label="Crisis support">
          <h2 className="text-lg font-semibold text-foreground">Crisis support</h2>
          <ContactCard card={emergency} />
        </section>
      )}

      {cards.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-3">
          <div className="text-4xl" aria-hidden="true">📋</div>
          <p className="font-semibold text-foreground">Contact information coming soon</p>
          <p className="text-sm text-muted-foreground">
            Autism Edmonton staff will add contact details through the employee dashboard.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-2">
        <h2 className="text-base font-semibold text-foreground">In-person support</h2>
        <p className="text-sm text-muted-foreground">
          Autism Edmonton offers in-person programs and drop-in support. Visit{' '}
          <a href="https://www.autismedmonton.org" target="_blank" rel="noopener noreferrer"
            className="text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
            autismedmonton.org
          </a>{' '}
          for locations and schedules.
        </p>
      </div>
    </div>
  )
}
