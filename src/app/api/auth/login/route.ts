import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/db'
import { getJwtSecret } from '@/lib/auth'

const JWT_SECRET = getJwtSecret()

const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail oder Passwort' },
        { status: 401 }
      )
    }

    // Check if user has a password (might be Steam-only account)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Bitte melde dich mit Steam an' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail oder Passwort' },
        { status: 401 }
      )
    }

    if (!JWT_SECRET) {
      if (isProdDeployment) {
        return NextResponse.json(
          { error: 'Server ist nicht korrekt konfiguriert' },
          { status: 500 }
        )
      } else {
        throw new Error('JWT secret is not configured')
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Return success with user data AND redirect
    const response = NextResponse.json({
      success: true,
      message: 'Login erfolgreich!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        coins: user.coins,
        casinoCoins: user.casinoCoins,
      },
      redirect: '/dashboard'  // Add redirect to dashboard
    })
    
    // Set HTTP-only cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProdDeployment,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' },
      { status: 500 }
    )
  }
}
