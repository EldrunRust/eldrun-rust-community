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

type CasinoGameName =
  | 'coinflip'
  | 'jackpot'
  | 'roulette'
  | 'crash'
  | 'cases'
  | 'mines'
  | 'dice'
  | 'wheel'
  | 'blackjack'
  | 'slots'
  | string

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

    const body = (await request.json()) as {
      game?: CasinoGameName
      betAmount?: number
      result?: 'win' | 'lose'
      payout?: number
      multiplier?: number
    }

    const game = body.game
    const betAmount = body.betAmount
    const result = body.result
    const payout = body.payout
    const multiplier = body.multiplier

    if (!game || typeof game !== 'string') {
      return NextResponse.json({ error: 'Ungültiges Spiel' }, { status: 400 })
    }

    if (typeof betAmount !== 'number' || !Number.isFinite(betAmount) || !Number.isInteger(betAmount) || betAmount <= 0) {
      return NextResponse.json({ error: 'Ungültiger Einsatz' }, { status: 400 })
    }

    if (result !== 'win' && result !== 'lose') {
      return NextResponse.json({ error: 'Ungültiges Resultat' }, { status: 400 })
    }

    if (typeof payout !== 'number' || !Number.isFinite(payout) || !Number.isInteger(payout) || payout < 0) {
      return NextResponse.json({ error: 'Ungültiger Payout' }, { status: 400 })
    }

    const safeMultiplier = typeof multiplier === 'number' && Number.isFinite(multiplier)
      ? Math.max(0, Math.min(1_000_000, multiplier))
      : 0

    const profit = result === 'win' ? payout - betAmount : -betAmount

    const { created, updatedStats } = await prisma.$transaction(async (tx) => {
      const created = await tx.casinoGame.create({
        data: {
          userId: decoded.userId,
          game,
          betAmount,
          betType: 'coins',
          result,
          payout,
          multiplier: safeMultiplier,
          profit,
        },
        select: {
          id: true,
          createdAt: true,
        },
      })

      const prev = await tx.casinoStats.findUnique({
        where: { userId: decoded.userId },
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

      const prevTotals = prev || {
        totalWagered: 0,
        totalWon: 0,
        totalLost: 0,
        gamesPlayed: 0,
        biggestWin: 0,
        biggestLoss: 0,
        highestMultiplier: 0,
      }

      const nextTotals = {
        totalWagered: prevTotals.totalWagered + betAmount,
        totalWon: prevTotals.totalWon + (result === 'win' ? payout : 0),
        totalLost: prevTotals.totalLost + (result === 'lose' ? betAmount : 0),
        gamesPlayed: prevTotals.gamesPlayed + 1,
        biggestWin: Math.max(prevTotals.biggestWin, result === 'win' ? payout : 0),
        biggestLoss: Math.max(prevTotals.biggestLoss, result === 'lose' ? betAmount : 0),
        highestMultiplier: Math.max(prevTotals.highestMultiplier, safeMultiplier),
      }

      const updatedStats = await tx.casinoStats.upsert({
        where: { userId: decoded.userId },
        create: { userId: decoded.userId, ...nextTotals },
        update: nextTotals,
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

      return { created, updatedStats }
    })

    return NextResponse.json({
      success: true,
      entry: {
        id: created.id,
        timestamp: created.createdAt,
      },
      stats: updatedStats,
    })
  } catch (error) {
    console.error('Casino record error:', error)
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 })
  }
}
