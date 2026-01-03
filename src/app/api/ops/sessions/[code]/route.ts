import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  try {
    const code = params.code
    const session = await prisma.opsSession.findUnique({ where: { code } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

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

    return NextResponse.json(
      {
        session: {
          id: session.id,
          code: session.code,
          title: session.title,
          description: session.description,
          status: session.status,
          timerStatus: session.timerStatus,
          timerStartAt: session.timerStartAt ? session.timerStartAt.toISOString() : null,
          timerElapsedMs: session.timerElapsedMs,
        },
        pins,
        roles,
        alerts,
        resources,
        resourceTotals,
      },
      { status: 200 }
    )
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
