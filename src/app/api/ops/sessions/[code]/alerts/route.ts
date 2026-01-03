import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request, { params }: { params: { code: string } }) {
  try {
    const code = params.code
    const session = await prisma.opsSession.findUnique({ where: { code } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const body = await req.json().catch(() => ({}))

    const type = typeof body.type === 'string' ? body.type : 'system'
    const severity = typeof body.severity === 'string' ? body.severity : 'info'
    const message = typeof body.message === 'string' && body.message.trim().length > 0 ? body.message.trim() : 'Alert'
    const x = body.x == null ? null : Number(body.x)
    const y = body.y == null ? null : Number(body.y)

    const alert = await prisma.opsAlert.create({
      data: {
        sessionId: session.id,
        type,
        severity,
        message,
        x: Number.isFinite(x) ? x : null,
        y: Number.isFinite(y) ? y : null,
      },
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
