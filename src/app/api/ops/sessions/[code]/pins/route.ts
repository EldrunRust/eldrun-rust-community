import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request, { params }: { params: { code: string } }) {
  try {
    const code = params.code
    const session = await prisma.opsSession.findUnique({ where: { code } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const body = await req.json().catch(() => ({}))

    const type = typeof body.type === 'string' ? body.type : 'note'
    const label = typeof body.label === 'string' && body.label.trim().length > 0 ? body.label.trim() : type.toUpperCase()
    const note = typeof body.note === 'string' ? body.note : null
    const x = Number.isFinite(body.x) ? Number(body.x) : 4000
    const y = Number.isFinite(body.y) ? Number(body.y) : 4000

    const pin = await prisma.opsPin.create({
      data: {
        sessionId: session.id,
        type,
        label,
        note,
        x,
        y,
      },
    })

    return NextResponse.json({ pin }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
