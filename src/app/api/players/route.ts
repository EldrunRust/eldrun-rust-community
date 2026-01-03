import { NextResponse } from 'next/server'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

export const dynamic = 'force-dynamic'

const DEMO_TOP_PLAYERS = Array.from({ length: 10 }).map((_, i) => {
  const kills = Math.max(10, 250 - i * 18 + Math.floor(Math.random() * 20))
  const deaths = Math.max(1, 80 - i * 6 + Math.floor(Math.random() * 10))
  return {
    rank: i + 1,
    name: ['AdminSavant', 'ShadowOps', 'SerapharCaptain', 'RaidMaster420', 'TradeBaron', 'EngineerKyra', 'RustVeteran', 'NakedRunner', 'HeliPilot', 'PeacefulFarmer'][i] || `Player${i}`,
    kills,
    deaths,
    kd: Math.round((kills / Math.max(1, deaths)) * 100) / 100,
    playtime: Math.floor(Math.random() * 20000) + 1000,
    clan: i < 3 ? ['ELDRUN', 'RAID', 'OPS'][i] : null,
  }
})

export async function GET() {
  try {
    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json({ error: 'DATABASE_URL ist nicht konfiguriert' }, { status: 500 })
      }
      return NextResponse.json(DEMO_TOP_PLAYERS)
    }

    const prisma = (await import('@/lib/db')).default
    const players = await prisma.player.findMany({
      orderBy: { kills: 'desc' },
      take: 10,
      include: {
        clan: true,
      },
    })

    const formattedPlayers = players.map((player, index) => ({
      rank: index + 1,
      name: player.name,
      kills: player.kills,
      deaths: player.deaths,
      kd: player.deaths > 0 ? Math.round((player.kills / player.deaths) * 100) / 100 : player.kills,
      playtime: player.playtime,
      clan: player.clan?.tag || null,
    }))

    return NextResponse.json(formattedPlayers)
  } catch (error) {
    console.error('Error fetching players:', error)
    if (allowSimulationFallback) {
      return NextResponse.json(DEMO_TOP_PLAYERS)
    }
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}
