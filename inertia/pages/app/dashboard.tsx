import { ActivityIcon, CpuIcon, ServerIcon, TriangleAlertIcon } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'

import AppLayout from '@/layouts/app_layout'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Stat = { label: string; value: string; hint: string }
type Event = { id: number; text: string; time: string }

const icons = [ServerIcon, CpuIcon, ActivityIcon, TriangleAlertIcon]

export default function Dashboard({ stats, activity }: { stats: Stat[]; activity: Event[] }) {
  return (
    <AppLayout
      title="Dashboard"
      description="A snapshot of your infrastructure right now."
      actions={
        <Link route="servers.index" className={cn(buttonVariants())}>
          View servers
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = icons[i % icons.length] ?? ServerIcon
          return (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {stat.label}
                </CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-xs">{stat.hint}</CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest events across your account.</CardDescription>
          </CardHeader>
          <CardContent className="divide-border divide-y">
            {activity.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span>{event.text}</span>
                <span className="text-muted-foreground shrink-0 text-xs">{event.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
            <CardDescription>Finish setting up your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link
              route="servers.index"
              className={cn(buttonVariants({ variant: 'outline' }), 'justify-start')}
            >
              Connect your first server
            </Link>
            <Link
              route="dashboard.account"
              className={cn(buttonVariants({ variant: 'outline' }), 'justify-start')}
            >
              Complete your profile
            </Link>
            <Link
              route="dashboard.settings"
              className={cn(buttonVariants({ variant: 'outline' }), 'justify-start')}
            >
              Review your settings
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
