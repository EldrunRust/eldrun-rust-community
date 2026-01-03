import { NextRequest, NextResponse } from 'next/server'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

export const dynamic = 'force-dynamic'

// Simulated player names for fallback
const SIMULATED_PLAYERS = [
  { name: 'xX_DragonSlayer_Xx', steamId: '76561198000000001', faction: 'vorgaroth' },
  { name: 'SerapharCaptain', steamId: '76561198000000002', faction: 'seraphar' },
  { name: 'RaidMaster420', steamId: '76561198000000003', faction: 'vorgaroth' },
  { name: 'PeacefulFarmer', steamId: '76561198000000004', faction: 'seraphar' },
  { name: 'NightRaider', steamId: '76561198000000005', faction: 'vorgaroth' },
  { name: 'BaseBuilder99', steamId: '76561198000000006', faction: 'seraphar' },
  { name: 'OilRigRunner', steamId: '76561198000000007', faction: 'neutral' },
  { name: 'HeliPilot', steamId: '76561198000000008', faction: 'seraphar' },
  { name: 'ScrapDealer', steamId: '76561198000000009', faction: 'neutral' },
  { name: 'ClanLeader_DE', steamId: '76561198000000010', faction: 'vorgaroth' },
  { name: 'RustVeteran', steamId: '76561198000000011', faction: 'seraphar' },
  { name: 'NakedRunner', steamId: '76561198000000012', faction: 'neutral' },
  { name: 'MonumentMaster', steamId: '76561198000000013', faction: 'vorgaroth' },
  { name: 'FarmingSimulator', steamId: '76561198000000014', faction: 'seraphar' },
  { name: 'CargoShipKing', steamId: '76561198000000015', faction: 'vorgaroth' },
  { name: 'BradleyHunter', steamId: '76561198000000016', faction: 'seraphar' },
  { name: 'ElectricalWizard', steamId: '76561198000000017', faction: 'neutral' },
  { name: 'WaterPipeGod', steamId: '76561198000000018', faction: 'vorgaroth' },
  { name: 'ResourceKing', steamId: '76561198000000019', faction: 'seraphar' },
  { name: 'TurretDefender', steamId: '76561198000000020', faction: 'vorgaroth' },
]

// Generate simulated online players
function getSimulatedOnlinePlayers(count: number) {
  const shuffled = [...SIMULATED_PLAYERS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, SIMULATED_PLAYERS.length)).map(p => ({
    steamId: p.steamId,
    name: p.name,
    ping: Math.floor(Math.random() * 80) + 20,
    connectedSeconds: Math.floor(Math.random() * 14400) + 300,
    health: Math.floor(Math.random() * 100) + 1
  }))
}

// Generate simulated leaderboard
function getSimulatedLeaderboard(category: string, limit: number) {
  return SIMULATED_PLAYERS.slice(0, limit).map((p, i) => ({
    rank: i + 1,
    steamId: p.steamId,
    name: p.name,
    kills: Math.floor(Math.random() * 500) + 50 - i * 20,
    deaths: Math.floor(Math.random() * 200) + 30,
    headshots: Math.floor(Math.random() * 150) + 20,
    kdr: (Math.random() * 3 + 0.5).toFixed(2),
    playtimeHours: Math.floor(Math.random() * 500) + 100 - i * 15,
    clan: i < 5 ? ['ELDRUN', 'RAID', 'FARM', 'PVP', 'CLAN'][i] : undefined
  })).sort((a, b) => {
    if (category === 'kills') return b.kills - a.kills
    if (category === 'kdr') return parseFloat(b.kdr) - parseFloat(a.kdr)
    if (category === 'playtime') return b.playtimeHours - a.playtimeHours
    return b.kills - a.kills
  }).map((p, i) => ({ ...p, rank: i + 1 }))
}

