import { AlertTriangleIcon, CheckCircle2Icon, BellRingIcon } from 'lucide-react'

import ServerLayout from '@/layouts/server_layout'
import { Card, CardContent } from '@/components/ui/card'
import { type ServerRecord } from '@/components/server_form_fields'
import { fmtRelative } from '@/lib/metrics'
import { cn } from '@/lib/utils'

type DerivedAlert = { level: 'warning' | 'critical'; title: string; detail: string }

export default function ServerAlerts({
  server,
  alerts,
  capturedAt,
}: {
  server: ServerRecord
  alerts: DerivedAlert[]
  capturedAt: string | null
}) {
  return (
    <ServerLayout server={server}>
      <p className="text-muted-foreground mb-4 text-sm">
        Threshold checks over the latest snapshot
        {capturedAt ? ` · ${fmtRelative(capturedAt)}` : ''}. A full rule engine comes later.
      </p>

      {!server.agentPaired ? (
        <Card className="border-dashed">
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Pair a monitoring agent from the Settings tab to evaluate alerts.
          </CardContent>
        </Card>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <CheckCircle2Icon className="size-8 text-emerald-500" />
            <p className="font-medium">All clear</p>
            <p className="text-muted-foreground text-sm">
              No thresholds are being crossed right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert, i) => (
            <Card
              key={i}
              className={cn(
                alert.level === 'critical' ? 'border-destructive/50' : 'border-amber-500/50'
              )}
            >
              <CardContent className="flex items-start gap-3 py-4">
                {alert.level === 'critical' ? (
                  <AlertTriangleIcon className="text-destructive mt-0.5 size-5 shrink-0" />
                ) : (
                  <BellRingIcon className="mt-0.5 size-5 shrink-0 text-amber-500" />
                )}
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-muted-foreground text-sm">{alert.detail}</p>
                </div>
                <span
                  className={cn(
                    'ml-auto rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    alert.level === 'critical'
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  )}
                >
                  {alert.level}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ServerLayout>
  )
}
