// SSE streaming endpoint - must be dynamic
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationStream = !isProdDeployment && process.env.SIMULATION_MODE === 'true'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const useDb = hasDb

const TYPES = ['kill', 'raid', 'airdrop', 'helicopter', 'cargo', 'build', 'destroy', 'join', 'leave'] as const

type EventType = (typeof TYPES)[number]

function randomEvent(): Record<string, unknown> {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)] as EventType
  return {
    id: `sse-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    message: `Live ${type} event`,
    players: [`player-${Math.floor(Math.random() * 9000)}`],
    location: {
      x: Math.floor(Math.random() * 8000),
      y: Math.floor(Math.random() * 8000),
    },
    timestamp: new Date().toISOString(),
  }
}

export async function GET(req: Request) {
  const encoder = new TextEncoder()

  const prisma = useDb ? (await import('@/lib/db')).default : null

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const sendPing = () => {
        controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`))
      }

      // initial keep-alive ping
      sendPing()

      let lastSeen = new Date(Date.now() - 10_000)

      const interval = setInterval(() => {
        void (async () => {
          if (prisma) {
            try {
              const events = await prisma.serverEvent.findMany({
                where: { createdAt: { gt: lastSeen } },
                orderBy: { createdAt: 'asc' },
                take: 25,
              })

              if (events.length > 0) {
                for (const ev of events) {
                  const players = ev.players ? JSON.parse(ev.players) : null
                  const location = ev.location ? JSON.parse(ev.location) : null
                  send({
                    id: ev.id,
                    type: ev.type,
                    message: ev.message,
                    players,
                    location,
                    timestamp: ev.createdAt.toISOString(),
                  })
                  lastSeen = ev.createdAt
                }
              } else {
                sendPing()
              }
              return
            } catch {
              sendPing()
              return
            }
          }

          if (allowSimulationStream) {
            send(randomEvent())
            return
          }

          sendPing()
        })()
      }, prisma ? 4000 : allowSimulationStream ? 4000 : 15000)

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
