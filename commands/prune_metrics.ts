import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Deletes agent reports older than the retention window. Run from cron:
 *
 *   node ace metrics:prune
 *
 * The window defaults to METRICS_RETENTION_DAYS (env), or 30 days.
 */
export default class PruneMetrics extends BaseCommand {
  static commandName = 'metrics:prune'
  static description = 'Delete stored agent reports older than the retention window'
  static options: CommandOptions = { startApp: true }

  @flags.number({ description: 'Override the retention window in days' })
  declare days?: number

  async run() {
    const { default: env } = await import('#start/env')
    const { metricsService } = await import('#services/metrics_service')

    const days = this.days ?? env.get('METRICS_RETENTION_DAYS', 30)
    if (!Number.isFinite(days) || days <= 0) {
      this.logger.error(`Invalid retention window: ${days}`)
      this.exitCode = 1
      return
    }

    const removed = await metricsService.prune(days)
    this.logger.success(`Pruned ${removed} report(s) older than ${days} day(s)`)
  }
}
