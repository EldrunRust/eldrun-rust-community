import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/messages - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const userId = auth.user.userId

    const messages = await prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        receiver: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true, 
      messages 
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Nachrichten' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (!auth.success || !auth.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const userId = auth.user.userId
    const body = await request.json()
    const { receiverId, content, conversationId } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Nachricht darf nicht leer sein' },
        { status: 400 }
      )
    }

    // If conversationId provided, get the recipient from existing conversation
    let targetReceiverId = receiverId

    if (conversationId && !receiverId) {
      // Find the other participant in the conversation
      const existingMessage = await prisma.privateMessage.findFirst({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      })

      if (existingMessage) {
        targetReceiverId = existingMessage.senderId === userId 
          ? existingMessage.receiverId 
          : existingMessage.senderId
      }
    }

    if (!targetReceiverId) {
      return NextResponse.json(
        { error: 'Empfänger nicht gefunden' },
        { status: 400 }
      )
    }

    const message = await prisma.privateMessage.create({
      data: {
        senderId: userId,
        receiverId: targetReceiverId,
        content: content.trim(),
        isRead: false
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        },
        receiver: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        conversationId: conversationId || message.id,
        senderId: message.senderId,
        senderName: message.sender.displayName || message.sender.username,
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.isRead,
        attachments: []
      }
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Nachricht' },
      { status: 500 }
    )
  }
}
