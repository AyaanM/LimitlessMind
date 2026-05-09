export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-8">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Autism Edmonton LMS</p>
            <p className="mt-1 text-xs text-muted-foreground">
              A learning platform for the autism community.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>
              Not an emergency service.{' '}
              <span className="font-medium">In an emergency, call 911.</span>
            </p>
            <p className="mt-1">© {new Date().getFullYear()} Autism Edmonton</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
