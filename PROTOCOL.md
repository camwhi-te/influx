# influxd wire protocol

Schema version: **1**. All payloads are JSON, UTF-8. On the WebSocket channel
exactly one JSON object is sent per frame.

There are two channels:

| Channel        | Direction         | Transport                    | Purpose            |
|----------------|-------------------|------------------------------|--------------------|
| Realtime       | daemon → client    | WebSocket (`/v1/stream`)     | live snapshots     |
| Historical     | daemon → Panel     | HTTP POST (`/api/daemon/report`) | rolled-up reports |

---

## Authentication

Both channels use a bearer token:

```
Authorization: Bearer <token>
```

- The token is compared in **constant time**. A mismatch returns HTTP `401` on
  the REST/upgrade request, or WebSocket close code `4001` once upgraded.
- The realtime server **refuses to start with an empty token** unless
  `--insecure` is passed *and* `listen` is a loopback address.
- `daemon_key` is the single token for both channels. It may be split into
  `stream_token` (realtime) and `push_key` (historical) if desired.

### Historical push signature (HMAC)

Every `POST /api/daemon/report` is signed:

```
X-Signature: sha256=<hex>
```

where `<hex>` is the lowercase hex `HMAC-SHA256(raw_request_body, push_key)`.
The signature is computed over the **exact bytes of the JSON body before any
`Content-Encoding: gzip` compression**. The Panel should recompute and compare
in constant time and reject on mismatch.

Other headers on the push:

```
Authorization: Bearer <push_key>
X-Daemon-Version: <semver>
Content-Type: application/json
Content-Encoding: gzip          (optional; body is gzipped when present)
```

---

## Realtime: WebSocket

```
GET {listen}/v1/stream        Upgrade: websocket ; Authorization: Bearer <token>
```

`permessage-deflate` compression is offered by the server.

### Server → client

**First frame** — `hello`:

```json
{
  "type": "hello",
  "host": {
    "hostname": "web-01",
    "os": "linux",
    "platform": "ubuntu",
    "platform_version": "24.04",
    "kernel_version": "6.8.0-40-generic",
    "arch": "x86_64",
    "virtualization_role": "guest",
    "virtualization_system": "kvm",
    "boot_time": "2026-09-01T09:12:44Z",
    "cpu_model": "AMD Ryzen 9 270",
    "physical_cores": 8,
    "logical_cores": 16,
    "daemon_version": "0.1.0",
    "tags": { "role": "web" }
  },
  "sample_interval_ms": 2000,
  "daemon_version": "0.1.0"
}
```

**Every tick** — `snapshot`: the full Snapshot object (see below) with an added
`"type": "snapshot"` field.

**On error**: `{"type":"error","code":"...","message":"..."}` followed by close.

### Client → server (optional)

```json
{ "type": "set_interval", "ms": 1000 }
```

`ms` is clamped to `[500, 10000]`. Applies to the shared collector loop, so it
affects all connected clients and the reporter cadence.

### Liveness

The server sends a WebSocket ping every 20s and drops a client that misses two
consecutive pongs (~40s).

### Other REST endpoints

| Endpoint            | Auth   | Response |
|---------------------|--------|----------|
| `GET /v1/snapshot`  | Bearer | `200` — a single fresh Snapshot |
| `GET /v1/healthz`   | none   | `200 {"status":"ok","uptime_seconds":N,"version":"..."}` |
| `GET /v1/metrics`   | Bearer | `200` — the daemon's own resource use (goroutines, heap, GC, uptime) |

---

## The Snapshot

One immutable sample per collector tick. Every section runs under `recover()`
and a per-section timeout; a section that fails is **omitted or nulled** and its
message is recorded in the top-level `errors` map — the snapshot as a whole
never fails.

Rate fields (`*_per_s`, `usage_pct`, CPU `times`, …) are computed by diffing
cumulative counters over real elapsed time. On the **first** snapshot after
start they are `null` and `host.warming_up` is `true`. A negative counter delta
(reset/wrap) yields `null` for that field for one tick.

### Sections

- `host` — identity + `captured_at` (RFC3339 UTC), `monotonic_seq`, `warming_up`, `uptime_seconds`, `tags`
- `cpu` — `usage_pct`, `per_core_pct[]`, `times{user,system,idle,iowait,irq,softirq,steal,nice,guest}` (pct of interval), `load1/5/15`, `ctx_switches_per_s`, `interrupts_per_s`
- `memory` — `total/available/used/free/buffers/cached/used_pct`, swap equivalents, and Linux `dirty/writeback/slab/hugepages_*`
- `pressure` — Linux PSI, `some/full` × `avg10/60/300` for `cpu/memory/io`
- `disks[]` — per mount: capacity, `inodes_*`, `readonly`
- `disk_io[]` — per device: `read/write_bytes_per_s`, `read/write_ops_per_s`, `read/write_latency_ms`, `io_time_pct`, `queue_depth`
- `network[]` — per interface: config + `rx/tx_bytes_per_s`, `rx/tx_packets_per_s`, `rx/tx_errs_per_s`, `rx/tx_drop_per_s`
- `net_stats` — aggregate `rx/tx_bytes_per_s`, `tcp_by_state{}`, `listening_sockets[]`, Linux `tcp_retrans_segs_per_s`
- `processes` — counts + `top[]` (union of top-N by CPU and by RSS). `cmdline` is redacted and truncated to 512 bytes
- `sensors` — `temperatures[]`, `fans[]`, `battery`
- `services` — Linux systemd `failed_units[]`
- `errors` — `{ "<section>": "<message>" }`, present only when a section failed

