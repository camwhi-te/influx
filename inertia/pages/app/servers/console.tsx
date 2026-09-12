import { useServerStream } from '@/hooks/use_server_stream'
import ServerLayout from '@/layouts/server_layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectionBadge } from '@/components/metrics/connection_badge'
import { type ServerRecord } from '@/components/server_form_fields'
import { type LatestReport, type AgentSnapshot } from '@/lib/agent'
import { fmtBytes, fmtBytesPerSec, fmtPct, fmtRelative, fmtTemp, fmtNumber } from '@/lib/metrics'
import { cn } from '@/lib/utils'

function Meter({
  label,
  pct,
  sub,
}: {
  label: string
  pct: number | null | undefined
  sub?: string
}) {
  const value = typeof pct === 'number' ? Math.max(0, Math.min(100, pct)) : null
  const tone =
    value === null
      ? 'bg-muted'
      : value >= 90
        ? 'bg-destructive'
        : value >= 75
          ? 'bg-amber-500'
          : 'bg-primary'
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value === null ? '—' : fmtPct(value, 1)}</span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className={cn('h-full rounded-full transition-all', tone)}
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
      {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">{children}</CardContent>
    </Card>
  )
}

const th = 'px-2 py-1.5 text-left font-medium text-muted-foreground'
const td = 'px-2 py-1.5 whitespace-nowrap'

