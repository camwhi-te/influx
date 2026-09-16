import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * The monitoring daemon was renamed from "influx-agent" to "influxd"; its
 * wire protocol followed suit (see PROTOCOL.md). Renaming these columns to
 * match keeps the schema aligned with the client's naming.
 */
export default class extends BaseSchema {
  protected tableName = 'servers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('agent_key', 'daemon_key')
      table.renameColumn('agent_listen_url', 'daemon_listen_url')
      table.renameColumn('agent_version', 'daemon_version')
      table.renameColumn('agent_boot_id', 'daemon_boot_id')
      table.renameColumn('agent_last_report_at', 'daemon_last_report_at')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('daemon_key', 'agent_key')
      table.renameColumn('daemon_listen_url', 'agent_listen_url')
      table.renameColumn('daemon_version', 'agent_version')
      table.renameColumn('daemon_boot_id', 'agent_boot_id')
      table.renameColumn('daemon_last_report_at', 'agent_last_report_at')
    })
  }
}
