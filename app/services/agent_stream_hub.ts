import { WebSocket } from 'ws'
import logger from '@adonisjs/core/services/logger'
import type Server from '#models/server'
import type { AgentSnapshot } from '#services/agent_protocol'

export type StreamFrame =
  | { type: 'hello'; [k: string]: unknown }
  | { type: 'snapshot'; [k: string]: unknown }
  | { type: 'status'; state: UpstreamState; detail?: string }
  | { type: 'error'; code?: string; message?: string }

export type UpstreamState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'unconfigured'

type Listener = (frame: StreamFrame) => void

const RECONNECT_MIN_MS = 1_000
const RECONNECT_MAX_MS = 30_000
const LINGER_MS = 30_000
const IDLE_TERMINATE_MS = 60_000

interface Entry {
  serverId: number
  listenUrl: string | null
  token: string | null
  listeners: Set<Listener>
  ws?: WebSocket
  state: UpstreamState
  hello?: StreamFrame
  lastSnapshot?: StreamFrame
  reconnectAttempts: number
  reconnectTimer?: NodeJS.Timeout
  lingerTimer?: NodeJS.Timeout
  idleTimer?: NodeJS.Timeout
}

/**
 * Bridges each server's daemon WebSocket (`{agent_listen_url}/v1/stream`) to the
 * browser. One upstream connection per server is shared by every viewer (SSE
 * listener); it is opened lazily on the first viewer and closed a while after
 * the last one leaves. `publishSnapshot` also lets the ingest path push frames
 * when the daemon is not directly reachable.
 */
class AgentStreamHub {
  private entries = new Map<number, Entry>()

  subscribe(server: Server, listener: Listener): () => void {
    const entry = this.entryFor(server)
    entry.listeners.add(listener)

    if (entry.lingerTimer) {
      clearTimeout(entry.lingerTimer)
      entry.lingerTimer = undefined
    }

    // Paint the new viewer immediately with whatever we already know.
    listener({ type: 'status', state: entry.state })
    if (entry.hello) listener(entry.hello)
    if (entry.lastSnapshot) listener(entry.lastSnapshot)

    if (!entry.listenUrl || !entry.token) {
      entry.state = 'unconfigured'
      listener({ type: 'status', state: 'unconfigured' })
    } else if (!entry.ws) {
      this.connect(entry)
    }

    return () => {
      entry.listeners.delete(listener)
      if (entry.listeners.size === 0) this.scheduleLinger(entry)
    }
  }

  /** Push a snapshot from outside the WS path (e.g. a freshly ingested report). */
  publishSnapshot(serverId: number, snapshot: AgentSnapshot & { type?: string }) {
    const entry = this.entries.get(serverId)
    if (!entry) return
    const frame = { ...snapshot, type: 'snapshot' } as StreamFrame
    entry.lastSnapshot = frame
    this.fanOut(entry, frame)
  }

  private entryFor(server: Server): Entry {
    let entry = this.entries.get(server.id)
    if (!entry) {
      entry = {
        serverId: server.id,
        listenUrl: server.agentListenUrl,
        token: server.agentKey,
        listeners: new Set(),
        state: 'idle',
        reconnectAttempts: 0,
      }
      this.entries.set(server.id, entry)
    } else {
      // Pick up rotated keys / changed URLs between viewings.
      entry.listenUrl = server.agentListenUrl
      entry.token = server.agentKey
    }
    return entry
  }

  private connect(entry: Entry) {
    if (!entry.listenUrl || !entry.token) return
    if (entry.reconnectTimer) {
      clearTimeout(entry.reconnectTimer)
      entry.reconnectTimer = undefined
    }

    let url: string
    try {
      url = toStreamUrl(entry.listenUrl)
    } catch {
      entry.state = 'unconfigured'
      this.fanOut(entry, { type: 'status', state: 'unconfigured', detail: 'Invalid agent URL' })
      return
    }

    entry.state = 'connecting'
    this.fanOut(entry, { type: 'status', state: 'connecting' })

    const ws = new WebSocket(url, {
      headers: { authorization: `Bearer ${entry.token}` },
      handshakeTimeout: 10_000,
      perMessageDeflate: true,
    })
    entry.ws = ws

    const armIdle = () => {
      if (entry.idleTimer) clearTimeout(entry.idleTimer)
      entry.idleTimer = setTimeout(() => ws.terminate(), IDLE_TERMINATE_MS)
    }

    ws.on('open', () => {
      entry.state = 'connected'
      entry.reconnectAttempts = 0
      armIdle()
      this.fanOut(entry, { type: 'status', state: 'connected' })
    })

    ws.on('message', (data) => {
      armIdle()
      let frame: StreamFrame
      try {
        frame = JSON.parse(data.toString()) as StreamFrame
      } catch {
        return
      }
      if (frame.type === 'hello') entry.hello = frame
      if (frame.type === 'snapshot') entry.lastSnapshot = frame
      this.fanOut(entry, frame)
    })

    ws.on('ping', armIdle)

    ws.on('close', (code) => {
      if (entry.idleTimer) clearTimeout(entry.idleTimer)
      if (entry.ws === ws) entry.ws = undefined
      entry.state = 'disconnected'
      this.fanOut(entry, { type: 'status', state: 'disconnected', detail: `closed ${code}` })
      if (entry.listeners.size > 0) this.scheduleReconnect(entry)
    })

    ws.on('error', (err) => {
      logger.debug({ serverId: entry.serverId, err: err.message }, 'agent stream upstream error')
      // 'close' fires next and handles reconnect.
    })
  }

  private scheduleReconnect(entry: Entry) {
    if (entry.reconnectTimer) return
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_MIN_MS * 2 ** entry.reconnectAttempts)
    entry.reconnectAttempts++
    const jitter = Math.random() * 0.3 * delay
    entry.reconnectTimer = setTimeout(() => {
      entry.reconnectTimer = undefined
      if (entry.listeners.size > 0) this.connect(entry)
    }, delay + jitter)
  }

  private scheduleLinger(entry: Entry) {
    if (entry.reconnectTimer) {
      clearTimeout(entry.reconnectTimer)
      entry.reconnectTimer = undefined
    }
    if (entry.lingerTimer) clearTimeout(entry.lingerTimer)
    entry.lingerTimer = setTimeout(() => {
      entry.ws?.close()
      entry.ws = undefined
      entry.state = 'idle'
      this.entries.delete(entry.serverId)
    }, LINGER_MS)
  }

  private fanOut(entry: Entry, frame: StreamFrame) {
    for (const listener of entry.listeners) {
      try {
        listener(frame)
      } catch {
        /* a broken SSE writer is cleaned up by its own close handler */
      }
    }
  }
}

/** Turns `https://host:9843` (or `http://…`) into `wss://host:9843/v1/stream`. */
function toStreamUrl(base: string): string {
  const u = new URL(base)
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
  u.pathname = u.pathname.replace(/\/+$/, '') + '/v1/stream'
  return u.toString()
}

export const agentStreamHub = new AgentStreamHub()
