import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

type TimerAction = 'start' | 'pause' | 'resume' | 'reset'

export async function POST(req: Request, { params }: { params: { code: string } }) {
  try {
    const session = await prisma.opsSession.findUnique({ where: { code: params.code } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const action = body.action as TimerAction | undefined

    if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 })

    const now = new Date()

    if (action === 'start') {
      const updated = await prisma.opsSession.update({
        where: { id: session.id },
        data: {
          timerStatus: 'running',
          timerStartAt: now,
          timerElapsedMs: 0,
        },
      })
      return NextResponse.json({ timer: pickTimer(updated) }, { status: 200 })
    }

    if (action === 'pause') {
      if (session.timerStatus !== 'running' || !session.timerStartAt) {
        const updated = await prisma.opsSession.update({
          where: { id: session.id },
          data: { timerStatus: 'paused' },
        })
        return NextResponse.json({ timer: pickTimer(updated) }, { status: 200 })
      }

      const delta = now.getTime() - session.timerStartAt.getTime()
      const updated = await prisma.opsSession.update({
        where: { id: session.id },
        data: {
          timerStatus: 'paused',
          timerStartAt: null,
          timerElapsedMs: session.timerElapsedMs + Math.max(0, delta),
        },
      })
      return NextResponse.json({ timer: pickTimer(updated) }, { status: 200 })
    }

    if (action === 'resume') {
      const updated = await prisma.opsSession.update({
        where: { id: session.id },
        data: {
          timerStatus: 'running',
          timerStartAt: now,
        },
      })
      return NextResponse.json({ timer: pickTimer(updated) }, { status: 200 })
    }

    if (action === 'reset') {
      const updated = await prisma.opsSession.update({
        where: { id: session.id },
        data: {
          timerStatus: 'stopped',
          timerStartAt: null,
          timerElapsedMs: 0,
        },
      })
      return NextResponse.json({ timer: pickTimer(updated) }, { status: 200 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

function pickTimer(s: {
  timerStatus: string
  timerStartAt: Date | null
  timerElapsedMs: number
}) {
  return {
    status: s.timerStatus,
    startAt: s.timerStartAt ? s.timerStartAt.toISOString() : null,
    elapsedMs: s.timerElapsedMs,
  }
}
