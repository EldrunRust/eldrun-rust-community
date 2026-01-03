import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

const DEMO_AUTHORS = [
  {
    id: 'bot_admin',
    username: 'AdminSavant',
    displayName: 'Admin Savant',
    avatar: '/images/avatars/admin-savant.jpg',
    role: 'admin',
    level: 85,
    faction: 'seraphar',
  },
  {
    id: 'bot_ops',
    username: 'ShadowOps',
    displayName: 'Shadow Ops',
    avatar: '/images/avatars/shadow-ops.jpg',
    role: 'moderator',
    level: 77,
    faction: 'vorgaroth',
  },
]

function buildDemoMessages(channelId: string, limit: number) {
  const now = Date.now()
  const messages = []
  for (let i = 0; i < Math.min(limit, 15); i++) {
    const author = DEMO_AUTHORS[i % DEMO_AUTHORS.length]
    messages.push({
      id: `demo_${channelId}_${now}_${i}`,
      channelId,
      authorId: author.id,
      content:
        i === 0
          ? `Willkommen in ${channelId}!` 
          : `Simulated message #${i} in ${channelId}`,
      type: 'text',
      attachments: [],
      embeds: [],
      giftType: null,
      giftAmount: null,
      giftRecipientId: null,
      reactions: {},
      isPinned: false,
      isEdited: false,
      replyToId: null,
      createdAt: new Date(now - (15 - i) * 1000).toISOString(),
      updatedAt: new Date(now - (15 - i) * 1000).toISOString(),
      replyTo: null,
      author,
    })
  }
  return messages
}

// GET /api/chat/messages?channelId=xxx - Get messages for a channel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const before = searchParams.get('before') // cursor for pagination
    const limit = parseInt(searchParams.get('limit') || '50')
    const mode = searchParams.get('mode') || 'live'

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID ist erforderlich' },
        { status: 400 }
      )
    }

    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { error: 'DATABASE_URL ist nicht konfiguriert' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        messages: buildDemoMessages(channelId, limit),
        hasMore: false,
        simulated: true,
      })
    }

    const prisma = (await import('@/lib/db')).default

    const where: Record<string, unknown> = {
      channelId,
      isDeleted: false,
    }

    if (mode !== 'all') {
      where.isSimulated = mode === 'simulation'
    }

    // Cursor-based pagination
    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        channelId: true,
        authorId: true,
        content: true,
        type: true,
        attachments: true,
        embeds: true,
        giftType: true,
        giftAmount: true,
        giftRecipientId: true,
        reactions: true,
        isPinned: true,
        isEdited: true,
        replyToId: true,
        createdAt: true,
        updatedAt: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            authorId: true
          }
        }
      }
    })

    // Get author info separately to avoid N+1
    const authorIds = Array.from(new Set(messages.map(m => m.authorId)))
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        level: true,
        faction: true
      }
    })

    const authorMap = new Map(authors.map(a => [a.id, a]))

    // Enrich messages with author data
    const enrichedMessages = messages.map(msg => ({
      ...msg,
      author: authorMap.get(msg.authorId) || null,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
      embeds: msg.embeds ? JSON.parse(msg.embeds) : [],
      reactions: msg.reactions ? JSON.parse(msg.reactions) : {}
    })).reverse() // Reverse to get chronological order

    return NextResponse.json({
      messages: enrichedMessages,
      hasMore: messages.length === limit
    })
  } catch (error) {
    console.error('Get chat messages error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Nachrichten' },
      { status: 500 }
    )
  }
}

// POST /api/chat/messages - Send a new message
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.success || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
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
      const { channelId, content, type, attachments, replyToId, giftType, giftAmount, giftRecipientId } = body

      if (!channelId || !content) {
        return NextResponse.json(
          { error: 'Channel ID und Inhalt sind erforderlich' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        simulated: true,
        message: {
          id: `demo_msg_${Date.now()}`,
          channelId,
          authorId: auth.user.userId,
          content,
          type: type || 'text',
          attachments: attachments || [],
          giftType: giftType || null,
          giftAmount: giftAmount || null,
          giftRecipientId: giftRecipientId || null,
          reactions: {},
          isPinned: false,
          isEdited: false,
          replyToId: replyToId || null,
          createdAt: new Date(),
          author: {
            id: auth.user.userId,
            username: auth.user.username,
            displayName: auth.user.username,
            avatar: null,
            role: auth.user.role,
            level: 1,
          },
        },
      })
    }

    const prisma = (await import('@/lib/db')).default
    const body = await request.json()
    const { channelId, content, type, attachments, replyToId, giftType, giftAmount, giftRecipientId, mode, simulated } = body
    const authorId = auth.user.userId

    const isSimulated = simulated === true || mode === 'simulation'

    if (!channelId || !content) {
      return NextResponse.json(
        { error: 'Channel ID und Inhalt sind erforderlich' },
        { status: 400 }
      )
    }

    // Verify channel exists and is not locked
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      select: { id: true, isLocked: true, slowMode: true }
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Kanal nicht gefunden' },
        { status: 404 }
      )
    }

    if (channel.isLocked) {
      return NextResponse.json(
        { error: 'Dieser Kanal ist gesperrt' },
        { status: 403 }
      )
    }

    // Check slow mode
    if (channel.slowMode > 0) {
      const lastMessage = await prisma.chatMessage.findFirst({
        where: { channelId, authorId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })

      if (lastMessage) {
        const timeSince = (Date.now() - lastMessage.createdAt.getTime()) / 1000
        if (timeSince < channel.slowMode) {
          return NextResponse.json(
            { error: `Slow Mode aktiv. Warte noch ${Math.ceil(channel.slowMode - timeSince)} Sekunden.` },
            { status: 429 }
          )
        }
      }
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        channelId,
        authorId,
        content,
        type: type || 'text',
        attachments: attachments ? JSON.stringify(attachments) : null,
        giftType,
        giftAmount,
        giftRecipientId,
        replyToId,
        isSimulated,
      },
      select: {
        id: true,
        channelId: true,
        authorId: true,
        content: true,
        type: true,
        attachments: true,
        giftType: true,
        giftAmount: true,
        giftRecipientId: true,
        reactions: true,
        isPinned: true,
        isEdited: true,
        replyToId: true,
        createdAt: true
      }
    })

    // Update channel message count
    if (!isSimulated) {
      await prisma.chatChannel.update({
        where: { id: channelId },
        data: { messageCount: { increment: 1 } },
      })
    }

    // Get author info
    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        level: true
      }
    })

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        author,
        attachments: message.attachments ? JSON.parse(message.attachments) : [],
        reactions: {}
      }
    })
  } catch (error) {
    console.error('Create chat message error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Nachricht' },
      { status: 500 }
    )
  }
}
