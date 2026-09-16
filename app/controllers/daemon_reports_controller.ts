import ServerReport from '#models/server_report'
import { daemonReportValidator } from '#validators/daemon_report'
import { promoteMetrics, DAEMON_SCHEMA_VERSION, type DaemonReport } from '#services/daemon_protocol'
import { daemonStreamHub } from '#services/daemon_stream_hub'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class DaemonReportsController {
  /**
   * POST /api/daemon/report — ingest one historical report from a daemon.
   * Authenticated by `DaemonAuthMiddleware`. Idempotent on (boot_id, report_seq).
   */
  async store(ctx: HttpContext) {
    const server = ctx.daemonServer!
    const payload = await ctx.request.validateUsing(daemonReportValidator)

    if (payload.schema_version !== DAEMON_SCHEMA_VERSION) {
      logger.warn(
        { serverId: server.id, got: payload.schema_version },
        'daemon report schema version mismatch'
      )
    }

    const report = payload as unknown as DaemonReport
    const metrics = promoteMetrics(report)
    const capturedAt = DateTime.fromISO(metrics.capturedAt)
    const captured = capturedAt.isValid ? capturedAt : DateTime.now()

    const existing = await ServerReport.query()
      .where('serverId', server.id)
      .where('bootId', report.boot_id)
      .where('reportSeq', report.report_seq)
      .first()

    if (!existing) {
      await ServerReport.create({
        serverId: server.id,
        capturedAt: captured,
        bootId: report.boot_id,
        reportSeq: report.report_seq,
        cpuPct: metrics.cpuPct,
        load1: metrics.load1,
        load5: metrics.load5,
        load15: metrics.load15,
        memUsedPct: metrics.memUsedPct,
        swapUsedPct: metrics.swapUsedPct,
        diskUsedPct: metrics.diskUsedPct,
        diskBusyPct: metrics.diskBusyPct,
        netRxBps: metrics.netRxBps,
        netTxBps: metrics.netTxBps,
        diskReadBps: metrics.diskReadBps,
        diskWriteBps: metrics.diskWriteBps,
        cpuTempC: metrics.cpuTempC,
        processCount: metrics.processCount,
        uptimeSeconds: metrics.uptimeSeconds,
        payload: JSON.stringify(report),
      })
    }

    // Advance the server's "last seen" pointer only for a newer sample.
    if (!server.daemonLastReportAt || captured > server.daemonLastReportAt) {
      server.daemonLastReportAt = captured
      server.daemonBootId = report.boot_id
      if (report.daemon_version) server.daemonVersion = report.daemon_version
      await server.save()
    }

    // Feed anyone watching the live view, even when the WS relay is unavailable.
    daemonStreamHub.publishSnapshot(server.id, { ...report.snapshot, type: 'snapshot' })

    return ctx.response.accepted({ ok: true, duplicate: Boolean(existing) })
  }
}
