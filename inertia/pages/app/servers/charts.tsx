import ServerLayout from '@/layouts/server_layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricChart, type ChartSeries } from '@/components/charts/metric_chart'
import { RangeTabs } from '@/components/metrics/range_tabs'
import { type ServerRecord } from '@/components/server_form_fields'
import {
  fmtBytesPerSec,
  fmtPct,
  fmtTemp,
  fmtNumber,
  type MetricPoint,
  type MetricRange,
  type RangeOption,
} from '@/lib/metrics'

type ChartDef = {
  title: string
  format: (v: number | null) => string
  domain?: [number, number]
  series: ChartSeries[]
}

const CHARTS: ChartDef[] = [
  {
    title: 'CPU utilisation',
    format: (v) => fmtPct(v, 0),
    domain: [0, 100],
    series: [{ key: 'cpu_pct', label: 'CPU %', color: 'var(--chart-1)' }],
  },
  {
    title: 'Load average',
    format: (v) => (v === null ? '—' : v.toFixed(2)),
    series: [
      { key: 'load_1', label: '1 min', color: 'var(--chart-1)' },
      { key: 'load_5', label: '5 min', color: 'var(--chart-2)' },
      { key: 'load_15', label: '15 min', color: 'var(--chart-3)' },
    ],
  },
  {
    title: 'Memory & swap',
    format: (v) => fmtPct(v, 0),
    domain: [0, 100],
    series: [
      { key: 'mem_used_pct', label: 'Memory %', color: 'var(--chart-2)' },
      { key: 'swap_used_pct', label: 'Swap %', color: 'var(--chart-5)' },
    ],
  },
  {
    title: 'Network throughput',
    format: fmtBytesPerSec,
    series: [
      { key: 'net_rx_bps', label: 'Inbound', color: 'var(--chart-1)' },
      { key: 'net_tx_bps', label: 'Outbound', color: 'var(--chart-5)' },
    ],
  },
  {
    title: 'Disk I/O',
    format: fmtBytesPerSec,
    series: [
      { key: 'disk_read_bps', label: 'Read', color: 'var(--chart-2)' },
      { key: 'disk_write_bps', label: 'Write', color: 'var(--chart-3)' },
    ],
  },
  {
    title: 'Disk busy',
    format: (v) => fmtPct(v, 0),
    domain: [0, 100],
    series: [{ key: 'disk_busy_pct', label: 'Busy %', color: 'var(--chart-4)' }],
  },
  {
    title: 'Temperature',
    format: fmtTemp,
    series: [{ key: 'cpu_temp_c', label: 'Hottest sensor', color: 'var(--chart-5)' }],
  },
  {
    title: 'Process count',
    format: fmtNumber,
    series: [{ key: 'process_count', label: 'Processes', color: 'var(--chart-3)' }],
  },
]

export default function ServerCharts({
  server,
  range,
  ranges,
  series,
}: {
  server: ServerRecord
  range: MetricRange
  ranges: RangeOption[]
  series: MetricPoint[]
}) {
  return (
    <ServerLayout server={server}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {series.length} data point{series.length === 1 ? '' : 's'}
        </p>
        <RangeTabs value={range} options={ranges} only={['series', 'range']} />
      </div>

      {!server.agentPaired ? (
        <Card className="border-dashed">
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Pair a monitoring agent from the Settings tab to see charts.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {CHARTS.map((chart) => (
            <Card key={chart.title}>
              <CardHeader>
                <CardTitle className="text-sm">{chart.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={series}
                  range={range}
                  series={chart.series}
                  format={chart.format}
                  domain={chart.domain}
                  height={200}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ServerLayout>
  )
}
