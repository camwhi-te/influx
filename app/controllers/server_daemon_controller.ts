import { randomBytes } from 'node:crypto'
import { PassThrough } from 'node:stream'
import Server from '#models/server'
import { agentSettingsValidator } from '#validators/server'
import { agentStreamHub } from '#services/agent_stream_hub'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Pairing + live stream for a server's monitoring daemon. All routes are
 * scoped to the authenticated owner.
 */
export default class ServerAgentController {
  private findServer(ctx: HttpContext) {
    return Server.query()
      .where('userId', ctx.auth.user!.id)
      .where('id', ctx.params.id)
      .firstOrFail()
  }

  /** Create or rotate the agent key. */
  async generateKey(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const rotated = server.agentPaired

    server.agentKey = randomBytes(32).toString('base64url')
    server.agentBootId = null
    await server.save()

    ctx.session.flash('success', rotated ? 'Agent key rotated.' : 'Agent key generated.')
    return ctx.response.redirect().toRoute('servers.settings', { id: server.id })
  }

  /** Forget the daemon: clears the key, URL and last-seen pointer. Keeps history. */
  async unpair(ctx: HttpContext) {
    const server = await this.findServer(ctx)

    server.agentKey = null
    server.agentListenUrl = null
    server.agentVersion = null
    server.agentBootId = null
    server.agentLastReportAt = null
    await server.save()

    ctx.session.flash('success', 'Agent unpaired.')
    return ctx.response.redirect().toRoute('servers.settings', { id: server.id })
  }

  /** Update the daemon's realtime URL (used by the live-view relay). */
  async update(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const { agentListenUrl } = await ctx.request.validateUsing(agentSettingsValidator)

    server.agentListenUrl = agentListenUrl
    await server.save()

    ctx.session.flash('success', 'Agent settings saved.')
    return ctx.response.redirect().toRoute('servers.settings', { id: server.id })
  }

  /**
   * GET /app/servers/:id/stream — Server-Sent Events bridge to the daemon's
   * WebSocket. Emits `status`, `hello` and `snapshot` frames as `data:` lines.
   */
  async stream(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const { response, request } = ctx

    const stream = new PassThrough()
    response.header('Content-Type', 'text/event-stream')
    response.header('Cache-Control', 'no-cache, no-transform')
    response.header('Connection', 'keep-alive')
    response.header('X-Accel-Buffering', 'no')
    response.stream(stream)

    const write = (payload: string) => {
      if (!stream.writableEnded) stream.write(payload)
    }
    write(': open\n\n')

    const unsubscribe = agentStreamHub.subscribe(server, (frame) => {
      write(`data: ${JSON.stringify(frame)}\n\n`)
    })
    const heartbeat = setInterval(() => write(': hb\n\n'), 25_000)

    let done = false
    const cleanup = () => {
      if (done) return
      done = true
      clearInterval(heartbeat)
      unsubscribe()
      if (!stream.writableEnded) stream.end()
    }
    request.request.on('close', cleanup)
    stream.on('close', cleanup)
    stream.on('error', cleanup)
  }
}
