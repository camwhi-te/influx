import Server from '#models/server'
import { ServerReportSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { AgentReport } from '#services/agent_protocol'

/**
 * One ingested report from a server's monitoring daemon. Scalar columns are
 * promoted from the snapshot for fast charting; the full document is kept as
 * JSON text in `payload` (use `document` to read it back).
 */
export default class ServerReport extends ServerReportSchema {
  @belongsTo(() => Server)
  declare server: BelongsTo<typeof Server>

  get document(): AgentReport {
    return JSON.parse(this.payload) as AgentReport
  }
}
