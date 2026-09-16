import type Server from '#models/server'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ServerTransformer extends BaseTransformer<Server> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'address',
        'location',
        'type',
        'severity',
        'createdAt',
        'updatedAt',
      ]),
      daemonPaired: this.resource.daemonPaired,
      daemonState: this.resource.daemonState,
      daemonListenUrl: this.resource.daemonListenUrl,
      daemonVersion: this.resource.daemonVersion,
      daemonLastReportAt: this.resource.daemonLastReportAt
        ? this.resource.daemonLastReportAt.toISO()
        : null,
    }
  }
}
