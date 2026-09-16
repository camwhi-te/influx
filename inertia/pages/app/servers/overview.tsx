import { useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ServerIcon } from 'lucide-react'

import ServerLayout from '@/layouts/server_layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Stat } from '@/components/metrics/stat'
import { MetricChart } from '@/components/charts/metric_chart'
import { type ServerRecord } from '@/components/server_form_fields'
import {
  DAEMON_STATE_META,
  fmtBytesPerSec,
  fmtDuration,
  fmtPct,
  fmtRelative,
  fmtTemp,
  fmtNumber,
  type MetricPoint,
} from '@/lib/metrics'
import { type LatestReport } from '@/lib/daemon'
import { cn } from '@/lib/utils'

function col(series: MetricPoint[], key: keyof MetricPoint): (number | null)[] {
  return series.map((p) => (typeof p[key] === 'number' ? (p[key] as number) : null))
}

export default function ServerOverview({
  server,
  latest,
  series,
}: {
  server: ServerRecord
  latest: LatestReport
  series: MetricPoint[]
}) {
  useEffect(() => {
    if (!server.daemonPaired) return
    const id = setInterval(() => router.reload({ only: ['latest', 'series', 'server'] }), 15_000)
    return () => clearInterval(id)
  }, [server.daemonPaired])

  const snap = latest?.report.snapshot
  const host = snap?.host
  const stateMeta = DAEMON_STATE_META[server.daemonState] ?? DAEMON_STATE_META.unpaired

  if (!server.daemonPaired) {
    return (
      <ServerLayout server={server}>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-lg">
              <ServerIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No monitoring daemon yet</p>
              <p className="text-muted-foreground mx-auto max-w-md text-sm">
                Pair the influxd daemon with {server.name} to start collecting metrics.
              </p>
            </div>
            <Link
              route="servers.settings"
              routeParams={{ id: server.id }}
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              Set up the daemon
            </Link>
          </CardContent>
        </Card>
      </ServerLayout>
    )
  }

  return (
    <ServerLayout server={server}>
      <Card className="mb-4">
        <CardContent className="grid gap-3 py-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs uppercase">Status</p>
            <p className={cn('flex items-center gap-1.5 font-medium', stateMeta.text)}>
              <span className={cn('size-2 rounded-full', stateMeta.dot)} aria-hidden />
              {stateMeta.label}
            </p>
            <p className="text-muted-foreground text-xs">
              Last report {fmtRelative(server.daemonLastReportAt)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase">Host</p>
            <p className="font-medium">{host?.hostname ?? server.address}</p>
            <p className="text-muted-foreground text-xs">
              {[host?.platform, host?.platform_version].filter(Boolean).join(' ') ||
                host?.os ||
                '—'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase">Kernel / arch</p>
            <p className="font-medium">{host?.arch ?? '—'}</p>
            <p className="text-muted-foreground truncate text-xs" title={host?.kernel_version}>
              {host?.kernel_version ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase">Daemon</p>
            <p className="font-medium">v{server.daemonVersion ?? '—'}</p>
            <p className="text-muted-foreground text-xs">Up {fmtDuration(host?.uptime_seconds)}</p>
          </div>
        </CardContent>
      </Card>

      {!snap ? (
        <Card className="border-dashed">
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Daemon paired — waiting for the first report.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="CPU"
              value={fmtPct(snap.cpu?.usage_pct ?? null, 1)}
              spark={col(series, 'cpu_pct')}
              sparkColor="var(--chart-1)"
              sparkMax={100}
              sub={`${snap.cpu?.logical_cores ?? '?'} vCPU · load ${snap.cpu?.load1?.toFixed(2) ?? '—'}`}
            />
            <Stat
              label="Memory"
              value={fmtPct(snap.memory?.used_pct ?? null, 1)}
              spark={col(series, 'mem_used_pct')}
              sparkColor="var(--chart-2)"
              sparkMax={100}
              sub={`swap ${fmtPct(snap.memory?.swap_used_pct ?? null, 0)}`}
            />
            <Stat
              label="Disk (busiest mount)"
              value={fmtPct(
                Math.max(0, ...(snap.disks ?? []).map((d) => d.used_pct ?? 0)) || null,
                1
              )}
              spark={col(series, 'disk_used_pct')}
              sparkColor="var(--chart-3)"
              sparkMax={100}
              sub={`${(snap.disks ?? []).length} mounts`}
            />
            <Stat
              label="Network"
              value={fmtBytesPerSec(
                (snap.net_stats?.rx_bytes_per_s ?? 0) + (snap.net_stats?.tx_bytes_per_s ?? 0)
              )}
              spark={col(series, 'net_rx_bps')}
              sparkColor="var(--chart-1)"
              sub={`${fmtBytesPerSec(snap.net_stats?.rx_bytes_per_s)} in · ${fmtBytesPerSec(snap.net_stats?.tx_bytes_per_s)} out`}
            />
            <Stat
              label="Load (1m)"
              value={snap.cpu?.load1?.toFixed(2) ?? '—'}
              spark={col(series, 'load_1')}
              sparkColor="var(--chart-4)"
              sub={`5m ${snap.cpu?.load5?.toFixed(2) ?? '—'} · 15m ${snap.cpu?.load15?.toFixed(2) ?? '—'}`}
            />
            <Stat
              label="Temperature"
              value={fmtTemp(col(series, 'cpu_temp_c').at(-1) as number | null)}
              spark={col(series, 'cpu_temp_c')}
              sparkColor="var(--chart-5)"
              sub="hottest sensor"
            />
            <Stat
              label="Processes"
              value={fmtNumber(snap.processes?.total_count ?? null)}
              sub={`${snap.processes?.thread_count ?? '—'} threads · ${snap.processes?.zombie ?? 0} zombie`}
            />
            <Stat
              label="Uptime"
              value={fmtDuration(host?.uptime_seconds)}
              sub={
                host?.boot_time
                  ? `booted ${new Date(host.boot_time).toLocaleDateString()}`
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">CPU utilisation · last hour</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={series}
                  range="1h"
                  domain={[0, 100]}
                  format={(v) => fmtPct(v, 0)}
                  series={[{ key: 'cpu_pct', label: 'CPU %', color: 'var(--chart-1)' }]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Memory usage · last hour</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  data={series}
                  range="1h"
                  domain={[0, 100]}
                  format={(v) => fmtPct(v, 0)}
                  series={[{ key: 'mem_used_pct', label: 'Memory %', color: 'var(--chart-2)' }]}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </ServerLayout>
  )
}
