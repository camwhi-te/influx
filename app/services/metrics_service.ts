import db from '@adonisjs/lucid/services/db'
import ServerReport from '#models/server_report'
import { DateTime } from 'luxon'
import type { AgentReport } from '#services/agent_protocol'

export const METRIC_RANGES = {
  '1h': { label: 'Last hour', seconds: 3_600, bucketSeconds: 60 },
  '6h': { label: 'Last 6 hours', seconds: 21_600, bucketSeconds: 300 },
  '24h': { label: 'Last 24 hours', seconds: 86_400, bucketSeconds: 900 },
  '7d': { label: 'Last 7 days', seconds: 604_800, bucketSeconds: 3_600 },
  '30d': { label: 'Last 30 days', seconds: 2_592_000, bucketSeconds: 14_400 },
} as const

export type MetricRange = keyof typeof METRIC_RANGES

export function isMetricRange(value: unknown): value is MetricRange {
  return typeof value === 'string' && value in METRIC_RANGES
}

/** Columns averaged over each bucket. */
const AVG_COLUMNS = [
  'cpu_pct',
  'load_1',
  'load_5',
  'load_15',
  'mem_used_pct',
  'swap_used_pct',
  'disk_used_pct',
  'net_rx_bps',
  'net_tx_bps',
  'disk_read_bps',
  'disk_write_bps',
  'cpu_temp_c',
] as const

/** Columns where the bucket peak is more useful than the average. */
const MAX_COLUMNS = ['disk_busy_pct', 'process_count'] as const

export type MetricPoint = { t: string } & Record<
  (typeof AVG_COLUMNS)[number] | (typeof MAX_COLUMNS)[number],
  number | null
>

export interface MetricSummaryStat {
  avg: number | null
  min: number | null
  max: number | null
  p95: number | null
}

export interface MetricSummary {
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

class MetricsService {
  /** Bucketed time-series for the charts. */
  async series(serverId: number, range: MetricRange): Promise<MetricPoint[]> {
    const { seconds, bucketSeconds } = METRIC_RANGES[range]
    const since = DateTime.now().minus({ seconds }).toSQL({ includeOffset: false })!

    const bucketExpr = `CAST(strftime('%s', captured_at) AS INTEGER) / ${bucketSeconds} * ${bucketSeconds}`
    const selects = [
      `${bucketExpr} as t`,
      ...AVG_COLUMNS.map((c) => `AVG(${c}) as ${c}`),
      ...MAX_COLUMNS.map((c) => `MAX(${c}) as ${c}`),
    ]

    const rows = await db
      .from('server_reports')
      .where('server_id', serverId)
      .where('captured_at', '>=', since)
      .groupByRaw('t')
      .orderByRaw('t asc')
      .select(db.raw(selects.join(', ')))

    return rows.map((row: Record<string, number | null>) => {
      const point: Record<string, unknown> = {
        t: DateTime.fromSeconds(Number(row.t)).toISO(),
      }
      for (const c of [...AVG_COLUMNS, ...MAX_COLUMNS]) {
        point[c] = row[c] === null || row[c] === undefined ? null : Number(row[c])
      }
      return point as MetricPoint
    })
  }

