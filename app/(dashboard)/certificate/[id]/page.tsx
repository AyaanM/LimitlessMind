'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Printer, ChevronLeft } from 'lucide-react'
import { PrintableCertificate } from '@/components/shared/PrintableCertificate'
import { PageLoader } from '@/components/shared/LoadingSpinner'
import type { Certificate } from '@/types/database'
import Link from 'next/link'

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const { data } = await (supabase as any)
        .from('certificates')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!data) { router.push('/learning-records'); return }
      setCert(data as Certificate)
      setLoading(false)
    }
    load()
  }, [id, router])

  if (loading) return <PageLoader />
  if (!cert) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/learning-records"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to Learning Records
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent print:hidden"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print Certificate
        </button>
      </div>

      <div className="print:hidden space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Certificate of Completion</h1>
        <p className="text-muted-foreground">Your certificate is ready to view and print.</p>
      </div>

      <PrintableCertificate cert={cert} />

      <p className="text-sm text-muted-foreground text-center print:hidden">
        Use your browser&apos;s print function (Ctrl+P / Cmd+P) or click &quot;Print Certificate&quot; above to save as PDF.
      </p>
    </div>
  )
}
