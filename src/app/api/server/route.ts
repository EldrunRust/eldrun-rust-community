import { NextResponse } from 'next/server'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

export const dynamic = 'force-dynamic'

// Simulated server stats - updates dynamically
function getSimulatedStats() {
  const baseTime = Date.now()
  const hour = new Date().getHours()
  
  // Simulate player count based on time of day (peak hours: 18-23)
  const isPeakHours = hour >= 18 && hour <= 23
  const isLateNight = hour >= 0 && hour <= 6
  
  let basePlayers = isPeakHours ? 145 : isLateNight ? 45 : 85
  // Add some randomness
  basePlayers += Math.floor(Math.random() * 30) - 15
  basePlayers = Math.max(20, Math.min(195, basePlayers))
  
  // Simulate uptime (server restarts every ~24h at 5 AM)
  const lastRestart = new Date()
  lastRestart.setHours(5, 0, 0, 0)
  if (lastRestart.getTime() > baseTime) {
    lastRestart.setDate(lastRestart.getDate() - 1)
  }
  const uptimeSeconds = Math.floor((baseTime - lastRestart.getTime()) / 1000)
  
  return {
    players: basePlayers,
    maxPlayers: 200,
    status: 'online',
    uptime: uptimeSeconds,
    fps: Math.floor(Math.random() * 15) + 245, // 245-260 FPS
    entities: Math.floor(Math.random() * 50000) + 180000, // 180k-230k entities
    sleepers: Math.floor(basePlayers * 0.6) + Math.floor(Math.random() * 20),
    queue: isPeakHours ? Math.floor(Math.random() * 8) : 0,
    map: 'Eldrun Custom Map',
    seed: 1337420,
    worldSize: 4500,
    lastWipe: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    nextWipe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  }
}

export async function GET() {
  try {
    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { error: 'DATABASE_URL ist nicht konfiguriert' },
          { status: 500 }
        )
      }
      return NextResponse.json(getSimulatedStats())
    }

    const prisma = (await import('@/lib/db')).default
    const stats = await prisma.serverStats.findFirst({
      orderBy: { recordedAt: 'desc' },
    })

    if (!stats) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { error: 'No server stats available' },
          { status: 404 }
        )
      }
      return NextResponse.json(getSimulatedStats())
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching server stats:', error)
    if (allowSimulationFallback) {
      return NextResponse.json(getSimulatedStats())
    }
    return NextResponse.json({ error: 'Failed to fetch server stats' }, { status: 500 })
  }
}
