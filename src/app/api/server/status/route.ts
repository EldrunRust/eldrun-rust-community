import { NextRequest, NextResponse } from 'next/server'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

export const dynamic = 'force-dynamic'

// Server configuration from environment variables
const SERVER_CONFIG = {
  name: process.env.SERVER_NAME || 'ELDRUN | Main Server',
  maxPlayers: parseInt(process.env.SERVER_MAX_PLAYERS || '200'),
  worldSize: parseInt(process.env.SERVER_WORLD_SIZE || '4500')
}

// GET /api/server/status - Get server status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const live = searchParams.get('live') === 'true'

    // Try to get live data from RCON if requested
    if (live) {
      try {
        // Dynamic import to avoid issues if ws module not available
        const { getServerInfo, getPlayers } = await import('@/lib/rcon')
        
        const [serverInfo, players] = await Promise.all([
          getServerInfo(),
          getPlayers()
        ])

        if (serverInfo) {
          if (useDb) {
            try {
              const prisma = (await import('@/lib/db')).default
              await prisma.serverStats.create({
                data: {
                  players: serverInfo.Players,
                  maxPlayers: serverInfo.MaxPlayers,
                  queue: serverInfo.Queued,
                  fps: Math.round(serverInfo.Framerate),
                  entities: serverInfo.EntityCount,
                  uptime: serverInfo.Uptime,
                  mapName: serverInfo.Map
                }
              })
            } catch {
            }
          }

          return NextResponse.json({
            success: true,
            live: true,
            server: {
              name: serverInfo.Hostname,
              map: serverInfo.Map,
              players: serverInfo.Players,
              maxPlayers: serverInfo.MaxPlayers,
              queuedPlayers: serverInfo.Queued,
              fps: Math.round(serverInfo.Framerate),
              entities: serverInfo.EntityCount,
              uptime: formatUptime(serverInfo.Uptime),
              memory: serverInfo.Memory,
              status: 'online',
              onlinePlayers: players.map(p => ({
                steamId: p.SteamID,
                name: p.DisplayName,
                ping: p.Ping,
                connectedTime: formatUptime(p.ConnectedSeconds)
              }))
            }
          })
        }
      } catch (error) {
        console.error('RCON query failed:', error)
        // Fall through to database lookup
      }
    }

    // Return last known stats from database
    if (useDb) {
      const prisma = (await import('@/lib/db')).default
      const lastStats = await prisma.serverStats.findFirst({
        orderBy: { recordedAt: 'desc' }
      })

      if (lastStats) {
        return NextResponse.json({
          success: true,
          live: false,
          server: {
            name: SERVER_CONFIG.name,
            map: lastStats.mapName || 'Unknown',
            players: lastStats.players,
            maxPlayers: lastStats.maxPlayers,
            queuedPlayers: lastStats.queue,
            fps: lastStats.fps,
            uptime: formatUptime(lastStats.uptime),
            status: 'online',
            lastUpdate: lastStats.recordedAt.toISOString()
          }
        })
      }
    } else if (allowSimulationFallback) {
      return NextResponse.json({
        success: true,
        live: false,
        simulated: true,
        server: getSimulatedStatus()
      })
    }

    // No data available - server may be offline or not configured
    return NextResponse.json({
      success: false,
      live: false,
      server: {
        name: SERVER_CONFIG.name,
        status: 'unknown',
        message: 'Server status unavailable. Configure RCON or wait for data.'
      }
    })

  } catch (error) {
    console.error('Server status error:', error)
    if (allowSimulationFallback) {
      return NextResponse.json({
        success: true,
        live: false,
        simulated: true,
        server: getSimulatedStatus()
      })
    }

    return NextResponse.json(
      {
        success: false,
        live: false,
        server: {
          name: SERVER_CONFIG.name,
          status: 'unknown',
          message: 'Server status unavailable.'
        }
      },
      { status: 500 }
    )
  }
}

// Simulated server status for fallback
function getSimulatedStatus() {
  const hour = new Date().getHours()
  const isPeakHours = hour >= 18 && hour <= 23
  const isLateNight = hour >= 0 && hour <= 6
  
  let basePlayers = isPeakHours ? 145 : isLateNight ? 45 : 85
  basePlayers += Math.floor(Math.random() * 30) - 15
  basePlayers = Math.max(20, Math.min(195, basePlayers))
  
  const lastRestart = new Date()
  lastRestart.setHours(5, 0, 0, 0)
  if (lastRestart.getTime() > Date.now()) {
    lastRestart.setDate(lastRestart.getDate() - 1)
  }
  const uptimeSeconds = Math.floor((Date.now() - lastRestart.getTime()) / 1000)
  
  return {
    name: 'ELDRUN | Main Server',
    map: 'Eldrun Custom Map',
    players: basePlayers,
    maxPlayers: 200,
    queuedPlayers: isPeakHours ? Math.floor(Math.random() * 8) : 0,
    fps: Math.floor(Math.random() * 15) + 245,
    entities: Math.floor(Math.random() * 50000) + 180000,
    uptime: formatUptime(uptimeSeconds),
    status: 'online',
    lastUpdate: new Date().toISOString()
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.join(' ') || '0m'
}
