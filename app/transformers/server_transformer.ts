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
      agentPaired: this.resource.agentPaired,
      agentState: this.resource.agentState,
      agentListenUrl: this.resource.agentListenUrl,
      agentVersion: this.resource.agentVersion,
      agentLastReportAt: this.resource.agentLastReportAt
        ? this.resource.agentLastReportAt.toISO()
        : null,
    }
  }
}
