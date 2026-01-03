import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request, { params }: { params: { code: string } }) {
  try {
    const code = params.code
    const session = await prisma.opsSession.findUnique({ where: { code } })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const role = typeof body.role === 'string' ? body.role : null
    const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''

    if (!role) return NextResponse.json({ error: 'Missing role' }, { status: 400 })

    const existing = await prisma.opsRoleAssignment.findFirst({ where: { sessionId: session.id, role } })

    const assignment = existing
      ? await prisma.opsRoleAssignment.update({ where: { id: existing.id }, data: { nickname: nickname.length ? nickname : null } })
      : await prisma.opsRoleAssignment.create({ data: { sessionId: session.id, role, nickname: nickname.length ? nickname : null } })

    return NextResponse.json({ assignment }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