export default function ServerConsole({
  server,
  latest,
}: {
  server: ServerRecord
  latest: LatestReport
}) {
  const stream = useServerStream(server.id, server.agentPaired)
  const snap: AgentSnapshot | undefined = stream.snapshot ?? latest?.report.snapshot
  const live = Boolean(stream.snapshot)

  return (
    <ServerLayout server={server}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {live
            ? `Live · updated ${stream.updatedAt ? fmtRelative(new Date(stream.updatedAt).toISOString()) : 'now'}`
            : latest
              ? `Last stored snapshot · ${fmtRelative(latest.capturedAt)}`
              : 'No data yet'}
        </p>
        <ConnectionBadge connection={stream.connection} detail={stream.detail} />
      </div>

      {stream.connection === 'unconfigured' && (
        <Card className="mb-4 border-dashed">
          <CardContent className="text-muted-foreground py-4 text-sm">
            No agent URL set — showing stored reports only. Add the daemon&apos;s realtime URL on
            the Settings tab for a live view.
          </CardContent>
        </Card>
      )}

      {!snap ? (
        <Card className="border-dashed">
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Waiting for the agent to report.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-4 py-4">
                <Meter
                  label="CPU"
                  pct={snap.cpu?.usage_pct ?? undefined}
                  sub={`${snap.cpu?.logical_cores ?? '?'} vCPU · load ${snap.cpu?.load1?.toFixed(2) ?? '—'} / ${snap.cpu?.load5?.toFixed(2) ?? '—'} / ${snap.cpu?.load15?.toFixed(2) ?? '—'}`}
                />
                <Meter
                  label="Memory"
                  pct={snap.memory?.used_pct}
                  sub={`${fmtBytes(snap.memory?.used)} / ${fmtBytes(snap.memory?.total)}`}
                />
                <Meter
                  label="Swap"
                  pct={snap.memory?.swap_used_pct}
                  sub={`${fmtBytes(snap.memory?.swap_used)} / ${fmtBytes(snap.memory?.swap_total)}`}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Per-core utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {(snap.cpu?.per_core_pct ?? []).map((c, i) => (
                    <div key={i} className="space-y-1 text-center">
                      <div className="bg-muted relative mx-auto h-16 w-4 overflow-hidden rounded">
                        <div
                          className="bg-primary absolute bottom-0 w-full"
                          style={{ height: `${Math.max(0, Math.min(100, c))}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground text-[10px] tabular-nums">
                        {c.toFixed(0)}
                      </span>
                    </div>
                  ))}
                  {!snap.cpu?.per_core_pct?.length && (
                    <p className="text-muted-foreground col-span-full text-sm">Not reported</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Section title={`Top processes (${snap.processes?.top?.length ?? 0})`}>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className={th}>PID</th>
                  <th className={th}>Name</th>
                  <th className={th}>User</th>
                  <th className={cn(th, 'text-right')}>CPU %</th>
                  <th className={cn(th, 'text-right')}>Memory</th>
                  <th className={cn(th, 'text-right')}>Threads</th>
                  <th className={th}>Command</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {(snap.processes?.top ?? []).map((p) => (
                  <tr key={p.pid}>
                    <td className={cn(td, 'tabular-nums')}>{p.pid}</td>
                    <td className={cn(td, 'font-medium')}>{p.name}</td>
                    <td className={cn(td, 'text-muted-foreground')}>{p.username}</td>
                    <td className={cn(td, 'text-right tabular-nums')}>
                      {p.cpu_pct?.toFixed(1) ?? '—'}
                    </td>
                    <td className={cn(td, 'text-right tabular-nums')}>{fmtBytes(p.rss)}</td>
                    <td className={cn(td, 'text-right tabular-nums')}>{p.num_threads ?? '—'}</td>
                    <td
                      className={cn(td, 'text-muted-foreground max-w-xs truncate font-mono')}
                      title={p.cmdline}
                    >
                      {p.cmdline}
                    </td>
                  </tr>
                ))}
                {!snap.processes?.top?.length && (
                  <tr>
                    <td className={cn(td, 'text-muted-foreground')} colSpan={7}>
                      Process list not reported
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Filesystems">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className={th}>Mount</th>
                    <th className={th}>Type</th>
                    <th className={cn(th, 'text-right')}>Used</th>
                    <th className={cn(th, 'text-right')}>Size</th>
                    <th className={cn(th, 'text-right')}>Use%</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {(snap.disks ?? []).map((d) => (
                    <tr key={d.mountpoint}>
                      <td className={cn(td, 'font-medium')}>{d.mountpoint}</td>
                      <td className={cn(td, 'text-muted-foreground')}>{d.fstype}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>{fmtBytes(d.used)}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>{fmtBytes(d.total)}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>
                        {fmtPct(d.used_pct ?? null, 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="Network interfaces">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className={th}>Interface</th>
                    <th className={cn(th, 'text-right')}>In</th>
                    <th className={cn(th, 'text-right')}>Out</th>
                    <th className={cn(th, 'text-right')}>Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {(snap.network ?? []).map((n) => (
                    <tr key={n.name}>
                      <td className={cn(td, 'font-medium')}>
                        {n.name} {n.up ? '' : <span className="text-muted-foreground">(down)</span>}
                      </td>
                      <td className={cn(td, 'text-right tabular-nums')}>
                        {fmtBytesPerSec(n.rx_bytes_per_s)}
                      </td>
                      <td className={cn(td, 'text-right tabular-nums')}>
                        {fmtBytesPerSec(n.tx_bytes_per_s)}
                      </td>
                      <td className={cn(td, 'text-right tabular-nums')}>
                        {fmtNumber((n.rx_errs_per_s ?? 0) + (n.tx_errs_per_s ?? 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="Listening sockets">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className={th}>Proto</th>
                    <th className={th}>Address</th>
                    <th className={cn(th, 'text-right')}>Port</th>
                    <th className={th}>Process</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {(snap.net_stats?.listening_sockets ?? []).map((s, i) => (
                    <tr key={i}>
                      <td className={td}>{s.proto}</td>
                      <td className={cn(td, 'font-mono')}>{s.addr}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>{s.port}</td>
                      <td className={cn(td, 'text-muted-foreground')}>{s.process}</td>
                    </tr>
                  ))}
                  {!snap.net_stats?.listening_sockets?.length && (
                    <tr>
                      <td className={cn(td, 'text-muted-foreground')} colSpan={4}>
                        Not reported
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            <Section title="Sensors">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className={th}>Sensor</th>
                    <th className={cn(th, 'text-right')}>Temp</th>
                    <th className={cn(th, 'text-right')}>High / Crit</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {(snap.sensors?.temperatures ?? []).map((t, i) => (
                    <tr key={i}>
                      <td className={cn(td, 'font-medium')}>{t.label || t.sensor_key}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>{fmtTemp(t.temp_c)}</td>
                      <td className={cn(td, 'text-muted-foreground text-right tabular-nums')}>
                        {t.high_c || '—'} / {t.crit_c || '—'}
                      </td>
                    </tr>
                  ))}
                  {!snap.sensors?.temperatures?.length && (
                    <tr>
                      <td className={cn(td, 'text-muted-foreground')} colSpan={3}>
                        No sensors reported
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>
          </div>

          {snap.errors && Object.keys(snap.errors).length > 0 && (
            <Card className="border-amber-500/40">
              <CardHeader>
                <CardTitle className="text-sm">Collector warnings</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-1 text-xs">
                {Object.entries(snap.errors).map(([section, message]) => (
                  <p key={section}>
                    <span className="text-foreground font-medium">{section}:</span> {message}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </ServerLayout>
  )
}
