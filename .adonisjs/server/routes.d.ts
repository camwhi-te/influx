import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'agent.report': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'servers.index': { paramsTuple?: []; params?: {} }
    'servers.store': { paramsTuple?: []; params?: {} }
    'servers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.console': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.charts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.analytics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.alerts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.events': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.actions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.stream': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.agent.key': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.agent.unpair': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.agent.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.account': { paramsTuple?: []; params?: {} }
    'dashboard.settings': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'servers.index': { paramsTuple?: []; params?: {} }
    'servers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.console': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.charts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.analytics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.alerts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.events': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.actions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.stream': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.account': { paramsTuple?: []; params?: {} }
    'dashboard.settings': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'servers.index': { paramsTuple?: []; params?: {} }
    'servers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.console': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.charts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.analytics': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.alerts': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.events': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.actions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.stream': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.account': { paramsTuple?: []; params?: {} }
    'dashboard.settings': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'agent.report': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'servers.store': { paramsTuple?: []; params?: {} }
    'servers.agent.key': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'servers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.agent.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'servers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'servers.agent.unpair': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}