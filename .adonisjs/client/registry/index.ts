/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'agent.report': {
    methods: ["POST"],
    pattern: '/api/agent/report',
    tokens: [{"old":"/api/agent/report","type":0,"val":"api","end":""},{"old":"/api/agent/report","type":0,"val":"agent","end":""},{"old":"/api/agent/report","type":0,"val":"report","end":""}],
    types: placeholder as Registry['agent.report']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/app',
    tokens: [{"old":"/app","type":0,"val":"app","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'servers.index': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers',
    tokens: [{"old":"/app/servers","type":0,"val":"app","end":""},{"old":"/app/servers","type":0,"val":"servers","end":""}],
    types: placeholder as Registry['servers.index']['types'],
  },
  'servers.store': {
    methods: ["POST"],
    pattern: '/app/servers',
    tokens: [{"old":"/app/servers","type":0,"val":"app","end":""},{"old":"/app/servers","type":0,"val":"servers","end":""}],
    types: placeholder as Registry['servers.store']['types'],
  },
  'servers.update': {
    methods: ["PUT"],
    pattern: '/app/servers/:id',
    tokens: [{"old":"/app/servers/:id","type":0,"val":"app","end":""},{"old":"/app/servers/:id","type":0,"val":"servers","end":""},{"old":"/app/servers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['servers.update']['types'],
  },
  'servers.destroy': {
    methods: ["DELETE"],
    pattern: '/app/servers/:id',
    tokens: [{"old":"/app/servers/:id","type":0,"val":"app","end":""},{"old":"/app/servers/:id","type":0,"val":"servers","end":""},{"old":"/app/servers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['servers.destroy']['types'],
  },
  'servers.show': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id',
    tokens: [{"old":"/app/servers/:id","type":0,"val":"app","end":""},{"old":"/app/servers/:id","type":0,"val":"servers","end":""},{"old":"/app/servers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['servers.show']['types'],
  },
  'servers.console': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id/console',
    tokens: [{"old":"/app/servers/:id/console","type":0,"val":"app","end":""},{"old":"/app/servers/:id/console","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/console","type":1,"val":"id","end":""},{"old":"/app/servers/:id/console","type":0,"val":"console","end":""}],
    types: placeholder as Registry['servers.console']['types'],
  },
  'servers.charts': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id/charts',
    tokens: [{"old":"/app/servers/:id/charts","type":0,"val":"app","end":""},{"old":"/app/servers/:id/charts","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/charts","type":1,"val":"id","end":""},{"old":"/app/servers/:id/charts","type":0,"val":"charts","end":""}],
    types: placeholder as Registry['servers.charts']['types'],
  },
  'servers.analytics': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id/analytics',
    tokens: [{"old":"/app/servers/:id/analytics","type":0,"val":"app","end":""},{"old":"/app/servers/:id/analytics","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/analytics","type":1,"val":"id","end":""},{"old":"/app/servers/:id/analytics","type":0,"val":"analytics","end":""}],
    types: placeholder as Registry['servers.analytics']['types'],
  },
  'servers.alerts': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id/alerts',
    tokens: [{"old":"/app/servers/:id/alerts","type":0,"val":"app","end":""},{"old":"/app/servers/:id/alerts","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/alerts","type":1,"val":"id","end":""},{"old":"/app/servers/:id/alerts","type":0,"val":"alerts","end":""}],
    types: placeholder as Registry['servers.alerts']['types'],
  },
  'servers.events': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id/events',
    tokens: [{"old":"/app/servers/:id/events","type":0,"val":"app","end":""},{"old":"/app/servers/:id/events","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/events","type":1,"val":"id","end":""},{"old":"/app/servers/:id/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['servers.events']['types'],
  },
  'servers.actions': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id/actions',
    tokens: [{"old":"/app/servers/:id/actions","type":0,"val":"app","end":""},{"old":"/app/servers/:id/actions","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/actions","type":1,"val":"id","end":""},{"old":"/app/servers/:id/actions","type":0,"val":"actions","end":""}],
    types: placeholder as Registry['servers.actions']['types'],
  },
  'servers.settings': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id/settings',
    tokens: [{"old":"/app/servers/:id/settings","type":0,"val":"app","end":""},{"old":"/app/servers/:id/settings","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/settings","type":1,"val":"id","end":""},{"old":"/app/servers/:id/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['servers.settings']['types'],
  },
  'servers.stream': {
    methods: ["GET","HEAD"],
    pattern: '/app/servers/:id/stream',
    tokens: [{"old":"/app/servers/:id/stream","type":0,"val":"app","end":""},{"old":"/app/servers/:id/stream","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/stream","type":1,"val":"id","end":""},{"old":"/app/servers/:id/stream","type":0,"val":"stream","end":""}],
    types: placeholder as Registry['servers.stream']['types'],
  },
  'servers.agent.key': {
    methods: ["POST"],
    pattern: '/app/servers/:id/agent/key',
    tokens: [{"old":"/app/servers/:id/agent/key","type":0,"val":"app","end":""},{"old":"/app/servers/:id/agent/key","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/agent/key","type":1,"val":"id","end":""},{"old":"/app/servers/:id/agent/key","type":0,"val":"agent","end":""},{"old":"/app/servers/:id/agent/key","type":0,"val":"key","end":""}],
    types: placeholder as Registry['servers.agent.key']['types'],
  },
  'servers.agent.unpair': {
    methods: ["DELETE"],
    pattern: '/app/servers/:id/agent/key',
    tokens: [{"old":"/app/servers/:id/agent/key","type":0,"val":"app","end":""},{"old":"/app/servers/:id/agent/key","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/agent/key","type":1,"val":"id","end":""},{"old":"/app/servers/:id/agent/key","type":0,"val":"agent","end":""},{"old":"/app/servers/:id/agent/key","type":0,"val":"key","end":""}],
    types: placeholder as Registry['servers.agent.unpair']['types'],
  },
  'servers.agent.update': {
    methods: ["PUT"],
    pattern: '/app/servers/:id/agent',
    tokens: [{"old":"/app/servers/:id/agent","type":0,"val":"app","end":""},{"old":"/app/servers/:id/agent","type":0,"val":"servers","end":""},{"old":"/app/servers/:id/agent","type":1,"val":"id","end":""},{"old":"/app/servers/:id/agent","type":0,"val":"agent","end":""}],
    types: placeholder as Registry['servers.agent.update']['types'],
  },
  'dashboard.account': {
    methods: ["GET","HEAD"],
    pattern: '/app/account',
    tokens: [{"old":"/app/account","type":0,"val":"app","end":""},{"old":"/app/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['dashboard.account']['types'],
  },
  'dashboard.settings': {
    methods: ["GET","HEAD"],
    pattern: '/app/settings',
    tokens: [{"old":"/app/settings","type":0,"val":"app","end":""},{"old":"/app/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['dashboard.settings']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
