import { cn } from '@/lib/utils'
import type { StreamConnection } from '@/hooks/use_server_stream'

const META: Record<StreamConnection, { label: string; dot: string; text: string }> = {
  connected: {
    label: 'Live',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  connecting: {
    label: 'Connecting',
    dot: 'bg-amber-500 animate-pulse',
    text: 'text-muted-foreground',
  },
  disconnected: { label: 'Reconnecting', dot: 'bg-amber-500', text: 'text-muted-foreground' },
  unconfigured: {
    label: 'No agent URL',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
  idle: { label: 'Idle', dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
  error: { label: 'Stream error', dot: 'bg-destructive', text: 'text-destructive' },
}

export function ConnectionBadge({
  connection,
  detail,
  className,
}: {
  connection: StreamConnection
  detail?: string
  className?: string
}) {
  const meta = META[connection] ?? META.idle
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium', meta.text, className)}
      title={detail}
    >
      <span className={cn('size-2 rounded-full', meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}
