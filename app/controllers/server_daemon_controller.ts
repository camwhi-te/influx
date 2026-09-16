import { randomBytes } from 'node:crypto'
import { PassThrough } from 'node:stream'
import Server from '#models/server'
import { daemonSettingsValidator } from '#validators/server'
import { daemonStreamHub } from '#services/daemon_stream_hub'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Pairing + live stream for a server's monitoring daemon. All routes are
 * scoped to the authenticated owner.
 */
export default class ServerDaemonController {
  private findServer(ctx: HttpContext) {
    return Server.query()
      .where('userId', ctx.auth.user!.id)
      .where('id', ctx.params.id)
      .firstOrFail()
  }

  /** Create or rotate the daemon key. */
  async generateKey(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const rotated = server.daemonPaired

    server.daemonKey = randomBytes(32).toString('base64url')
    server.daemonBootId = null
    await server.save()

    ctx.session.flash('success', rotated ? 'Daemon key rotated.' : 'Daemon key generated.')
    return ctx.response.redirect().toRoute('servers.settings', { id: server.id })
  }

  /** Forget the daemon: clears the key, URL and last-seen pointer. Keeps history. */
  async unpair(ctx: HttpContext) {
    const server = await this.findServer(ctx)

    server.daemonKey = null
    server.daemonListenUrl = null
    server.daemonVersion = null
    server.daemonBootId = null
    server.daemonLastReportAt = null
    await server.save()

    ctx.session.flash('success', 'Daemon unpaired.')
    return ctx.response.redirect().toRoute('servers.settings', { id: server.id })
  }

  /** Update the daemon's realtime URL (used by the live-view relay). */
  async update(ctx: HttpContext) {
    const server = await this.findServer(ctx)
    const { daemonListenUrl } = await ctx.request.validateUsing(daemonSettingsValidator)

    server.daemonListenUrl = daemonListenUrl
    await server.save()

    ctx.session.flash('success', 'Daemon settings saved.')
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

    const unsubscribe = daemonStreamHub.subscribe(server, (frame) => {
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
