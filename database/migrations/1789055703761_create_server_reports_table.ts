import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'server_reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('server_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('servers')
        .onDelete('CASCADE')

      /** Instant the sample was taken on the monitored host (report window end). */
      table.timestamp('captured_at').notNullable()
      /** Daemon bookkeeping, unique together for idempotent ingest. */
      table.string('boot_id').notNullable()
      table.integer('report_seq').notNullable()

      /**
       * Scalar columns promoted from the snapshot for fast time-series queries.
       * Nullable: a section may be missing or still warming up.
       */
      table.float('cpu_pct').nullable()
      table.float('load_1').nullable()
      table.float('load_5').nullable()
      table.float('load_15').nullable()
      table.float('mem_used_pct').nullable()
      table.float('swap_used_pct').nullable()
      table.float('disk_used_pct').nullable()
      table.float('disk_busy_pct').nullable()
      table.float('net_rx_bps').nullable()
      table.float('net_tx_bps').nullable()
      table.float('disk_read_bps').nullable()
      table.float('disk_write_bps').nullable()
      table.float('cpu_temp_c').nullable()
      table.integer('process_count').nullable()
      table.integer('uptime_seconds').nullable()

      /** Full report document (envelope + rollup + snapshot + events) as JSON text. */
      table.text('payload', 'longtext').notNullable()

      table.timestamp('created_at').notNullable()

      table.unique(['server_id', 'boot_id', 'report_seq'])
      table.index(['server_id', 'captured_at'], 'server_reports_series_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
