import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { GAME_NAMES, CasinoActivity, CasinoPlayer, CasinoGame as CasinoGameName } from '@/data/casinoPlayers'

export const dynamic = 'force-dynamic'

function toActivityType(input: { result: 'win' | 'lose'; payout: number; multiplier: number; profit: number }): CasinoActivity['type'] {
  if (input.result === 'lose') {
    return input.multiplier > 0 ? 'bust' : 'loss'
  }

  if (input.multiplier >= 10 || input.payout >= 50000) return 'jackpot'
  if (input.multiplier >= 4 || input.payout >= 10000) return 'big_win'
  if (input.multiplier >= 2) return 'multiplier'
  return 'win'
}

function toPlayer(user: { id: string; username: string; role: string; level: number; faction: string | null; avatar: string | null }): CasinoPlayer {
  return {
    id: user.id,
    name: user.username,
    avatar: user.avatar || '👤',
    level: user.level,
    faction: (user.faction as 'seraphar' | 'vorgaroth' | null) || null,
    vip: user.role === 'vip',
    totalWagered: 0,
    biggestWin: 0,
    playStyle: 'casual',
  }
}

export async function GET() {
  try {
    const games = await prisma.casinoGame.findMany({
      orderBy: { createdAt: 'desc' },
      take: 60,
      select: {
        id: true,
        game: true,
        result: true,
        betAmount: true,
        payout: true,
        multiplier: true,
        profit: true,
        createdAt: true,
        user: {
          select: { id: true, username: true, role: true, level: true, faction: true, avatar: true },
        },
      },
    })

    const activities: CasinoActivity[] = games.map((g) => {
      const gameName = (g.game as CasinoGameName) || 'coinflip'
      const type = toActivityType({
        result: g.result as 'win' | 'lose',
        payout: g.payout,
        multiplier: g.multiplier,
        profit: g.profit,
      })

      const amount = g.result === 'win' ? g.payout : g.betAmount
      const messageBase = type === 'loss' || type === 'bust' ? 'verliert' : 'gewinnt'
      const message = `${g.user.username} ${messageBase} ${amount.toLocaleString()} Coins bei ${GAME_NAMES[gameName] || g.game}`

      return {
        id: g.id,
        player: toPlayer(g.user),
        game: gameName,
        type,
        amount,
        multiplier: g.multiplier > 0 ? g.multiplier : undefined,
        timestamp: g.createdAt,
        message,
        isSpecial: type === 'jackpot' || type === 'big_win',
      }
    })

    return NextResponse.json({
      success: true,
      activities,
      stats: {
        totalActivities: activities.length,
        specialEvents: activities.filter((a) => a.isSpecial).length,
        lastUpdate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Casino activity error:', error)
    return NextResponse.json({ success: true, activities: [], stats: { totalActivities: 0, specialEvents: 0, lastUpdate: new Date().toISOString() } })
  }
}
