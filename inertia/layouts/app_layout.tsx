import { type ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { MenuIcon } from 'lucide-react'

import { Logo } from '@/components/logo'
import { ModeToggle } from '@/components/mode_toggle'
import { UserMenu } from '@/components/user_menu'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { appNav, isActive } from '@/lib/nav'
import { cn } from '@/lib/utils'

type AppLayoutProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export default function AppLayout({ title, description, actions, children }: AppLayoutProps) {
  const page = usePage()
  const url = page.url
  const user = page.props.user

  return (
    <div className="bg-muted/30 flex min-h-svh flex-col">
      <Head title={title} />

      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          {/* Mobile nav trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b">
                <SheetTitle className="flex items-center">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {appNav.map((item) => {
                  const active = isActive(url, item.match)
                  return (
                    <SheetClose asChild key={item.route}>
                      <Link
                        route={item.route}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <item.icon className="size-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            route="dashboard"
            className="mr-2 flex shrink-0 items-center"
            aria-label="Influx home"
          >
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {appNav.map((item) => {
              const active = isActive(url, item.match)
              return (
                <Link
                  key={item.route}
                  route={item.route}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <ModeToggle />
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link route="session.create" className={cn(buttonVariants({ size: 'sm' }))}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {description ? (
              <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
        {children}
      </main>
    </div>
  )
}