  /** Headline aggregates for the analytics tab. */
  async summary(serverId: number, range: MetricRange): Promise<MetricSummary> {
    const { seconds, bucketSeconds } = METRIC_RANGES[range]
    const from = DateTime.now().minus({ seconds })
    const fromSql = from.toSQL({ includeOffset: false })!

    const statColumns = {
      cpuPct: 'cpu_pct',
      memUsedPct: 'mem_used_pct',
      load1: 'load_1',
      netRxBps: 'net_rx_bps',
      netTxBps: 'net_tx_bps',
      cpuTempC: 'cpu_temp_c',
    } as const

    const aggSelects = Object.entries(statColumns).flatMap(([key, col]) => [
      `AVG(${col}) as ${key}_avg`,
      `MIN(${col}) as ${key}_min`,
      `MAX(${col}) as ${key}_max`,
    ])

    const [agg] = await db
      .from('server_reports')
      .where('server_id', serverId)
      .where('captured_at', '>=', fromSql)
      .select(db.raw(`COUNT(*) as report_count, ${aggSelects.join(', ')}`))

    // p95 per column — small result sets, computed in JS.
    const p95: Record<string, number | null> = {}
    for (const [key, col] of Object.entries(statColumns)) {
      const rows = await db
        .from('server_reports')
        .where('server_id', serverId)
        .where('captured_at', '>=', fromSql)
        .whereNotNull(col)
        .orderBy(col, 'asc')
        .select(col)
      p95[key] = percentile(
        rows.map((r: Record<string, number>) => Number(r[col])),
        95
      )
    }

    // Coverage: fraction of buckets that contain at least one report.
    const totalBuckets = Math.max(1, Math.floor(seconds / bucketSeconds))
    const bucketExpr = `CAST(strftime('%s', captured_at) AS INTEGER) / ${bucketSeconds}`
    const [{ filled }] = await db
      .from('server_reports')
      .where('server_id', serverId)
      .where('captured_at', '>=', fromSql)
      .select(db.raw(`COUNT(DISTINCT ${bucketExpr}) as filled`))

    const peak = await db
      .from('server_reports')
      .where('server_id', serverId)
      .where('captured_at', '>=', fromSql)
      .whereNotNull('cpu_pct')
      .orderBy('cpu_pct', 'desc')
      .select('captured_at')
      .first()

    const stats = {} as MetricSummary['stats']
    for (const key of Object.keys(statColumns) as (keyof typeof statColumns)[]) {
      stats[key] = {
        avg: numOrNull(agg[`${key}_avg`]),
        min: numOrNull(agg[`${key}_min`]),
        max: numOrNull(agg[`${key}_max`]),
        p95: p95[key],
      }
    }

    return {
      range,
      from: from.toISO()!,
      to: DateTime.now().toISO()!,
      reportCount: Number(agg.report_count ?? 0),
      coveragePct: Math.min(100, (Number(filled ?? 0) / totalBuckets) * 100),
      peakCpuAt: peak ? toIso(peak.captured_at) : null,
      stats,
    }
  }

  /** Most recent stored report document (used as a fallback for the live view). */
  async latest(serverId: number): Promise<{ capturedAt: string; report: AgentReport } | null> {
    const row = await ServerReport.query()
      .where('serverId', serverId)
      .orderBy('capturedAt', 'desc')
      .first()
    if (!row) return null
    return { capturedAt: row.capturedAt.toISO()!, report: row.document }
  }

  /** Recent daemon events, newest first. */
  async recentEvents(serverId: number, limit = 100) {
    const rows = await ServerReport.query()
      .where('serverId', serverId)
      .orderBy('capturedAt', 'desc')
      .limit(40)

    const events: { at: string; kind: string; detail: string; capturedAt: string }[] = []
    for (const row of rows) {
      for (const ev of row.document.events ?? []) {
        events.push({
          at: ev.at ?? row.capturedAt.toISO()!,
          kind: ev.kind ?? 'unknown',
          detail: ev.detail ?? '',
          capturedAt: row.capturedAt.toISO()!,
        })
      }
    }
    return events.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit)
  }

  /** Deletes stored reports older than `days`. Returns rows removed. */
  async prune(days: number): Promise<number> {
    const cutoff = DateTime.now().minus({ days }).toSQL({ includeOffset: false })!
    const affected = await db.from('server_reports').where('captured_at', '<', cutoff).del()
    return Number(affected)
  }
}

function numOrNull(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function percentile(sorted: number[], p: number): number | null {
  if (!sorted.length) return null
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  return sorted[idx]
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  const dt = DateTime.fromSQL(String(value))
  return dt.isValid ? dt.toISO()! : String(value)
}

export const metricsService = new MetricsService()
