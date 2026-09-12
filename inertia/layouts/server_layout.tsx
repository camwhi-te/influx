import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from 'lucide-react'

import AppLayout from './app_layout'
import { buttonVariants } from '@/components/ui/button'
import { type ServerRecord } from '@/components/server_form_fields'
import { cn } from '@/lib/utils'

type ServerRouteName =
  | 'servers.show'
  | 'servers.console'
  | 'servers.charts'
  | 'servers.analytics'
  | 'servers.alerts'
  | 'servers.events'
  | 'servers.actions'
  | 'servers.settings'

/** Tab strip for the per-server monitoring views. `segment` is the last URL part. */
const tabs: { label: string; route: ServerRouteName; segment: string }[] = [
  { label: 'Overview', route: 'servers.show', segment: '' },
  { label: 'Console', route: 'servers.console', segment: 'console' },
  { label: 'Charts', route: 'servers.charts', segment: 'charts' },
  { label: 'Analytics', route: 'servers.analytics', segment: 'analytics' },
  { label: 'Alerts', route: 'servers.alerts', segment: 'alerts' },
  { label: 'Events', route: 'servers.events', segment: 'events' },
  { label: 'Actions', route: 'servers.actions', segment: 'actions' },
  { label: 'Settings', route: 'servers.settings', segment: 'settings' },
]

const severityStyles: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  high: 'bg-destructive/15 text-destructive',
}

export default function ServerLayout({
  server,
  children,
}: {
  server: ServerRecord
  children: ReactNode
}) {
  const { url } = usePage()
  const match = url.match(/^\/app\/servers\/\d+(?:\/([^/?#]+))?/)
  const current = match?.[1] ?? ''

  return (
    <AppLayout
      title={server.name}
      description={`${server.type.toUpperCase()} · ${server.address} · ${server.location}`}
      actions={
        <>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
              severityStyles[server.severity]
            )}
          >
            {server.severity} severity
          </span>
          <Link
            route="servers.index"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <ArrowLeftIcon />
            All servers
          </Link>
        </>
      }
    >
      <div className="mb-6 -mt-2 w-full overflow-x-auto">
        <nav className="flex min-w-max gap-1 border-b">
          {tabs.map((tab) => {
            const active = tab.segment === current
            return (
              <Link
                key={tab.route}
                route={tab.route}
                routeParams={{ id: server.id }}
                className={cn(
                  '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {children}
    </AppLayout>
  )
}
