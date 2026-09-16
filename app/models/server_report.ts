import Server from '#models/server'
import { ServerReportSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DaemonReport } from '#services/daemon_protocol'

/**
 * One ingested report from a server's monitoring daemon. Scalar columns are
 * promoted from the snapshot for fast charting; the full document is kept as
 * JSON text in `payload` (use `document` to read it back).
 */
export default class ServerReport extends ServerReportSchema {
  @belongsTo(() => Server)
  declare server: BelongsTo<typeof Server>

  get document(): DaemonReport {
    return JSON.parse(this.payload) as DaemonReport
  }
}
