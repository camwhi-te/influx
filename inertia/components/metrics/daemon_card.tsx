import { useState } from 'react'
import { Form } from '@adonisjs/inertia/react'
import { CopyIcon, CheckIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AGENT_STATE_META, fmtRelative } from '@/lib/metrics'
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

export function AgentCard({
  server,
  agentKey,
  retentionDays,
  reportCount,
}: {
  server: ServerRecord
  agentKey: string | null
  retentionDays: number
  reportCount: number
}) {
  const [revealed, setRevealed] = useState(false)
  const stateMeta = AGENT_STATE_META[server.agentState] ?? AGENT_STATE_META.unpaired
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const configSnippet = [
    '# /etc/influx-agent/config.toml',
    `panel_url = "${origin}"`,
    `agent_key = "${agentKey ?? '<generate a key first>'}"`,
    'listen = "0.0.0.0:9843"',
    'sample_interval = "2s"',
    'report_interval = "30s"',
  ].join('\n')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring agent</CardTitle>
        <CardDescription>
          Pair the influx-agent daemon with {server.name} to collect metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className={cn('flex items-center gap-1.5 font-medium', stateMeta.text)}>
            <span className={cn('size-2 rounded-full', stateMeta.dot)} aria-hidden />
            {stateMeta.label}
          </span>
          <span className="text-muted-foreground">
            Last report {fmtRelative(server.agentLastReportAt)}
          </span>
          {server.agentVersion && (
            <span className="text-muted-foreground">Agent v{server.agentVersion}</span>
          )}
          <span className="text-muted-foreground">
            {reportCount.toLocaleString()} reports stored · {retentionDays}-day retention
          </span>
        </div>

        {!agentKey ? (
          <Form route="servers.agent.key" routeParams={{ id: server.id }}>
            {({ processing }) => (
              <Button type="submit" disabled={processing}>
                Generate agent key
              </Button>
            )}
          </Form>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="agent-key">Agent key</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="agent-key"
                  readOnly
                  value={revealed ? agentKey : '•'.repeat(24)}
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
                <CopyButton text={agentKey} label="Copy key" />
              </div>
              <p className="text-muted-foreground text-xs">
                Treat this like a password — it authenticates the daemon&apos;s reports and live
                stream.
              </p>
            </div>

            <Form
              route="servers.agent.update"
              routeParams={{ id: server.id }}
              className="space-y-2"
            >
              {({ errors, processing }) => (
                <>
                  <Label htmlFor="agentListenUrl">Realtime URL (for the live view)</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="agentListenUrl"
                      name="agentListenUrl"
                      defaultValue={server.agentListenUrl ?? ''}
                      placeholder="http://10.0.0.4:9843"
                      className="max-w-xs"
                    />
                    <Button type="submit" variant="outline" size="sm" disabled={processing}>
                      Save
                    </Button>
                  </div>
                  {errors.agentListenUrl && (
                    <p className="text-destructive text-xs">{errors.agentListenUrl}</p>
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
                Then run <code className="font-mono">influx-agent run</code>. See{' '}
                <code className="font-mono">AGENT.md</code> for the full protocol.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Form route="servers.agent.key" routeParams={{ id: server.id }}>
                {({ processing }) => (
                  <Button type="submit" variant="outline" size="sm" disabled={processing}>
                    Rotate key
                  </Button>
                )}
              </Form>
              <Form route="servers.agent.unpair" routeParams={{ id: server.id }}>
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
