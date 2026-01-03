import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'

const JWT_SECRET = getJwtSecret()

// POST /api/auth/discord/code - Generate a link code for Discord bot
export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Nicht eingeloggt' },
        { status: 401 }
      )
    }

    let userId: string
    try {
      if (!JWT_SECRET) {
        return NextResponse.json(
          { error: 'Server ist nicht korrekt konfiguriert' },
          { status: 500 }
        )
      }
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch {
      return NextResponse.json(
        { error: 'Ungültiges Token' },
        { status: 401 }
      )
    }

    // Check if user already has Discord linked
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, discordId: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    if (user.discordId) {
      return NextResponse.json(
        { error: 'Discord bereits verknüpft' },
        { status: 400 }
      )
    }

    // Generate a unique 6-character code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store code in user's verifyToken field
    await prisma.user.update({
      where: { id: userId },
      data: {
        verifyToken: code,
        verifyExpires: expiresAt
      }
    })

    return NextResponse.json({
      code,
      expiresAt: expiresAt.toISOString(),
      expiresIn: 600 // seconds
    })

  } catch (error) {
    console.error('Generate link code error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Generieren des Codes' },
      { status: 500 }
    )
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
