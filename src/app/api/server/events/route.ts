import { NextRequest, NextResponse } from 'next/server'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

export const dynamic = 'force-dynamic'

// Server events types
type EventType = 'kill' | 'death' | 'join' | 'leave' | 'raid' | 'airdrop' | 'helicopter' | 'cargo' | 'bradley'

interface ApiEvent {
  id: string
  type: EventType
  message: string
  players?: string[]
  location?: { x: number; y: number; z: number }
  timestamp: Date
}

// Simulated event messages
const SIMULATED_PLAYER_NAMES = [
  'xX_DragonSlayer_Xx', 'SerapharCaptain', 'RaidMaster420', 'PeacefulFarmer',
  'NightRaider', 'BaseBuilder99', 'OilRigRunner', 'HeliPilot', 'ScrapDealer',
  'ClanLeader_DE', 'RustVeteran', 'NakedRunner', 'MonumentMaster', 'FarmingSimulator'
]

function getRandomPlayer() {
  return SIMULATED_PLAYER_NAMES[Math.floor(Math.random() * SIMULATED_PLAYER_NAMES.length)]
}

function getRandomLocation() {
  return {
    x: Math.floor(Math.random() * 4000) - 2000,
    y: Math.floor(Math.random() * 100) + 10,
    z: Math.floor(Math.random() * 4000) - 2000
  }
}

// Generate simulated events
function generateSimulatedEvents(count: number): ApiEvent[] {
  const events: ApiEvent[] = []
  const eventTypes: EventType[] = ['kill', 'join', 'leave', 'airdrop', 'helicopter', 'cargo', 'bradley', 'raid']
  
  for (let i = 0; i < count; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const player1 = getRandomPlayer()
    const player2 = getRandomPlayer()
    const location = getRandomLocation()
    const timestamp = new Date(Date.now() - i * (Math.random() * 60000 + 10000))
    
    let message = ''
    let players: string[] = []
    
    switch (type) {
      case 'kill':
        message = `${player1} hat ${player2} getötet`
        players = [player1, player2]
        break
      case 'join':
        message = `${player1} ist dem Server beigetreten`
        players = [player1]
        break
      case 'leave':
        message = `${player1} hat den Server verlassen`
        players = [player1]
        break
      case 'airdrop':
        message = 'Ein Airdrop wurde abgeworfen!'
        break
      case 'helicopter':
        message = 'Der Attack Helicopter ist erschienen!'
        break
      case 'cargo':
        message = 'Das Cargo Ship ist eingetroffen!'
        break
      case 'bradley':
        message = 'Der Bradley APC patrouilliert!'
        break
      case 'raid':
        message = `${player1} raidet eine Base!`
        players = [player1]
        break
    }
    
    events.push({
      id: `evt_${Date.now()}_${i}`,
      type,
      message,
      players: players.length > 0 ? players : undefined,
      location,
      timestamp
    })
  }
  
  return events
}

// GET /api/server/events - Get recent server events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const since = searchParams.get('since') // ISO timestamp

    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { success: false, error: 'DATABASE_URL ist nicht konfiguriert' },
          { status: 500 }
        )
      }

      const simulatedEvents = generateSimulatedEvents(limit)
      return NextResponse.json({
        success: true,
        simulated: true,
        events: simulatedEvents,
        count: simulatedEvents.length
      })
    }

    const prisma = (await import('@/lib/db')).default

    const events = await prisma.serverEvent.findMany({
      where: {
        AND: [
          type ? { type } : {},
          since ? { createdAt: { gt: new Date(since) } } : {}
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    const mapped: ApiEvent[] = events.map((event: { id: string; type: string; message: string; players: string | null; location: string | null; createdAt: Date }) => ({
      id: event.id,
      type: event.type as EventType,
      message: event.message,
      players: event.players ? JSON.parse(event.players) : undefined,
      location: event.location ? JSON.parse(event.location) : undefined,
      timestamp: event.createdAt
    }))

    return NextResponse.json({
      success: true,
      events: mapped,
      count: mapped.length
    })

  } catch (error) {
    console.error('Get events error:', error)
    if (allowSimulationFallback) {
      const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100)
      const simulatedEvents = generateSimulatedEvents(limit)
      return NextResponse.json({
        success: true,
        simulated: true,
        events: simulatedEvents,
        count: simulatedEvents.length
      })
    }

    return NextResponse.json(
      { success: false, error: 'Events unavailable' },
      { status: 500 }
    )
  }
}

// POST /api/server/events - Record a server event (called by game server plugin)
export async function POST(request: NextRequest) {
  try {
    if (!useDb) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Verify server API key
    const apiKey = request.headers.get('X-Server-Key')
    const expectedKey = process.env.SERVER_API_KEY

    if (!expectedKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, message, players, location } = body

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Type und Message erforderlich' },
        { status: 400 }
      )
    }

    const prisma = (await import('@/lib/db')).default
    const event = await prisma.serverEvent.create({
      data: {
        type,
        message,
        players: players ? JSON.stringify(players) : undefined,
        location: location ? JSON.stringify(location) : undefined
      }
    })

    // Update player stats if it's a kill event
    if (type === 'kill' && players && players.length >= 2) {
      const [killerId, victimId] = players

      // Update killer stats
      await prisma.player.upsert({
        where: { steamId: killerId },
        update: { kills: { increment: 1 } },
        create: { steamId: killerId, name: 'Unknown', kills: 1 }
      })

      // Update victim stats
      await prisma.player.upsert({
        where: { steamId: victimId },
        update: { deaths: { increment: 1 } },
        create: { steamId: victimId, name: 'Unknown', deaths: 1 }
      })
    }

    // Handle join/leave events
    if (type === 'join' && players && players.length > 0) {
      await prisma.player.upsert({
        where: { steamId: players[0] },
        update: { 
          lastSeen: new Date(),
          connections: { increment: 1 }
        },
        create: { 
          steamId: players[0], 
          name: message.split(' ')[0] || 'Unknown',
          lastSeen: new Date(),
          connections: 1
        }
      })
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        type: event.type as EventType,
        message: event.message,
        players,
        location,
        timestamp: event.createdAt
      }
    })

  } catch (error) {
    console.error('Record event error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Events' },
      { status: 500 }
    )
  }
}

