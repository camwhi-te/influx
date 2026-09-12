import { type ComponentType, type ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Dashed placeholder used by the per-server monitoring tabs until the real
 * data pipelines land.
 */
export function PlaceholderPanel({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-lg">
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-muted-foreground mx-auto max-w-md text-sm">{children}</p>
        </div>
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
          Coming soon
        </span>
      </CardContent>
    </Card>
  )
}

/** A small stat tile with placeholder values. */
export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 py-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      </CardContent>
    </Card>
  )
}
