import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request, { params }: { params: { code: string } }) {
  try {
    const session = await prisma.opsSession.findUnique({ where: { code: params.code } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const body = await req.json().catch(() => ({}))

    const resource = typeof body.resource === 'string' && body.resource.trim().length > 0 ? body.resource.trim() : null
    const delta = Number.isFinite(body.delta) ? Number(body.delta) : null
    const note = typeof body.note === 'string' && body.note.trim().length > 0 ? body.note.trim() : null

    if (!resource || delta == null) {
      return NextResponse.json({ error: 'Missing resource or delta' }, { status: 400 })
    }

    const event = await prisma.opsResourceEvent.create({
      data: {
        sessionId: session.id,
        resource,
        delta: Math.trunc(delta),
        note,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
