/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  daemon: {
    report: typeof routes['daemon.report']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  dashboard: typeof routes['dashboard'] & {
    account: typeof routes['dashboard.account']
    settings: typeof routes['dashboard.settings']
  }
  servers: {
    index: typeof routes['servers.index']
    store: typeof routes['servers.store']
    update: typeof routes['servers.update']
    destroy: typeof routes['servers.destroy']
    show: typeof routes['servers.show']
    console: typeof routes['servers.console']
    charts: typeof routes['servers.charts']
    analytics: typeof routes['servers.analytics']
    alerts: typeof routes['servers.alerts']
    events: typeof routes['servers.events']
    actions: typeof routes['servers.actions']
    settings: typeof routes['servers.settings']
    stream: typeof routes['servers.stream']
    daemon: {
      key: typeof routes['servers.daemon.key']
      unpair: typeof routes['servers.daemon.unpair']
      update: typeof routes['servers.daemon.update']
    }
  }
}
