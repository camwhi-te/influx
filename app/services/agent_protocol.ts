/**
 * TypeScript mirror of the influx-agent wire protocol (schema version 1).
 * See AGENT.md for the authoritative definition. Every field is optional on
 * read: the daemon omits or nulls any section that failed to collect.
 */

export const AGENT_SCHEMA_VERSION = 1

export type Rollup = { avg: number; min: number; max: number; last: number }

export interface AgentHostInfo {
  hostname?: string
  os?: string
  platform?: string
  platform_version?: string
  kernel_version?: string
  arch?: string
  virtualization_role?: string
  virtualization_system?: string
  uptime_seconds?: number
  boot_time?: string
  cpu_model?: string
  physical_cores?: number
  logical_cores?: number
  agent_version?: string
  tags?: Record<string, string>
  captured_at?: string
  monotonic_seq?: number
  warming_up?: boolean
}

export interface AgentCpu {
  model?: string
  physical_cores?: number
  logical_cores?: number
  usage_pct?: number | null
  per_core_pct?: number[]
  times?: Record<string, number | null>
  load1?: number | null
  load5?: number | null
  load15?: number | null
  ctx_switches_per_s?: number | null
  interrupts_per_s?: number | null
}

export interface AgentMemory {
  total?: number
  available?: number
  used?: number
  free?: number
  buffers?: number
  cached?: number
  used_pct?: number
  swap_total?: number
  swap_used?: number
  swap_free?: number
  swap_used_pct?: number
  dirty?: number
  writeback?: number
  slab?: number
}

export interface AgentDisk {
  device?: string
  mountpoint?: string
  fstype?: string
  total?: number
  used?: number
  free?: number
  used_pct?: number
  inodes_total?: number
  inodes_used?: number
  inodes_free?: number
  inodes_used_pct?: number
  readonly?: boolean
}

export interface AgentDiskIo {
  device?: string
  read_bytes_per_s?: number | null
  write_bytes_per_s?: number | null
  read_ops_per_s?: number | null
  write_ops_per_s?: number | null
  read_latency_ms?: number | null
  write_latency_ms?: number | null
  io_time_pct?: number | null
  queue_depth?: number | null
}

export interface AgentNetIf {
  name?: string
  up?: boolean
  mtu?: number
  speed_mbps?: number
  mac?: string
  addrs?: string[]
  rx_bytes_per_s?: number | null
  tx_bytes_per_s?: number | null
  rx_packets_per_s?: number | null
  tx_packets_per_s?: number | null
  rx_errs_per_s?: number | null
  tx_errs_per_s?: number | null
  rx_drop_per_s?: number | null
  tx_drop_per_s?: number | null
}

export interface AgentListeningSocket {
  proto?: string
  addr?: string
  port?: number
  pid?: number
  process?: string
}

export interface AgentNetStats {
  rx_bytes_per_s?: number | null
  tx_bytes_per_s?: number | null
  tcp_by_state?: Record<string, number>
  listening_sockets?: AgentListeningSocket[]
  tcp_retrans_segs_per_s?: number | null
}

export interface AgentProcess {
  pid?: number
  ppid?: number
  name?: string
  cmdline?: string
  username?: string
  cpu_pct?: number
  rss?: number
  vms?: number
  mem_pct?: number
  num_threads?: number
  num_fds?: number
  status?: string
  create_time?: string
  read_bytes_per_s?: number | null
  write_bytes_per_s?: number | null
}

export interface AgentProcesses {
  total_count?: number
  running?: number
  sleeping?: number
  zombie?: number
  thread_count?: number
  top?: AgentProcess[]
}

export interface AgentTemperature {
  sensor_key?: string
  label?: string
  temp_c?: number
  high_c?: number
  crit_c?: number
}

export interface AgentSensors {
  temperatures?: AgentTemperature[]
  fans?: { label?: string; rpm?: number }[]
  battery?: { percent?: number; plugged?: boolean; time_left_min?: number }
}

export interface AgentPressureAxis {
  some_avg10?: number
  some_avg60?: number
  some_avg300?: number
  full_avg10?: number
  full_avg60?: number
  full_avg300?: number
}

