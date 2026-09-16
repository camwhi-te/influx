import { useState } from 'react'
import { Form } from '@adonisjs/inertia/react'
import { CopyIcon, CheckIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DAEMON_STATE_META, fmtRelative } from '@/lib/metrics'
import { type ServerRecord } from '@/components/server_form_fields'
import { cn } from '@/lib/utils'

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Copied' : label}
    </Button>
  )
}

export function DaemonCard({
  server,
  daemonKey,
  retentionDays,
  reportCount,
}: {
  server: ServerRecord
  daemonKey: string | null
  retentionDays: number
  reportCount: number
}) {
  const [revealed, setRevealed] = useState(false)
  const stateMeta = DAEMON_STATE_META[server.daemonState] ?? DAEMON_STATE_META.unpaired
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const configSnippet = [
    '# /etc/influxd/config.toml',
    `panel_url = "${origin}"`,
    `daemon_key = "${daemonKey ?? '<generate a key first>'}"`,
    'listen = "0.0.0.0:9843"',
    'sample_interval = "2s"',
    'report_interval = "30s"',
  ].join('\n')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring daemon</CardTitle>
        <CardDescription>
          Pair the influxd daemon with {server.name} to collect metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className={cn('flex items-center gap-1.5 font-medium', stateMeta.text)}>
            <span className={cn('size-2 rounded-full', stateMeta.dot)} aria-hidden />
            {stateMeta.label}
          </span>
          <span className="text-muted-foreground">
            Last report {fmtRelative(server.daemonLastReportAt)}
          </span>
          {server.daemonVersion && (
            <span className="text-muted-foreground">Daemon v{server.daemonVersion}</span>
          )}
          <span className="text-muted-foreground">
            {reportCount.toLocaleString()} reports stored · {retentionDays}-day retention
          </span>
        </div>

        {!daemonKey ? (
          <Form route="servers.daemon.key" routeParams={{ id: server.id }}>
            {({ processing }) => (
              <Button type="submit" disabled={processing}>
                Generate daemon key
              </Button>
            )}
          </Form>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="daemon-key">Daemon key</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="daemon-key"
                  readOnly
                  value={revealed ? daemonKey : '•'.repeat(24)}
                  className="max-w-xs font-mono"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRevealed((v) => !v)}
                >
                  {revealed ? <EyeOffIcon /> : <EyeIcon />}
                  {revealed ? 'Hide' : 'Reveal'}
                </Button>
                <CopyButton text={daemonKey} label="Copy key" />
              </div>
              <p className="text-muted-foreground text-xs">
                Treat this like a password — it authenticates the daemon&apos;s reports and live
                stream.
              </p>
            </div>

            <Form
              route="servers.daemon.update"
              routeParams={{ id: server.id }}
              className="space-y-2"
            >
              {({ errors, processing }) => (
                <>
                  <Label htmlFor="daemonListenUrl">Realtime URL (for the live view)</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="daemonListenUrl"
                      name="daemonListenUrl"
                      defaultValue={server.daemonListenUrl ?? ''}
                      placeholder="http://10.0.0.4:9843"
                      className="max-w-xs"
                    />
                    <Button type="submit" variant="outline" size="sm" disabled={processing}>
                      Save
                    </Button>
                  </div>
                  {errors.daemonListenUrl && (
                    <p className="text-destructive text-xs">{errors.daemonListenUrl}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Where the Panel can reach the daemon&apos;s HTTP server. Leave blank if the
                    daemon only pushes reports (historical data still works).
                  </p>
                </>
              )}
            </Form>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Daemon config</Label>
                <CopyButton text={configSnippet} label="Copy config" />
              </div>
              <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">{configSnippet}</pre>
              <p className="text-muted-foreground text-xs">
                Then run <code className="font-mono">influxd run</code>. See{' '}
                <code className="font-mono">PROTOCOL.md</code> for the full protocol.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Form route="servers.daemon.key" routeParams={{ id: server.id }}>
                {({ processing }) => (
                  <Button type="submit" variant="outline" size="sm" disabled={processing}>
                    Rotate key
                  </Button>
                )}
              </Form>
              <Form route="servers.daemon.unpair" routeParams={{ id: server.id }}>
                {({ processing }) => (
                  <Button type="submit" variant="ghost" size="sm" disabled={processing}>
                    Unpair
                  </Button>
                )}
              </Form>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
