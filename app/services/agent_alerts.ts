import type Server from '#models/server'
import type { AgentReport } from '#services/agent_protocol'

export type AlertLevel = 'warning' | 'critical'

export interface DerivedAlert {
  level: AlertLevel
  title: string
  detail: string
}

/**
 * Cheap threshold checks over the latest snapshot. This is deliberately not a
 * rules engine — it just surfaces the obvious "something is wrong right now"
 * signals until real alerting lands.
 */
export function deriveAlerts(server: Server, report: AgentReport | null): DerivedAlert[] {
  const alerts: DerivedAlert[] = []

  if (server.agentState === 'offline' && server.agentPaired) {
    alerts.push({
      level: 'critical',
      title: 'Agent offline',
      detail: server.agentLastReportAt
        ? `No report since ${server.agentLastReportAt.toISO()}`
        : 'The daemon has never reported in.',
    })
  } else if (server.agentState === 'stale') {
    alerts.push({
      level: 'warning',
      title: 'Agent reporting late',
      detail: 'Reports are arriving slower than expected.',
    })
  }

  const s = report?.snapshot
  if (!s) return alerts

  for (const disk of s.disks ?? []) {
    if (typeof disk.used_pct !== 'number') continue
    if (disk.used_pct >= 95) {
      alerts.push({
        level: 'critical',
        title: `Disk almost full: ${disk.mountpoint}`,
        detail: `${disk.used_pct.toFixed(1)}% used on ${disk.device ?? disk.mountpoint}`,
      })
    } else if (disk.used_pct >= 85) {
      alerts.push({
        level: 'warning',
        title: `Disk filling up: ${disk.mountpoint}`,
        detail: `${disk.used_pct.toFixed(1)}% used on ${disk.device ?? disk.mountpoint}`,
      })
    }
  }

  const mem = s.memory
  if (typeof mem?.used_pct === 'number' && mem.used_pct >= 92) {
    alerts.push({
      level: 'warning',
      title: 'Memory pressure',
      detail: `${mem.used_pct.toFixed(1)}% of RAM in use`,
    })
  }
  if (typeof mem?.swap_used_pct === 'number' && mem.swap_used_pct >= 25) {
    alerts.push({
      level: 'warning',
      title: 'Swapping heavily',
      detail: `${mem.swap_used_pct.toFixed(1)}% of swap in use`,
    })
  }

  const cores = s.cpu?.logical_cores
  if (typeof s.cpu?.load1 === 'number' && typeof cores === 'number' && cores > 0) {
    if (s.cpu.load1 >= cores * 2) {
      alerts.push({
        level: 'warning',
        title: 'High load average',
        detail: `load1 ${s.cpu.load1.toFixed(2)} on ${cores} cores`,
      })
    }
  }

  for (const t of s.sensors?.temperatures ?? []) {
    if (typeof t.temp_c !== 'number') continue
    const label = t.label || t.sensor_key || 'sensor'
    if (t.crit_c && t.crit_c > 0 && t.temp_c >= t.crit_c) {
      alerts.push({
        level: 'critical',
        title: `Temperature critical: ${label}`,
        detail: `${t.temp_c.toFixed(1)}°C (limit ${t.crit_c}°C)`,
      })
    } else if (t.high_c && t.high_c > 0 && t.temp_c >= t.high_c) {
      alerts.push({
        level: 'warning',
        title: `Temperature high: ${label}`,
        detail: `${t.temp_c.toFixed(1)}°C (threshold ${t.high_c}°C)`,
      })
    }
  }

  for (const unit of s.services?.failed_units ?? []) {
    alerts.push({
      level: 'warning',
      title: `Service failed: ${unit.unit ?? 'unknown'}`,
      detail: `${unit.active ?? ''} / ${unit.sub ?? ''}`.trim(),
    })
  }

  return alerts
}
