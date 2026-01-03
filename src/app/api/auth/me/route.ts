import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { mockUser } from '@/lib/demo/mockData'
import { getJwtSecret } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowDemoFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const useDb = hasDb

interface JwtPayload {
  userId: string
  username: string
  email: string
  role: string
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (allowDemoFallback && !useDb) {
      return NextResponse.json({ success: true, user: mockUser })
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert', user: null },
        { status: 401 }
      )
    }

    const jwtSecret = getJwtSecret()
    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'Server ist nicht korrekt konfiguriert', user: null },
        { status: 500 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload

    // Get fresh user data from database
    if (!useDb) {
      return NextResponse.json(
        { error: 'Database not configured', user: null },
        { status: 500 }
      )
    }

    const prisma = (await import('@/lib/db')).default
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        coins: true,
        casinoCoins: true,
        steamId: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden', user: null },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Ungültiger Token', user: null },
      { status: 401 }
    )
  }
}
