import { type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'

import { Logo } from '@/components/logo'
import { ModeToggle } from '@/components/mode_toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Head title={title} />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link route="home" aria-label="Influx home" className="flex items-center">
          <Logo />
        </Link>
        <ModeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
          {footer ? (
            <p className="text-muted-foreground mt-6 text-center text-sm">{footer}</p>
          ) : null}
        </div>
      </main>
    </div>
  )
}
