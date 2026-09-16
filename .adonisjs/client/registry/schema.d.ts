/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daemon.report': {
    methods: ["POST"]
    pattern: '/api/daemon/report'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/daemon_report').daemonReportValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/daemon_report').daemonReportValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daemon_reports_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daemon_reports_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/app'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'servers.index': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['index']>>>
    }
  }
  'servers.store': {
    methods: ["POST"]
    pattern: '/app/servers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/server').createServerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/server').createServerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'servers.update': {
    methods: ["PUT"]
    pattern: '/app/servers/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/server').updateServerValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/server').updateServerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'servers.destroy': {
    methods: ["DELETE"]
    pattern: '/app/servers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['destroy']>>>
    }
  }
  'servers.show': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['show']>>>
    }
  }
  'servers.console': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id/console'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['console']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['console']>>>
    }
  }
  'servers.charts': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id/charts'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['charts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['charts']>>>
    }
  }
  'servers.analytics': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id/analytics'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['analytics']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['analytics']>>>
    }
  }
  'servers.alerts': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id/alerts'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['alerts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['alerts']>>>
    }
  }
  'servers.events': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id/events'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['events']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['events']>>>
    }
  }
  'servers.actions': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id/actions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['actions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['actions']>>>
    }
  }
  'servers.settings': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id/settings'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['settings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/servers_controller').default['settings']>>>
    }
  }
  'servers.stream': {
    methods: ["GET","HEAD"]
    pattern: '/app/servers/:id/stream'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/server_daemon_controller').default['stream']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/server_daemon_controller').default['stream']>>>
    }
  }
  'servers.daemon.key': {
    methods: ["POST"]
    pattern: '/app/servers/:id/daemon/key'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/server_daemon_controller').default['generateKey']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/server_daemon_controller').default['generateKey']>>>
    }
  }
  'servers.daemon.unpair': {
    methods: ["DELETE"]
    pattern: '/app/servers/:id/daemon/key'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/server_daemon_controller').default['unpair']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/server_daemon_controller').default['unpair']>>>
    }
  }
  'servers.daemon.update': {
    methods: ["PUT"]
    pattern: '/app/servers/:id/daemon'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/server').daemonSettingsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/server').daemonSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/server_daemon_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/server_daemon_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dashboard.account': {
    methods: ["GET","HEAD"]
    pattern: '/app/account'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['account']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['account']>>>
    }
  }
  'dashboard.settings': {
    methods: ["GET","HEAD"]
    pattern: '/app/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['settings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['settings']>>>
    }
  }
}
