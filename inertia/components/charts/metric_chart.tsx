import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { axisTimeLabel, fmtClock, type MetricPoint, type MetricRange } from '@/lib/metrics'
import { cn } from '@/lib/utils'

export type ChartSeries = {
  key: keyof MetricPoint
  label: string
  /** A CSS colour, typically `var(--chart-N)`. */
  color: string
}

type MetricChartProps = {
  data: MetricPoint[]
  series: ChartSeries[]
  range: MetricRange
  /** Formats a Y value for the axis and tooltip. */
  format: (value: number | null) => string
  /** Fixed Y domain, e.g. `[0, 100]` for a percentage. */
  domain?: [number, number]
  height?: number
  className?: string
}

export function MetricChart({
  data,
  series,
  range,
  format,
  domain,
  height = 200,
  className,
}: MetricChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const hasData = data.some((row) => series.some((s) => row[s.key] !== null))

  return (
    <div className={cn('w-full', className)}>
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <span
              key={String(s.key)}
              className="text-muted-foreground flex items-center gap-1.5 text-xs"
            >
              <span
                className="size-2 rounded-[2px]"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <div style={{ height }} className="relative">
        {!hasData && (
          <div className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
            No data for this range yet
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {series.map((s, i) => (
                <linearGradient
                  key={String(s.key)}
                  id={`${gradientId}-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              tickFormatter={(v: string) => axisTimeLabel(v, range)}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              width={52}
              domain={domain ?? ['auto', 'auto']}
              tickFormatter={(v: number) => format(v)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              isAnimationActive={false}
              cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 text-xs shadow-md">
                    <div className="text-muted-foreground mb-1">{fmtClock(String(label))}</div>
                    {payload.map((entry) => {
                      const key = String(entry.dataKey)
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-[2px]"
                            style={{ backgroundColor: entry.color }}
                            aria-hidden
                          />
                          <span className="text-muted-foreground">
                            {series.find((s) => String(s.key) === key)?.label ?? key}
                          </span>
                          <span className="text-foreground ml-auto font-medium tabular-nums">
                            {format(typeof entry.value === 'number' ? entry.value : null)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
            {series.map((s, i) => (
              <Area
                key={String(s.key)}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#${gradientId}-${i})`}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                isAnimationActive={false}
                connectNulls={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
