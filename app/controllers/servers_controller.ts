import Server from '#models/server'
import ServerReport from '#models/server_report'
import ServerTransformer from '#transformers/server_transformer'
import { createServerValidator, updateServerValidator } from '#validators/server'
import {
  metricsService,
  METRIC_RANGES,
  isMetricRange,
  type MetricRange,
} from '#services/metrics_service'
import { deriveAlerts } from '#services/agent_alerts'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'

const RANGE_OPTIONS = Object.entries(METRIC_RANGES).map(([value, { label }]) => ({
  value: value as MetricRange,
  label,
}))

/**
 * CRUD for the machines a user monitors, plus the per-server monitoring
 * views (Overview, Console, Charts, ...). Every query is scoped to the
 * authenticated user, so one account can never see or mutate another's
 * servers.
 */
export default class ServersController {
  /**
   * Base query scoped to the servers owned by the current user.
   */
  private query({ auth }: HttpContext) {
    return Server.query().where('userId', auth.user!.id)
  }

  /**
   * Loads a single owned server or throws a 404.
   */
  private findServer(ctx: HttpContext) {
    return this.query(ctx).where('id', ctx.params.id).firstOrFail()
  }

  /**
   * Renders a per-server monitoring tab with the server as a shared prop.
   */
  private async renderTab(
    ctx: HttpContext,
    page: Parameters<HttpContext['inertia']['render']>[0],
    props: Record<string, unknown> = {}
  ) {
    const server = await this.findServer(ctx)

    return ctx.inertia.render(page, {
      server: ServerTransformer.transform(server),
      ...props,
    })
  }

  async index(ctx: HttpContext) {
    const servers = await this.query(ctx).orderBy('name', 'asc')

    return ctx.inertia.render('app/servers', {
      servers: ServerTransformer.transform(servers),
    })
  }

  async store(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(createServerValidator)

    await Server.create({ ...payload, userId: ctx.auth.user!.id })

    ctx.session.flash('success', 'Server added.')
    return ctx.response.redirect().toRoute('servers.index')
  }

  async update(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const payload = await ctx.request.validateUsing(updateServerValidator)

    await server.merge(payload).save()

    ctx.session.flash('success', 'Server updated.')
    return ctx.response.redirect().toRoute('servers.settings', { id: server.id })
  }

  async destroy(ctx: HttpContext) {
    const server = await this.findServer(ctx)

    await server.delete()

    ctx.session.flash('success', 'Server removed.')
    return ctx.response.redirect().toRoute('servers.index')
  }

  /*
  |----------------------------------------------------------------------
  | Per-server monitoring tabs
  |----------------------------------------------------------------------
  */

  private rangeFrom(ctx: HttpContext, fallback: MetricRange): MetricRange {
    const q = ctx.request.input('range')
    return isMetricRange(q) ? q : fallback
  }

  async show(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const [latest, series] = await Promise.all([
      metricsService.latest(server.id),
      metricsService.series(server.id, '1h'),
    ])

    return ctx.inertia.render('app/servers/overview', {
      server: ServerTransformer.transform(server),
      latest,
      series,
    })
  }

  async console(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const latest = await metricsService.latest(server.id)

    return ctx.inertia.render('app/servers/console', {
      server: ServerTransformer.transform(server),
      latest,
    })
  }

  async charts(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const range = this.rangeFrom(ctx, '6h')
    const series = await metricsService.series(server.id, range)

    return ctx.inertia.render('app/servers/charts', {
      server: ServerTransformer.transform(server),
      range,
      ranges: RANGE_OPTIONS,
      series,
    })
  }

  async analytics(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const range = this.rangeFrom(ctx, '24h')
    const summary = await metricsService.summary(server.id, range)

    return ctx.inertia.render('app/servers/analytics', {
      server: ServerTransformer.transform(server),
      range,
      ranges: RANGE_OPTIONS,
      summary,
    })
  }

  async alerts(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const latest = await metricsService.latest(server.id)

    return ctx.inertia.render('app/servers/alerts', {
      server: ServerTransformer.transform(server),
      alerts: deriveAlerts(server, latest?.report ?? null),
      capturedAt: latest?.capturedAt ?? null,
    })
  }

  async events(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const events = await metricsService.recentEvents(server.id)

    return ctx.inertia.render('app/servers/events', {
      server: ServerTransformer.transform(server),
      events,
    })
  }

  async actions(ctx: HttpContext) {
    return this.renderTab(ctx, 'app/servers/actions')
  }

  async settings(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const reportCount = await ServerReport.query()
      .where('serverId', server.id)
      .count('* as total')
      .first()

    return ctx.inertia.render('app/servers/settings', {
      server: ServerTransformer.transform(server),
      agentKey: server.agentKey,
      retentionDays: env.get('METRICS_RETENTION_DAYS', 30),
      reportCount: Number(reportCount?.$extras.total ?? 0),
    })
  }
}