export interface AgentSnapshot {
  type?: 'snapshot'
  schema_version?: number
  host?: AgentHostInfo
  cpu?: AgentCpu
  memory?: AgentMemory
  pressure?: Record<string, Record<string, number>>
  disks?: AgentDisk[]
  disk_io?: AgentDiskIo[]
  network?: AgentNetIf[]
  net_stats?: AgentNetStats
  processes?: AgentProcesses
  sensors?: AgentSensors
  services?: { failed_units?: { unit?: string; active?: string; sub?: string }[] }
  errors?: Record<string, string>
}

export interface AgentHello {
  type: 'hello'
  host: AgentHostInfo
  sample_interval_ms: number
  agent_version: string
}

export interface AgentReportEvent {
  at?: string
  kind?: 'disk_full' | 'temp_crit' | 'oom' | 'service_failed' | 'agent_start' | string
  detail?: string
}

export interface AgentReport {
  schema_version: number
  agent_version?: string
  report_seq: number
  boot_id: string
  window: { start: string; end: string; sample_count: number }
  rollup?: Record<string, Rollup>
  snapshot: AgentSnapshot
  events?: AgentReportEvent[]
}

/**
 * Scalar values promoted onto `server_reports` columns for fast time-series
 * queries. Derived from the snapshot (instantaneous, point-in-time) so the
 * stored series lines up with `captured_at`.
 */
export interface PromotedMetrics {
  capturedAt: string
  cpuPct: number | null
  load1: number | null
  load5: number | null
  load15: number | null
  memUsedPct: number | null
  swapUsedPct: number | null
  diskUsedPct: number | null
  diskBusyPct: number | null
  netRxBps: number | null
  netTxBps: number | null
  diskReadBps: number | null
  diskWriteBps: number | null
  cpuTempC: number | null
  processCount: number | null
  uptimeSeconds: number | null
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function sum(values: (number | null | undefined)[]): number | null {
  const present = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  return present.length ? present.reduce((a, b) => a + b, 0) : null
}

function max(values: (number | null | undefined)[]): number | null {
  const present = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  return present.length ? Math.max(...present) : null
}

/** Picks the busiest real filesystem for a single "disk usage" headline number. */
function rootDiskUsedPct(disks: AgentDisk[] | undefined): number | null {
  if (!disks?.length) return null
  const real = disks.filter((d) => !d.readonly && typeof d.used_pct === 'number')
  const pool = real.length ? real : disks
  return max(pool.map((d) => d.used_pct)) ?? null
}

function hottestSensor(sensors: AgentSensors | undefined): number | null {
  const temps = sensors?.temperatures ?? []
  if (!temps.length) return null
  // Prefer a CPU-package style sensor, otherwise the hottest reading.
  const cpuish = temps.find((t) =>
    /cpu|package|k10|coretemp|tctl|tdie/i.test(t.label ?? t.sensor_key ?? '')
  )
  return num(cpuish?.temp_c) ?? max(temps.map((t) => t.temp_c))
}

/**
 * Extracts the promoted scalar metrics from a report's snapshot. Missing
 * sections yield nulls rather than throwing.
 */
export function promoteMetrics(report: AgentReport): PromotedMetrics {
  const s = report.snapshot ?? ({} as AgentSnapshot)
  const capturedAt = s.host?.captured_at ?? report.window?.end ?? new Date().toISOString()

  return {
    capturedAt,
    cpuPct: num(s.cpu?.usage_pct),
    load1: num(s.cpu?.load1),
    load5: num(s.cpu?.load5),
    load15: num(s.cpu?.load15),
    memUsedPct: num(s.memory?.used_pct),
    swapUsedPct: num(s.memory?.swap_used_pct),
    diskUsedPct: rootDiskUsedPct(s.disks),
    diskBusyPct: max((s.disk_io ?? []).map((d) => d.io_time_pct)),
    netRxBps:
      num(s.net_stats?.rx_bytes_per_s) ?? sum((s.network ?? []).map((n) => n.rx_bytes_per_s)),
    netTxBps:
      num(s.net_stats?.tx_bytes_per_s) ?? sum((s.network ?? []).map((n) => n.tx_bytes_per_s)),
    diskReadBps: sum((s.disk_io ?? []).map((d) => d.read_bytes_per_s)),
    diskWriteBps: sum((s.disk_io ?? []).map((d) => d.write_bytes_per_s)),
    cpuTempC: hottestSensor(s.sensors),
    processCount: num(s.processes?.total_count),
    uptimeSeconds: num(s.host?.uptime_seconds),
  }
}
