import { NextRequest } from 'next/server'
import { optionalUser } from '@/lib/auth'

// Force dynamic rendering for SSE
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const viewer = await optionalUser(request)

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  })

  const encoder = new TextEncoder()
  let keepAliveTimer: NodeJS.Timeout

  const stream = new ReadableStream({
    start(controller) {
      // Helper to send SSE data
      const send = (data: Record<string, unknown>) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(payload))
      }

      // Initial connection event
      send({ type: 'connected', userId: viewer?.userId ?? null })

      // Keep-alive every 30s (recommended for SSE)
      keepAliveTimer = setInterval(() => {
        send({ type: 'ping' })
      }, 30000)

      // In a real implementation, you would:
      // - Subscribe to a message broker (Redis, NATS, etc.)
      // - Listen to database events (Postgres LISTEN/NOTIFY)
      // - Broadcast new notifications, thread updates, typing events
      // For now, we simulate with a simple demo event every 10s
      const demoTimer = setInterval(() => {
        send({
          type: 'demo',
          message: 'Live-Update verfügbar (Demo)',
          timestamp: new Date().toISOString(),
        })
      }, 10000)

      // Cleanup on disconnect
      return () => {
        clearInterval(keepAliveTimer)
        clearInterval(demoTimer)
      }
    },
  })

  return new Response(stream, { headers })
}
