import { useEffect, useRef, useState } from 'react'

import type { DaemonHostInfo, DaemonSnapshot, StreamFrame, StreamStatusState } from '@/lib/daemon'

export type StreamConnection = StreamStatusState | 'error'

export interface ServerStreamState {
  connection: StreamConnection
  detail?: string
  host?: DaemonHostInfo
  sampleIntervalMs?: number
  snapshot?: DaemonSnapshot
  updatedAt?: number
}

/**
 * Subscribes to the Panel's SSE bridge for a server (`/app/servers/:id/stream`),
 * which relays the daemon's realtime WebSocket. Reconnection is handled by the
 * browser's EventSource.
 */
export function useServerStream(serverId: number, enabled = true): ServerStreamState {
  const [state, setState] = useState<ServerStreamState>({ connection: 'connecting' })
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled) return

    const es = new EventSource(`/app/servers/${serverId}/stream`)
    esRef.current = es

    es.onmessage = (event) => {
      let frame: StreamFrame
      try {
        frame = JSON.parse(event.data) as StreamFrame
      } catch {
        return
      }

      setState((prev) => {
        switch (frame.type) {
          case 'status':
            return { ...prev, connection: frame.state, detail: frame.detail }
          case 'hello':
            return {
              ...prev,
              host: frame.host,
              sampleIntervalMs: frame.sample_interval_ms,
            }
          case 'snapshot': {
            const { type, ...snapshot } = frame
            return { ...prev, snapshot, updatedAt: Date.now() }
          }
          case 'error':
            return { ...prev, connection: 'error', detail: frame.message }
          default:
            return prev
        }
      })
    }

    es.onerror = () => {
      setState((prev) => ({
        ...prev,
        connection: prev.connection === 'connected' ? 'connecting' : prev.connection,
      }))
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [serverId, enabled])

  return state
}
