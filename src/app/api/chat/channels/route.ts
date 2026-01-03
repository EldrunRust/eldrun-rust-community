import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { DEMO_CHAT_CHANNELS } from '@/data/demoChatChannels'

export const dynamic = 'force-dynamic'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

const DEMO_CHANNELS = DEMO_CHAT_CHANNELS.map((channel) => ({
  id: channel.id,
  name: channel.name,
  slug: channel.slug,
  description: channel.description,
  type: channel.type,
  icon: channel.icon,
  color: channel.color,
  memberCount: channel.userCount,
  messageCount: channel.messageCount,
  isLocked: channel.isLocked,
  _count: { messages: channel.messageCount },
}))

// GET /api/chat/channels - Get all public channels
export async function GET() {
  try {
    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { error: 'DATABASE_URL ist nicht konfiguriert' },
          { status: 500 }
        )
      }

      return NextResponse.json({ channels: DEMO_CHANNELS })
    }

    const prisma = (await import('@/lib/db')).default
    const channels = await prisma.chatChannel.findMany({
      where: { 
        OR: [
          { type: 'public' },
          { type: 'vip' }
        ]
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        icon: true,
        color: true,
        memberCount: true,
        messageCount: true,
        isLocked: true,
        _count: {
          select: { messages: true }
        }
      }
    })

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Get chat channels error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kanäle' },
      { status: 500 }
    )
  }
}

// POST /api/chat/channels - Create a new channel (admin only)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.success || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  // Only admins can create channels
  if (!['admin', 'superadmin'].includes(auth.user.role)) {
    return NextResponse.json(
      { error: 'Keine Berechtigung' },
      { status: 403 }
    )
  }

  try {
    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { error: 'Database not configured' },
          { status: 503 }
        )
      }

      const body = await request.json()
      const { name, description, type, icon, color } = body

      if (!name) {
        return NextResponse.json(
          { error: 'Name ist erforderlich' },
          { status: 400 }
        )
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const channel = {
        id: `demo_${Date.now()}`,
        name,
        slug,
        description,
        type: type || 'public',
        icon,
        color: color || '#D4AF37',
        memberCount: 0,
        messageCount: 0,
        isLocked: false,
        _count: { messages: 0 },
      }

      return NextResponse.json({
        success: true,
        channel,
      })
    }

    const prisma = (await import('@/lib/db')).default
    const body = await request.json()
    const { name, description, type, icon, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      )
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Check if slug already exists
    const existing = await prisma.chatChannel.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ein Kanal mit diesem Namen existiert bereits' },
        { status: 409 }
      )
    }

    const channel = await prisma.chatChannel.create({
      data: {
        name,
        slug,
        description,
        type: type || 'public',
        icon,
        color: color || '#D4AF37'
      }
    })

    return NextResponse.json({
      success: true,
      channel
    })
  } catch (error) {
    console.error('Create chat channel error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Kanals' },
      { status: 500 }
    )
  }
}
