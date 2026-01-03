import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const title = typeof body.title === 'string' && body.title.trim().length > 0 ? body.title.trim() : 'Operation'
    const description = typeof body.description === 'string' ? body.description.trim() : null

    let code = randomCode()
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.opsSession.findUnique({ where: { code } })
      if (!existing) break
      code = randomCode()
    }

    const session = await prisma.opsSession.create({
      data: {
        code,
        title,
        description,
        status: 'active',
      },
    })

    // Seed default roles
    const roles = ['leader', 'scout', 'builder', 'medic', 'logistics'] as const
    await Promise.all(
      roles.map((role) =>
        prisma.opsRoleAssignment.upsert({
          where: { sessionId_role: { sessionId: session.id, role } },
          create: { sessionId: session.id, role },
          update: {},
        })
      )
    )

    return NextResponse.json({ session: { id: session.id, code: session.code, title: session.title } }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
