export const METRIC_RANGES = ['1h', '6h', '24h', '7d', '30d'] as const
export type MetricRange = (typeof METRIC_RANGES)[number]

export type RangeOption = { value: MetricRange; label: string }

export type MetricPoint = {
  t: string
  cpu_pct: number | null
  load_1: number | null
  load_5: number | null
  load_15: number | null
  mem_used_pct: number | null
  swap_used_pct: number | null
  disk_used_pct: number | null
  disk_busy_pct: number | null
  net_rx_bps: number | null
  net_tx_bps: number | null
  disk_read_bps: number | null
  disk_write_bps: number | null
  cpu_temp_c: number | null
  process_count: number | null
}

export type MetricSummaryStat = {
  avg: number | null
  min: number | null
  max: number | null
  p95: number | null
}

export type MetricSummary = {
  range: MetricRange
  from: string
  to: string
  reportCount: number
  coveragePct: number
  peakCpuAt: string | null
  stats: Record<
    'cpuPct' | 'memUsedPct' | 'load1' | 'netRxBps' | 'netTxBps' | 'cpuTempC',
    MetricSummaryStat
  >
}

/* -------------------------------------------------------------------------- */
/* Formatters                                                                  */
/* -------------------------------------------------------------------------- */

export function fmtPct(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return `${n.toFixed(digits)}%`
}

export function fmtNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat().format(Math.round(n))
}

export function fmtBytes(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let v = Math.abs(n)
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

export function fmtBitsPerSec(bytesPerSec: number | null | undefined): string {
  if (bytesPerSec === null || bytesPerSec === undefined || Number.isNaN(bytesPerSec)) return '—'
  const bits = bytesPerSec * 8
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps']
  let v = bits
  let i = 0
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000
    i++
  }
  return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

export function fmtBytesPerSec(n: number | null | undefined): string {
  return n === null || n === undefined || Number.isNaN(n) ? '—' : `${fmtBytes(n)}/s`
}

export function fmtTemp(c: number | null | undefined): string {
  if (c === null || c === undefined || Number.isNaN(c)) return '—'
  return `${c.toFixed(0)}°C`
}

export function fmtDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${Math.floor(seconds)}s`
}

export function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return 'never'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'never'
  const diff = Math.round((Date.now() - then) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function fmtClock(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

/** X-axis tick label appropriate for the selected range. */
export function axisTimeLabel(iso: string, range: MetricRange): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  if (range === '7d' || range === '30d') {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export const DAEMON_STATE_META: Record<string, { label: string; dot: string; text: string }> = {
  online: {
    label: 'Online',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  stale: { label: 'Stale', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  offline: { label: 'Offline', dot: 'bg-destructive', text: 'text-destructive' },
  unpaired: { label: 'Not paired', dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
}
