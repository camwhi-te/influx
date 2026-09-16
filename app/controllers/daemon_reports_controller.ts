import ServerReport from '#models/server_report'
import { agentReportValidator } from '#validators/agent_report'
import { promoteMetrics, AGENT_SCHEMA_VERSION, type AgentReport } from '#services/agent_protocol'
import { agentStreamHub } from '#services/agent_stream_hub'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class AgentReportsController {
  /**
   * POST /api/agent/report — ingest one historical report from a daemon.
   * Authenticated by `AgentAuthMiddleware`. Idempotent on (boot_id, report_seq).
   */
  async store(ctx: HttpContext) {
    const server = ctx.agentServer!
    const payload = await ctx.request.validateUsing(agentReportValidator)

    if (payload.schema_version !== AGENT_SCHEMA_VERSION) {
      logger.warn(
        { serverId: server.id, got: payload.schema_version },
        'agent report schema version mismatch'
      )
    }

    const report = payload as unknown as AgentReport
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
    if (!server.agentLastReportAt || captured > server.agentLastReportAt) {
      server.agentLastReportAt = captured
      server.agentBootId = report.boot_id
      if (report.agent_version) server.agentVersion = report.agent_version
      await server.save()
    }

    // Feed anyone watching the live view, even when the WS relay is unavailable.
    agentStreamHub.publishSnapshot(server.id, { ...report.snapshot, type: 'snapshot' })

    return ctx.response.accepted({ ok: true, duplicate: Boolean(existing) })
  }
}
