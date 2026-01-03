import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/db'
import { getJwtSecret } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface JwtPayload {
  userId: string
  username: string
  email: string
  role: string
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const jwtSecret = getJwtSecret()
    if (!jwtSecret) {
      return NextResponse.json({ error: 'Server ist nicht korrekt konfiguriert' }, { status: 500 })
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload

    const body = await request.json()
    const deltaRaw: unknown = (body as { delta?: unknown })?.delta
    if (typeof deltaRaw !== 'number' || !Number.isFinite(deltaRaw) || !Number.isInteger(deltaRaw) || deltaRaw === 0) {
      return NextResponse.json({ error: 'Ungültiger delta Wert' }, { status: 400 })
    }

    const delta = deltaRaw

    const MAX_ABS_DELTA = 1_000_000_000
    if (Math.abs(delta) > MAX_ABS_DELTA) {
      return NextResponse.json({ error: 'delta zu groß' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, coins: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    const current = user.coins || 0

    if (delta < 0 && current + delta < 0) {
      return NextResponse.json(
        { error: 'Nicht genügend Coins', coins: current },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { coins: { increment: delta } },
      select: { coins: true },
    })

    return NextResponse.json({ success: true, coins: updated.coins })
  } catch (error) {
    console.error('Coins adjust error:', error)
    return NextResponse.json({ error: 'Fehler beim Coins Update' }, { status: 500 })
  }
}
