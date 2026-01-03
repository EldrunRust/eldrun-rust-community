import { useEffect, useRef, useState } from 'react'

export type ForumSSEEvent =
  | { type: 'connected'; userId: string | null }
  | { type: 'ping' }
  | { type: 'demo'; message: string; timestamp: string }
  | { type: 'notification'; data: any }
  | { type: 'thread_update'; data: any }
  | { type: 'typing'; data: any }

export function useForumSSE(onEvent?: (event: ForumSSEEvent) => void) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const connect = () => {
      const es = new EventSource('/api/forum/events')
      eventSourceRef.current = es

      es.onopen = () => {
        setIsConnected(true)
        setLastError(null)
      }

      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as ForumSSEEvent
          onEvent?.(data)
        } catch (e) {
          console.warn('Failed to parse SSE event:', e)
        }
      }

      es.onerror = () => {
        setIsConnected(false)
        setLastError('Verbindung unterbrochen')
        // Auto-reconnect after 3s
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close()
            connect()
          }
        }, 3000)
      }
    }

    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [onEvent])

  return { isConnected, lastError }
}
