/**
 * Client-side mirror of the influxd snapshot shape (see PROTOCOL.md). Kept
 * loose — every field can be missing when the daemon could not collect it.
 */

export type DaemonHostInfo = {
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
  daemon_version?: string
  tags?: Record<string, string>
  captured_at?: string
  warming_up?: boolean
}

export type DaemonCpu = {
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

export type DaemonMemory = {
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
}

export type DaemonDisk = {
  device?: string
  mountpoint?: string
  fstype?: string
  total?: number
  used?: number
  free?: number
  used_pct?: number
  inodes_used_pct?: number
  readonly?: boolean
}

export type DaemonDiskIo = {
  device?: string
  read_bytes_per_s?: number | null
  write_bytes_per_s?: number | null
  read_ops_per_s?: number | null
  write_ops_per_s?: number | null
  io_time_pct?: number | null
  queue_depth?: number | null
}

export type DaemonNetIf = {
  name?: string
  up?: boolean
  mtu?: number
  speed_mbps?: number
  mac?: string
  addrs?: string[]
  rx_bytes_per_s?: number | null
  tx_bytes_per_s?: number | null
  rx_errs_per_s?: number | null
  tx_errs_per_s?: number | null
  rx_drop_per_s?: number | null
  tx_drop_per_s?: number | null
}

export type DaemonProcess = {
  pid?: number
  ppid?: number
  name?: string
  cmdline?: string
  username?: string
  cpu_pct?: number
  rss?: number
  mem_pct?: number
  num_threads?: number
  num_fds?: number
  status?: string
  create_time?: string
  read_bytes_per_s?: number | null
  write_bytes_per_s?: number | null
}

export type DaemonSnapshot = {
  type?: string
  schema_version?: number
  host?: DaemonHostInfo
  cpu?: DaemonCpu
  memory?: DaemonMemory
  pressure?: Record<string, Record<string, number>>
  disks?: DaemonDisk[]
  disk_io?: DaemonDiskIo[]
  network?: DaemonNetIf[]
  net_stats?: {
    rx_bytes_per_s?: number | null
    tx_bytes_per_s?: number | null
    tcp_by_state?: Record<string, number>
    listening_sockets?: { proto?: string; addr?: string; port?: number; process?: string }[]
    tcp_retrans_segs_per_s?: number | null
  }
  processes?: {
    total_count?: number
    running?: number
    sleeping?: number
    zombie?: number
    thread_count?: number
    top?: DaemonProcess[]
  }
  sensors?: {
    temperatures?: {
      sensor_key?: string
      label?: string
      temp_c?: number
      high_c?: number
      crit_c?: number
    }[]
    fans?: { label?: string; rpm?: number }[]
    battery?: { percent?: number; plugged?: boolean; time_left_min?: number }
  }
  services?: { failed_units?: { unit?: string; active?: string; sub?: string }[] }
  errors?: Record<string, string>
}

export type DaemonReport = {
  schema_version: number
  daemon_version?: string
  report_seq: number
  boot_id: string
  window: { start: string; end: string; sample_count: number }
  rollup?: Record<string, { avg: number; min: number; max: number; last: number }>
  snapshot: DaemonSnapshot
  events?: { at?: string; kind?: string; detail?: string }[]
}

export type LatestReport = { capturedAt: string; report: DaemonReport } | null

/** Frame shapes pushed over the SSE stream by `daemon_stream_hub`. */
export type StreamStatusState =
  'idle' | 'connecting' | 'connected' | 'disconnected' | 'unconfigured'

export type StreamFrame =
  | { type: 'hello'; host: DaemonHostInfo; sample_interval_ms: number; daemon_version: string }
  | ({ type: 'snapshot' } & DaemonSnapshot)
  | { type: 'status'; state: StreamStatusState; detail?: string }
  | { type: 'error'; code?: string; message?: string }
