import { type ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'

import { Logo } from '@/components/logo'
import { ModeToggle } from '@/components/mode_toggle'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function MarketingLayout({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  const user = usePage().props.user

  return (
    <div className="flex min-h-svh flex-col">
      {title ? <Head title={title} /> : null}

      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link route="home" aria-label="Influx home" className="flex items-center">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {user ? (
              <Link route="dashboard" className={cn(buttonVariants({ size: 'sm' }))}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  route="session.create"
                  className={cn(
                    buttonVariants({ size: 'sm', variant: 'ghost' }),
                    'hidden sm:inline-flex'
                  )}
                >
                  Log in
                </Link>
                <Link route="new_account.create" className={cn(buttonVariants({ size: 'sm' }))}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">{children}</main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto w-full max-w-6xl px-4 py-6 text-sm sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Influx. Built with AdonisJS &amp; Inertia.
        </div>
      </footer>
    </div>
  )
}
