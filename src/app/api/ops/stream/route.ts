export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import prisma from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return new Response('Missing code', { status: 400 })
  }

  const session = await prisma.opsSession.findUnique({ where: { code } })
  if (!session) {
    return new Response('Session not found', { status: 404 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      const sendPing = () => {
        controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`))
      }

      const snapshot = async () => {
        const [pins, roles, alerts, resources] = await Promise.all([
          prisma.opsPin.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: 'desc' }, take: 100 }),
          prisma.opsRoleAssignment.findMany({ where: { sessionId: session.id }, orderBy: { role: 'asc' } }),
          prisma.opsAlert.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
          prisma.opsResourceEvent.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
        ])
        const resourceTotals = resources.reduce<Record<string, number>>((acc, ev) => {
          acc[ev.resource] = (acc[ev.resource] || 0) + ev.delta
          return acc
        }, {})
        send({ type: 'snapshot', pins, roles, alerts, resources, resourceTotals })
      }

      await snapshot()
      sendPing()

      let lastAt = new Date(Date.now() - 10_000)

      const interval = setInterval(() => {
        void (async () => {
          try {
            const latest = await prisma.opsAlert.findFirst({
              where: { sessionId: session.id, createdAt: { gt: lastAt } },
              orderBy: { createdAt: 'desc' },
            })
            if (latest) lastAt = latest.createdAt
            await snapshot()
          } catch {
            sendPing()
          }
        })()
      }, 2500)

      const close = () => {
        clearInterval(interval)
        controller.close()
      }

      req.signal.addEventListener('abort', close)
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
