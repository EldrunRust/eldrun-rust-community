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

export async function GET(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        casinoCoins: true,
        casinoWelcomeClaimed: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    const stats = await prisma.casinoStats.findUnique({
      where: { userId: user.id },
      select: {
        totalWagered: true,
        totalWon: true,
        totalLost: true,
        gamesPlayed: true,
        biggestWin: true,
        biggestLoss: true,
        highestMultiplier: true,
      },
    })

    const games = await prisma.casinoGame.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        game: true,
        betAmount: true,
        result: true,
        payout: true,
        multiplier: true,
        createdAt: true,
      },
    })

    const history = games.map((g) => ({
      id: g.id,
      game: g.game,
      bet: g.betAmount,
      result: g.result as 'win' | 'lose',
      payout: g.payout,
      multiplier: g.multiplier > 0 ? g.multiplier : undefined,
      timestamp: g.createdAt,
    }))

    return NextResponse.json({
      success: true,
      casinoCoins: user.casinoCoins,
      casinoWelcomeClaimed: user.casinoWelcomeClaimed,
      stats: stats || {
        totalWagered: 0,
        totalWon: 0,
        totalLost: 0,
        gamesPlayed: 0,
        biggestWin: 0,
        biggestLoss: 0,
        highestMultiplier: 0,
      },
      history,
    })
  } catch (error) {
    console.error('Casino state error:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Casino Daten' }, { status: 500 })
  }
}
