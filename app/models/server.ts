import User from '#models/user'
import ServerReport from '#models/server_report'
import { ServerSchema } from '#database/schema'
import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

/**
 * A machine tracked for status monitoring. The "type" and "severity" fields
 * drive how the background monitor treats the server (added later).
 */
export const SERVER_TYPES = ['http', 'ssh', 'game', 'dedicated', 'database', 'other'] as const
export const SERVER_SEVERITIES = ['low', 'medium', 'high'] as const

export type ServerType = (typeof SERVER_TYPES)[number]
export type ServerSeverity = (typeof SERVER_SEVERITIES)[number]

/** A server counts as "online" if it reported within this window. */
export const AGENT_ONLINE_WINDOW_SECONDS = 120

export type AgentConnectionState = 'unpaired' | 'online' | 'stale' | 'offline'

export default class Server extends ServerSchema {
  /** Never expose the bearer token through generic serialization. */
  @column({ serializeAs: null })
  declare agentKey: string | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => ServerReport)
  declare reports: HasMany<typeof ServerReport>

  get agentPaired(): boolean {
    return this.agentKey !== null
  }

  get agentState(): AgentConnectionState {
    if (!this.agentKey) return 'unpaired'
    if (!this.agentLastReportAt) return 'offline'
    const age = DateTime.now().diff(this.agentLastReportAt, 'seconds').seconds
    if (age <= AGENT_ONLINE_WINDOW_SECONDS) return 'online'
    if (age <= AGENT_ONLINE_WINDOW_SECONDS * 5) return 'stale'
    return 'offline'
  }
}
