import { createHmac, timingSafeEqual } from 'node:crypto'
import Server from '#models/server'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Authenticates a monitoring daemon on the `/api/daemon/*` routes.
 *
 * - `Authorization: Bearer <daemon_key>` selects the server and is checked in
 *   constant time.
 * - `X-Signature: sha256=<hex>` must equal HMAC-SHA256 of the raw request body
 *   keyed by the same `daemon_key` (see PROTOCOL.md).
 *
 * On success the resolved server is attached as `ctx.daemonServer` and the raw
 * body string as `ctx.daemonRawBody`.
 */
export default class DaemonAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx

    const header = request.header('authorization') ?? ''
    const presented = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
    if (!presented) {
      return response.unauthorized({ error: 'Missing bearer token' })
    }

    const server = await Server.findBy('daemonKey', presented)
    if (!server || !server.daemonKey || !safeEqual(server.daemonKey, presented)) {
      return response.unauthorized({ error: 'Invalid daemon key' })
    }

    const raw = request.raw() ?? ''
    const signature = (request.header('x-signature') ?? '').replace(/^sha256=/i, '')
    const expected = createHmac('sha256', server.daemonKey).update(raw).digest('hex')
    if (!signature || !safeEqual(signature, expected)) {
      return response.unauthorized({ error: 'Bad signature' })
    }

    ctx.daemonServer = server
    ctx.daemonRawBody = raw

    return next()
  }
}

/** Length-safe, constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    // Still burn a comparison to avoid a trivial length oracle.
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    daemonServer?: Server
    daemonRawBody?: string
  }
}
