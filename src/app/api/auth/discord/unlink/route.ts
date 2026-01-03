import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'

const JWT_SECRET = getJwtSecret()

// POST /api/auth/discord/unlink - Unlink Discord account
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

    // Check if user has Discord linked
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, discordId: true, passwordHash: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    if (!user.discordId) {
      return NextResponse.json(
        { error: 'Kein Discord-Konto verknüpft' },
        { status: 400 }
      )
    }

    // Check if user has another login method (password)
    // Don't allow unlink if Discord is the only login method
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Du kannst Discord nicht trennen, da es deine einzige Login-Methode ist. Setze zuerst ein Passwort.' },
        { status: 400 }
      )
    }

    // Unlink Discord
    await prisma.user.update({
      where: { id: userId },
      data: { discordId: null }
    })

    return NextResponse.json({
      success: true,
      message: 'Discord erfolgreich getrennt'
    })

  } catch (error) {
    console.error('Unlink Discord error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Trennen von Discord' },
      { status: 500 }
    )
  }
}
