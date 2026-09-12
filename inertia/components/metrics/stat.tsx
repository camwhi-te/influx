import { type ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Sparkline } from '@/components/charts/sparkline'
import { cn } from '@/lib/utils'

type StatProps = {
  label: string
  value: ReactNode
  sub?: ReactNode
  spark?: (number | null)[]
  sparkColor?: string
  sparkMax?: number
  tone?: 'default' | 'warning' | 'critical'
}

const toneText: Record<NonNullable<StatProps['tone']>, string> = {
  default: 'text-foreground',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-destructive',
}

export function Stat({
  label,
  value,
  sub,
  spark,
  sparkColor,
  sparkMax,
  tone = 'default',
}: StatProps) {
  return (
    <Card>
      <CardContent className="space-y-1 py-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
        <p className={cn('text-2xl font-semibold tabular-nums', toneText[tone])}>{value}</p>
        {spark && spark.some((v) => v !== null) ? (
          <Sparkline
            values={spark}
            color={sparkColor}
            max={sparkMax}
            width={160}
            height={28}
            className="w-full"
          />
        ) : null}
        {sub ? <p className="text-muted-foreground text-xs">{sub}</p> : null}
      </CardContent>
    </Card>
  )
}
