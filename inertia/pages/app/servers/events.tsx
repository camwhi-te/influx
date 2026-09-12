import ServerLayout from '@/layouts/server_layout'
import { Card, CardContent } from '@/components/ui/card'
import { type ServerRecord } from '@/components/server_form_fields'
import { fmtClock, fmtRelative } from '@/lib/metrics'
import { cn } from '@/lib/utils'

type AgentEvent = { at: string; kind: string; detail: string; capturedAt: string }

const KIND_STYLE: Record<string, string> = {
  agent_start: 'bg-primary/15 text-primary',
  oom: 'bg-destructive/15 text-destructive',
  temp_crit: 'bg-destructive/15 text-destructive',
  disk_full: 'bg-destructive/15 text-destructive',
  service_failed: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
}

export default function ServerEvents({
  server,
  events,
}: {
  server: ServerRecord
  events: AgentEvent[]
}) {
  return (
    <ServerLayout server={server}>
      <p className="text-muted-foreground mb-4 text-sm">
        Events reported by the daemon (state changes, restarts, threshold crossings).
      </p>

      {events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            {server.agentPaired
              ? 'No events reported yet.'
              : 'Pair a monitoring agent from the Settings tab.'}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden py-0">
          <ul className="divide-border divide-y">
            {events.map((event, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-3 text-sm">
                <span
                  className={cn(
                    'mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                    KIND_STYLE[event.kind] ?? 'bg-muted text-muted-foreground'
                  )}
                >
                  {event.kind}
                </span>
                <div className="min-w-0">
                  <p className="break-words">{event.detail || '—'}</p>
                  <p className="text-muted-foreground text-xs" title={fmtClock(event.at)}>
                    {fmtRelative(event.at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </ServerLayout>
  )
}
