import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'servers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /** Bearer token the daemon presents on the ingest + stream channels. */
      table.string('agent_key').nullable().unique()
      /** Base URL of the daemon's realtime HTTP server, e.g. https://10.0.0.4:9843 */
      table.string('agent_listen_url').nullable()
      /** Reported by the most recent successful ingest. */
      table.string('agent_version').nullable()
      /** Stable per-OS-boot id from the daemon; used with report_seq to dedupe. */
      table.string('agent_boot_id').nullable()
      /** "captured_at" of the newest report we have stored. */
      table.timestamp('agent_last_report_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('agent_key')
      table.dropColumn('agent_listen_url')
      table.dropColumn('agent_version')
      table.dropColumn('agent_boot_id')
      table.dropColumn('agent_last_report_at')
    })
  }
}
