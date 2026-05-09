import { formatDate } from '@/lib/utils'
import type { Certificate } from '@/types/database'

interface PrintableCertificateProps {
  cert: Certificate
}

export function PrintableCertificate({ cert }: PrintableCertificateProps) {
  return (
    <div
      id="certificate-print"
      className="mx-auto max-w-2xl rounded-2xl border-4 border-sage/40 bg-white p-10 text-center shadow-xl print:shadow-none print:border-sage/60"
    >
      {/* Header */}
      <div className="space-y-1 mb-8">
        <div className="text-3xl" aria-hidden="true">🏅</div>
        <p className="text-sm font-semibold uppercase tracking-widest text-sage">Certificate of Completion</p>
        <p className="text-xs text-muted-foreground">Autism Edmonton Learning Platform</p>
      </div>

      {/* Body */}
      <div className="space-y-4 mb-8">
        <p className="text-base text-muted-foreground">This certifies that</p>
        <p className="text-2xl font-bold text-foreground border-b-2 border-sage/30 pb-3 mx-auto max-w-xs">
          {cert.recipient_name}
        </p>
        <p className="text-base text-muted-foreground">has successfully completed</p>
        <p className="text-xl font-semibold text-foreground">{cert.title}</p>
      </div>

      {/* Details */}
      <div className="flex justify-center gap-8 text-sm text-muted-foreground mb-8">
        <div className="text-center">
          <p className="font-semibold text-foreground">{formatDate(cert.issued_at)}</p>
          <p className="text-xs">Date of Completion</p>
        </div>
        {cert.learning_hours > 0 && (
          <div className="text-center">
            <p className="font-semibold text-foreground">{cert.learning_hours} Hours</p>
            <p className="text-xs">Learning Hours</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border pt-5 space-y-2">
        <p className="text-xs text-muted-foreground">
          Certificate Code: <span className="font-mono font-medium text-foreground">{cert.certificate_code}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Issued by Autism Edmonton LMS — autismedmonton.org
        </p>
      </div>
    </div>
  )
}
