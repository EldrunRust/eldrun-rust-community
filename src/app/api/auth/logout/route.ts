import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'

const JWT_SECRET = getJwtSecret()
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      const response = NextResponse.json({
        success: true,
        message: 'Erfolgreich abgemeldet',
      })
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: isProdDeployment,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
      return response
    }

    let userId: string | null = null
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string }
      userId = decoded.userId
    } catch {
      // Token invalid/expired – just clear cookie
    }

    if (userId) {
      const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
      if (hasDb) {
        const prisma = (await import('@/lib/db')).default
        await prisma.session.deleteMany({ where: { userId } }).catch(() => {
          // Ignore DB errors on logout – still clear cookie
        })
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Erfolgreich abgemeldet',
    })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: isProdDeployment,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' },
      { status: 500 }
    )
  }
}