// GET /api/server/players - Get online players and player stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const steamId = searchParams.get('steamId')
    const type = searchParams.get('type') || 'online' // online, stats, leaderboard

    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { success: false, error: 'DATABASE_URL ist nicht konfiguriert' },
          { status: 500 }
        )
      }

      if (steamId) {
        const candidate = SIMULATED_PLAYERS.find(p => p.steamId === steamId)
        return NextResponse.json({
          success: true,
          simulated: true,
          player: {
            steamId,
            name: candidate?.name || `Player_${steamId.slice(-6)}`,
            kills: Math.floor(Math.random() * 500) + 10,
            deaths: Math.floor(Math.random() * 200) + 5,
            headshots: Math.floor(Math.random() * 150) + 5,
            kdr: (Math.random() * 3 + 0.5).toFixed(2),
            playtimeHours: Math.floor(Math.random() * 500) + 50,
            lastSeen: new Date().toISOString(),
            clan: null
          }
        })
      }

      if (type === 'leaderboard') {
        const category = searchParams.get('category') || 'kills'
        const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)
        return NextResponse.json({
          success: true,
          simulated: true,
          category,
          leaderboard: getSimulatedLeaderboard(category, limit)
        })
      }

      if (type === 'online') {
        const hour = new Date().getHours()
        const isPeakHours = hour >= 18 && hour <= 23
        const simulatedCount = isPeakHours
          ? Math.floor(Math.random() * 8) + 12
          : Math.floor(Math.random() * 5) + 5

        return NextResponse.json({
          success: true,
          live: false,
          simulated: true,
          count: simulatedCount,
          players: getSimulatedOnlinePlayers(simulatedCount)
        })
      }

      return NextResponse.json({
        success: true,
        simulated: true,
        players: getSimulatedLeaderboard('kills', 50),
        pagination: { page: 1, limit: 50, total: 20, pages: 1 }
      })
    }

    const prisma = (await import('@/lib/db')).default

    // Get specific player stats
    if (steamId) {
      const player = await prisma.player.findUnique({
        where: { steamId },
        include: {
          clan: {
            select: {
              tag: true,
              name: true
            }
          }
        }
      })

      if (!player) {
        return NextResponse.json(
          { error: 'Spieler nicht gefunden' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        player: {
          steamId: player.steamId,
          name: player.name,
          kills: player.kills,
          deaths: player.deaths,
          headshots: player.headshots,
          kdr: player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2),
          playtimeHours: Math.round(player.playtime / 60), // playtime is in minutes
          lastSeen: player.lastSeen,
          clan: player.clan
        }
      })
    }

    // Get leaderboard
    if (type === 'leaderboard') {
      const category = searchParams.get('category') || 'kills'
      const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)

      let orderBy: Record<string, 'desc'> = { kills: 'desc' }
      
      switch (category) {
        case 'deaths':
          orderBy = { deaths: 'desc' }
          break
        case 'playtime':
          orderBy = { playtime: 'desc' }
          break
        case 'headshots':
          orderBy = { headshots: 'desc' }
          break
        default:
          orderBy = { kills: 'desc' }
      }

      const players = await prisma.player.findMany({
        take: limit,
        orderBy,
        select: {
          steamId: true,
          name: true,
          kills: true,
          deaths: true,
          headshots: true,
          playtime: true,
          clan: {
            select: {
              tag: true,
              name: true
            }
          }
        }
      })

      // Calculate KDR and format
      const leaderboard = players.map((p, index) => ({
        rank: index + 1,
        steamId: p.steamId,
        name: p.name,
        kills: p.kills,
        deaths: p.deaths,
        headshots: p.headshots,
        kdr: p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2),
        playtimeHours: Math.round(p.playtime / 60),
        clan: p.clan?.tag
      }))

      // Sort by KDR if needed
      if (category === 'kdr') {
        leaderboard.sort((a, b) => parseFloat(b.kdr) - parseFloat(a.kdr))
        leaderboard.forEach((p, i) => p.rank = i + 1)
      }

      return NextResponse.json({
        success: true,
        category,
        leaderboard
      })
    }

    // Get online players (from RCON or recent activity)
    if (type === 'online') {
      try {
        // Try RCON first
        const { getPlayers } = await import('@/lib/rcon')
        const onlinePlayers = await getPlayers()

        if (onlinePlayers.length > 0) {
          // Update last seen for online players
          for (const player of onlinePlayers) {
            await prisma.player.upsert({
              where: { steamId: player.SteamID },
              update: {
                name: player.DisplayName,
                lastSeen: new Date()
              },
              create: {
                steamId: player.SteamID,
                name: player.DisplayName,
                lastSeen: new Date()
              }
            })
          }

          return NextResponse.json({
            success: true,
            live: true,
            count: onlinePlayers.length,
            players: onlinePlayers.map(p => ({
              steamId: p.SteamID,
              name: p.DisplayName,
              ping: p.Ping,
              connectedSeconds: p.ConnectedSeconds,
              health: p.Health
            }))
          })
        }
      } catch (error) {
        console.error('RCON players query failed:', error)
      }

      // Fallback: show recently active players (last 15 minutes)
      try {
        const recentPlayers = await prisma.player.findMany({
          where: {
            lastSeen: {
              gte: new Date(Date.now() - 15 * 60 * 1000)
            }
          },
          select: {
            steamId: true,
            name: true,
            lastSeen: true
          }
        })

        if (recentPlayers.length > 0) {
          return NextResponse.json({
            success: true,
            live: false,
            count: recentPlayers.length,
            players: recentPlayers
          })
        }
      } catch (dbError) {
        console.error('DB query failed:', dbError)
      }

      // Final fallback: simulated players
      const hour = new Date().getHours()
      const isPeakHours = hour >= 18 && hour <= 23
      const simulatedCount = isPeakHours ? Math.floor(Math.random() * 8) + 12 : Math.floor(Math.random() * 5) + 5
      
      return NextResponse.json({
        success: true,
        live: false,
        simulated: true,
        count: simulatedCount,
        players: getSimulatedOnlinePlayers(simulatedCount)
      })
    }

    // Get all player stats
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = (page - 1) * limit
    const search = searchParams.get('search')

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { steamId: { contains: search } }
      ]
    } : {}

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        skip,
        take: limit,
        orderBy: { kills: 'desc' },
        select: {
          steamId: true,
          name: true,
          kills: true,
          deaths: true,
          headshots: true,
          playtime: true,
          lastSeen: true,
          clan: {
            select: {
              tag: true
            }
          }
        }
      }),
      prisma.player.count({ where })
    ])

    return NextResponse.json({
      success: true,
      players: players.map(p => ({
        ...p,
        kdr: p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2),
        playtimeHours: Math.round(p.playtime / 60)
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Server players error:', error)
    // Return simulated data on error
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'online'
    
    if (type === 'leaderboard' && allowSimulationFallback) {
      const category = searchParams.get('category') || 'kills'
      const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)
      return NextResponse.json({
        success: true,
        simulated: true,
        category,
        leaderboard: getSimulatedLeaderboard(category, limit)
      })
    }
    
    if (type === 'online' && allowSimulationFallback) {
      const simulatedCount = Math.floor(Math.random() * 10) + 8
      return NextResponse.json({
        success: true,
        simulated: true,
        live: false,
        count: simulatedCount,
        players: getSimulatedOnlinePlayers(simulatedCount)
      })
    }

    if (allowSimulationFallback) {
      return NextResponse.json({
        success: true,
        simulated: true,
        players: getSimulatedLeaderboard('kills', 50),
        pagination: { page: 1, limit: 50, total: 20, pages: 1 }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Server players unavailable' },
      { status: 500 }
    )
  }
}