### Example (trimmed lists)

```json
{
  "schema_version": 1,
  "host": {
    "hostname": "web-01", "os": "linux", "platform": "ubuntu",
    "platform_version": "24.04", "kernel_version": "6.8.0-40-generic",
    "arch": "x86_64", "virtualization_role": "guest", "virtualization_system": "kvm",
    "uptime_seconds": 812344, "boot_time": "2026-09-01T09:12:44Z",
    "daemon_version": "0.1.0", "tags": { "role": "web" },
    "captured_at": "2026-09-10T14:03:12.501Z", "monotonic_seq": 41007,
    "warming_up": false
  },
  "cpu": {
    "model": "AMD Ryzen 9 270", "physical_cores": 8, "logical_cores": 16,
    "usage_pct": 7.42, "per_core_pct": [4.1, 9.0, 2.2, 11.8],
    "times": { "user": 5.1, "system": 1.9, "idle": 92.1, "iowait": 0.6,
               "irq": 0.0, "softirq": 0.3, "steal": 0.0, "nice": 0.0, "guest": 0.0 },
    "load1": 0.34, "load5": 0.41, "load15": 0.39,
    "ctx_switches_per_s": 4821.5, "interrupts_per_s": 3110.2
  },
  "memory": {
    "total": 16776000000, "available": 12894000000, "used": 3200000000, "free": 900000000,
    "buffers": 120000000, "cached": 2560000000, "used_pct": 19.1,
    "swap_total": 4294967296, "swap_used": 0, "swap_free": 4294967296, "swap_used_pct": 0,
    "dirty": 356352, "slab": 289100000
  },
  "pressure": {
    "cpu":    { "some_avg10": 0.11, "some_avg60": 0.08, "some_avg300": 0.05,
                "full_avg10": 0, "full_avg60": 0, "full_avg300": 0 }
  },
  "disks": [
    { "device": "/dev/nvme0n1p2", "mountpoint": "/", "fstype": "ext4",
      "total": 500107862016, "used": 213000000000, "free": 261000000000,
      "used_pct": 44.9, "inodes_total": 31088640, "inodes_used": 812004,
      "inodes_free": 30276636, "inodes_used_pct": 2.61, "readonly": false }
  ],
  "disk_io": [
    { "device": "nvme0n1", "read_bytes_per_s": 40960, "write_bytes_per_s": 315392,
      "read_ops_per_s": 3, "write_ops_per_s": 22, "read_latency_ms": 0.31,
      "write_latency_ms": 0.88, "io_time_pct": 1.4, "queue_depth": 0 }
  ],
  "network": [
    { "name": "eth0", "up": true, "mtu": 1500, "mac": "52:54:00:ab:cd:ef",
      "addrs": ["10.0.0.14/24"], "rx_bytes_per_s": 88200, "tx_bytes_per_s": 42110,
      "rx_packets_per_s": 91, "tx_packets_per_s": 77, "rx_errs_per_s": 0,
      "tx_errs_per_s": 0, "rx_drop_per_s": 0, "tx_drop_per_s": 0 }
  ],
  "net_stats": {
    "rx_bytes_per_s": 88200, "tx_bytes_per_s": 42110,
    "tcp_by_state": { "ESTABLISHED": 24, "LISTEN": 7, "TIME_WAIT": 3 },
    "listening_sockets": [ { "proto": "tcp", "addr": "0.0.0.0", "port": 443, "pid": 981, "process": "nginx" } ],
    "tcp_retrans_segs_per_s": 0
  },
  "processes": {
    "total_count": 214, "running": 1, "sleeping": 210, "zombie": 0, "thread_count": 883,
    "top": [
      { "pid": 981, "ppid": 1, "name": "nginx", "cmdline": "nginx: worker process",
        "username": "www-data", "cpu_pct": 3.1, "rss": 41123840, "vms": 210000000,
        "mem_pct": 0.25, "num_threads": 2, "num_fds": 34, "status": "S",
        "create_time": "2026-09-01T09:13:02Z", "read_bytes_per_s": 0, "write_bytes_per_s": 1024 }
    ]
  },
  "sensors": {
    "temperatures": [ { "sensor_key": "k10temp", "label": "k10temp", "temp_c": 46.2, "high_c": 0, "crit_c": 0 } ]
  }
}
```

> Run `influxd oneshot` for a byte-accurate example on your own host.

---

## Historical: the Report

```
POST {panel_url}/api/daemon/report
```

