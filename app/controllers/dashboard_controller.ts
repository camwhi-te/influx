import type { HttpContext } from '@adonisjs/core/http'

/**
 * Serves the authenticated area of the app. Each method renders an Inertia
 * page under "inertia/pages/app". Data is currently mocked — swap these for
 * real models/services as features land.
 */
export default class DashboardController {
  async index({ inertia }: HttpContext) {
    return inertia.render('app/dashboard', {
      stats: [
        { label: 'Servers', value: '8', hint: '2 added this month' },
        { label: 'Avg. CPU load', value: '34%', hint: 'Across all online servers' },
        { label: 'Deploys (7d)', value: '19', hint: '100% success rate' },
        { label: 'Open incidents', value: '0', hint: 'All systems operational' },
      ],
      activity: [
        { id: 1, text: 'Deploy #1487 finished on api-eu-1', time: '12m ago' },
        { id: 2, text: 'web-us-2 scaled to 4 vCPU', time: '1h ago' },
        { id: 3, text: 'New SSH key added by you', time: '3h ago' },
        { id: 4, text: 'db-us-1 backup completed', time: 'Yesterday' },
      ],
    })
  }

  async account({ inertia }: HttpContext) {
    return inertia.render('app/account', {})
  }

  async settings({ inertia }: HttpContext) {
    return inertia.render('app/settings', {})
  }
}
