import Link from 'next/link'

interface PremiumGateProps {
  title?: string
  message?: string
  showButton?: boolean
}

export function PremiumGate({
  title = 'Premium Content',
  message = 'This content is available with a Premium plan. Premium gives you access to all videos, the AI learning assistant, and more.',
  showButton = true,
}: PremiumGateProps) {
  return (
    <div className="rounded-xl border border-premium/20 bg-premium-light p-8 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-4xl" aria-hidden="true">🔓</div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
        {showButton && (
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View subscription options
          </Link>
        )}
      </div>
    </div>
  )
}