```json
{
  "schema_version": 1,
  "daemon_version": "0.1.0",
  "report_seq": 128,
  "boot_id": "6f3d2b1a-1c9e-4a77-8b0c-2f5e9d0a1b23",
  "window": { "start": "2026-09-10T14:00:00Z", "end": "2026-09-10T14:00:30Z", "sample_count": 15 },
  "rollup": {
    "cpu.usage_pct":            { "avg": 7.9,  "min": 3.1,  "max": 22.4, "last": 6.2 },
    "cpu.load1":                { "avg": 0.36, "min": 0.30, "max": 0.51, "last": 0.34 },
    "mem.used_pct":             { "avg": 19.0, "min": 18.7, "max": 19.4, "last": 19.1 },
    "swap.used_pct":            { "avg": 0, "min": 0, "max": 0, "last": 0 },
    "net.rx_bytes_per_s":       { "avg": 81000, "min": 4200, "max": 220000, "last": 88200 },
    "net.tx_bytes_per_s":       { "avg": 39000, "min": 1100, "max": 110000, "last": 42110 },
    "disk.read_bytes_per_s":    { "avg": 22000, "min": 0, "max": 190000, "last": 40960 },
    "disk.write_bytes_per_s":   { "avg": 260000, "min": 40000, "max": 900000, "last": 315392 },
    "disk.busy_pct_max":        { "avg": 2.1, "min": 0.3, "max": 9.9, "last": 1.4 },
    "sensors.cpu_temp_c":       { "avg": 45.8, "min": 44.1, "max": 47.9, "last": 46.2 }
  },
  "snapshot": { "...": "the most recent full Snapshot" },
  "events": [
    { "at": "2026-09-10T14:00:00Z", "kind": "daemon_start", "detail": "0.1.0 (commit abc1234, built ...)" }
  ]
}
```

`event.kind` is one of `disk_full | temp_crit | oom | service_failed |
daemon_start`. The list is best-effort and may be empty.

### Responses & delivery guarantees

| Panel response      | Daemon behaviour                                   |
|---------------------|--------------------------------------------------|
| `202` (or `200`)    | success — report acknowledged                     |
| `4xx`               | drop the report, log a warning, do not retry      |
| `5xx` / timeout / network error | buffer to disk and retry          |

Delivery is **at-least-once**:

- Failed reports are written to `buffer_dir` as gzipped files in a ring capped
  at `buffer_max_bytes` (default 64 MiB); the oldest are evicted first.
- Retries use exponential backoff with full jitter: `1s → … → 5m` ceiling.
- On startup the daemon flushes buffered reports **oldest-first** before sending
  new ones.
- `report_seq` is monotonic per daemon process and `boot_id` is stable per OS
  boot (Linux `/proc/sys/kernel/random/boot_id`, else random per process) — the
  Panel should dedupe on `(boot_id, report_seq)`.

---

## Panel integration (implemented)

The Panel (AdonisJS) side of this protocol is built:

**Storage**

- `servers` gained `daemon_key` (unique), `daemon_listen_url`, `daemon_version`,
  `daemon_boot_id`, `daemon_last_report_at`.
- `server_reports` stores every ingested report: `server_id`, `captured_at`,
  `boot_id`, `report_seq`, the full `payload` (JSON text), and promoted scalar
  columns for charting (`cpu_pct`, `load_1/5/15`, `mem_used_pct`,
  `swap_used_pct`, `disk_used_pct`, `disk_busy_pct`, `net_rx_bps`, `net_tx_bps`,
  `disk_read_bps`, `disk_write_bps`, `cpu_temp_c`, `process_count`,
  `uptime_seconds`). Unique `(server_id, boot_id, report_seq)` for idempotent
  ingest; index `(server_id, captured_at)`.

**Ingest** — `POST /api/daemon/report` (no session; `DaemonAuthMiddleware` does
bearer + constant-time key match + `X-Signature` HMAC). Validates the envelope,
dedupes on `(boot_id, report_seq)`, promotes scalars from the snapshot, advances
`daemon_last_report_at`/`daemon_version` for newer samples, and fans the snapshot
to any live viewers. Returns `202`. (Gzip request bodies are not yet accepted —
the daemon's `Content-Encoding: gzip` is opt-in and off by default.)

**Realtime relay** — `daemon_stream_hub` opens one WS to
`{daemon_listen_url}/v1/stream` per server, shared by all viewers, lazily and
with reconnect/backoff. The browser consumes it over SSE at
`GET /app/servers/:id/stream` (`status` / `hello` / `snapshot` frames). With no
`daemon_listen_url` set, historical data still flows and the ingest path pushes
snapshots to viewers.

**UI** — per-server tabs under `/app/servers/:id`: Overview (live tiles +
sparklines), Charts (Recharts time-series, `?range=1h..30d`), Analytics
(aggregates + coverage), Console (live snapshot: processes, sockets, sensors,
per-core), Alerts (threshold checks over the latest snapshot), Events (daemon
`events[]`). Pairing (generate/rotate key, set realtime URL, install snippet,
unpair) lives on the Settings tab.

**Retention** — `node ace metrics:prune` deletes reports older than
`METRICS_RETENTION_DAYS` (env, default 30). Wire it to cron/a scheduled agent.
