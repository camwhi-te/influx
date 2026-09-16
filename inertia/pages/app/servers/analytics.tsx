import ServerLayout from '@/layouts/server_layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RangeTabs } from '@/components/metrics/range_tabs'
import { Stat } from '@/components/metrics/stat'
import { type ServerRecord } from '@/components/server_form_fields'
import {
  fmtBytesPerSec,
  fmtClock,
  fmtPct,
  fmtTemp,
  type MetricRange,
  type MetricSummary,
  type MetricSummaryStat,
  type RangeOption,
} from '@/lib/metrics'

type Row = {
  label: string
  stat: MetricSummaryStat
  fmt: (v: number | null) => string
}

export default function ServerAnalytics({
  server,
  range,
  ranges,
  summary,
}: {
  server: ServerRecord
  range: MetricRange
  ranges: RangeOption[]
  summary: MetricSummary
}) {
  const pct = (v: number | null) => fmtPct(v, 1)
  const rows: Row[] = [
    { label: 'CPU utilisation', stat: summary.stats.cpuPct, fmt: pct },
    { label: 'Memory used', stat: summary.stats.memUsedPct, fmt: pct },
    {
      label: 'Load (1m)',
      stat: summary.stats.load1,
      fmt: (v) => (v === null ? '—' : v.toFixed(2)),
    },
    { label: 'Network in', stat: summary.stats.netRxBps, fmt: fmtBytesPerSec },
    { label: 'Network out', stat: summary.stats.netTxBps, fmt: fmtBytesPerSec },
    { label: 'Temperature', stat: summary.stats.cpuTempC, fmt: fmtTemp },
  ]

  return (
    <ServerLayout server={server}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{fmtClock(summary.from)} → now</p>
        <RangeTabs value={range} options={ranges} only={['summary', 'range']} />
      </div>

      {!server.daemonPaired || summary.reportCount === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            {server.daemonPaired
              ? 'No reports in this range yet.'
              : 'Pair a monitoring daemon from the Settings tab to see analytics.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <Stat
              label="Coverage"
              value={fmtPct(summary.coveragePct, 1)}
              sub="share of the range with at least one report"
              tone={summary.coveragePct < 80 ? 'warning' : 'default'}
            />
            <Stat label="Reports stored" value={summary.reportCount.toLocaleString()} />
            <Stat
              label="Peak CPU at"
              value={summary.peakCpuAt ? fmtClock(summary.peakCpuAt) : '—'}
              sub={`max ${fmtPct(summary.stats.cpuPct.max, 1)}`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Aggregates for {rangeLabel(range, ranges)}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="px-2 py-2 font-medium">Metric</th>
                    <th className="px-2 py-2 text-right font-medium">Average</th>
                    <th className="px-2 py-2 text-right font-medium">p95</th>
                    <th className="px-2 py-2 text-right font-medium">Min</th>
                    <th className="px-2 py-2 text-right font-medium">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {rows.map((row) => (
                    <tr key={row.label}>
                      <td className="px-2 py-2 font-medium">{row.label}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.fmt(row.stat.avg)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.fmt(row.stat.p95)}</td>
                      <td className="text-muted-foreground px-2 py-2 text-right tabular-nums">
                        {row.fmt(row.stat.min)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{row.fmt(row.stat.max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </ServerLayout>
  )
}

function rangeLabel(range: MetricRange, ranges: RangeOption[]): string {
  return ranges.find((r) => r.value === range)?.label ?? range
}
