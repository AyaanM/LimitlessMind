import Link from 'next/link'
import { Award, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Certificate } from '@/types/database'

interface CertificateCardProps {
  cert: Certificate
}

export function CertificateCard({ cert }: CertificateCardProps) {
  return (
    <div className="rounded-xl border border-sage/30 bg-sage-light/20 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-sage-light p-2 shrink-0">
          <Award className="h-5 w-5 text-sage" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <h3 className="font-semibold text-foreground leading-tight">{cert.title}</h3>
          <p className="text-xs text-muted-foreground">Issued {formatDate(cert.issued_at)}</p>
          {cert.learning_hours > 0 && (
            <p className="text-xs text-muted-foreground">{cert.learning_hours}h of learning</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">{cert.certificate_code}</span>
        <Link
          href={`/certificate/${cert.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          View &amp; Print
        </Link>
      </div>
    </div>
  )
}
