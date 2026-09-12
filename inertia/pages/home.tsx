import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowRightIcon, ServerIcon, ShieldCheckIcon, GaugeIcon } from 'lucide-react'

import MarketingLayout from '@/layouts/marketing_layout'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: ServerIcon,
    title: 'Manage every server',
    body: 'Provision, monitor and roll back your fleet from a single control plane.',
  },
  {
    icon: GaugeIcon,
    title: 'Real-time insight',
    body: 'Live metrics and health checks so you always know what is happening.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure by default',
    body: 'Session auth, CSRF protection and audit trails baked in from day one.',
  },
]

export default function Home() {
  const user = usePage().props.user

  return (
    <MarketingLayout>
      <section className="flex flex-col items-start gap-6 py-16 sm:py-24 lg:py-32">
        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
          AdonisJS · Inertia · React
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          The control plane for your infrastructure
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg text-pretty">
          Influx blends server-driven routing with a rich client experience — seamless, fast and
          cohesive across every device.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {user ? (
            <Link route="dashboard" className={cn(buttonVariants({ size: 'lg' }))}>
              Go to dashboard
              <ArrowRightIcon />
            </Link>
          ) : (
            <Link route="new_account.create" className={cn(buttonVariants({ size: 'lg' }))}>
              Get started
              <ArrowRightIcon />
            </Link>
          )}
          <a
            href="https://docs.adonisjs.com/introduction"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
          >
            Read the docs
          </a>
        </div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3 lg:pb-24">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="text-primary size-6" />
              <CardTitle className="mt-2">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">{feature.body}</CardContent>
          </Card>
        ))}
      </section>
    </MarketingLayout>
  )
}
