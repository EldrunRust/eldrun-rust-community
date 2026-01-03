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

const WELCOME_BONUS = 500

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

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, casinoCoins: true, casinoWelcomeClaimed: true },
      })

      if (!user) {
        return { ok: false as const, status: 404, body: { error: 'Benutzer nicht gefunden' } }
      }

      if (user.casinoWelcomeClaimed) {
        return { ok: true as const, status: 200, body: { success: true, claimed: true, casinoCoins: user.casinoCoins } }
      }

      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          casinoWelcomeClaimed: true,
          casinoCoins: { increment: WELCOME_BONUS },
        },
        select: { casinoCoins: true, casinoWelcomeClaimed: true },
      })

      return {
        ok: true as const,
        status: 200,
        body: {
          success: true,
          claimed: updated.casinoWelcomeClaimed,
          casinoCoins: updated.casinoCoins,
          bonus: WELCOME_BONUS,
        },
      }
    })

    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    console.error('Casino welcome error:', error)
    return NextResponse.json({ error: 'Fehler beim Welcome Bonus' }, { status: 500 })
  }
}
