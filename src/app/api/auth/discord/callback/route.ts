import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'

const JWT_SECRET = getJwtSecret()
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || ''
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'

const REDIRECT_URI = `${SITE_URL}/api/auth/discord/callback`

export const dynamic = 'force-dynamic'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)

interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  global_name?: string
  avatar?: string
  email?: string
  verified?: boolean
}

async function getDiscordToken(code: string): Promise<DiscordTokenResponse | null> {
  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })
    
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

async function getDiscordUser(accessToken: string): Promise<DiscordUser | null> {
  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (error) {
      return NextResponse.redirect(`${SITE_URL}/login?error=discord_denied`)
    }
    
    if (!code) {
      return NextResponse.redirect(`${SITE_URL}/login?error=discord_no_code`)
    }

    if (!hasDb) {
      return NextResponse.redirect(`${SITE_URL}/login?error=server_config`)
    }
    
    // Exchange code for token
    const tokenData = await getDiscordToken(code)
    if (!tokenData) {
      return NextResponse.redirect(`${SITE_URL}/login?error=discord_token_failed`)
    }
    
    // Get Discord user info
    const discordUser = await getDiscordUser(tokenData.access_token)
    if (!discordUser) {
      return NextResponse.redirect(`${SITE_URL}/login?error=discord_user_failed`)
    }

    const prisma = (await import('@/lib/db')).default
     
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { discordId: discordUser.id }
    })
    
    if (!user && discordUser.email) {
      // Check if email already exists
      user = await prisma.user.findUnique({
        where: { email: discordUser.email.toLowerCase() }
      })
      
      if (user && !user.discordId) {
        // Link Discord to existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { discordId: discordUser.id }
        })
      }
    }
    
    if (!user) {
      // Create new user from Discord
      const displayName = discordUser.global_name || discordUser.username
      let username = displayName.replace(/[^a-zA-Z0-9_]/g, '_')
      
      // Ensure unique username
      let counter = 1
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${displayName.replace(/[^a-zA-Z0-9_]/g, '_')}_${counter}`
        counter++
      }
      
      const email = discordUser.email?.toLowerCase() || `discord_${discordUser.id}@eldrun.local`
      const avatar = discordUser.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
        : null
      
      user = await prisma.user.create({
        data: {
          username,
          email,
          discordId: discordUser.id,
          avatar,
          role: 'player',
          emailVerified: discordUser.verified || false,
          coins: 0,
          casinoCoins: 0,
          casinoWelcomeClaimed: false,
        }
      })
    } else {
      // Update avatar if available
      if (discordUser.avatar) {
        const avatar = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
        if (avatar !== user.avatar) {
          await prisma.user.update({
            where: { id: user.id },
            data: { avatar }
          })
        }
      }
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), lastActive: new Date() }
    })

    if (!JWT_SECRET) {
      return NextResponse.redirect(`${SITE_URL}/login?error=server_config`)
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        discordId: user.discordId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })
    
    // Redirect with token in cookie
    const response = NextResponse.redirect(`${SITE_URL}/?login=success`)
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProdDeployment,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    
    return response
    
  } catch (error) {
    console.error('Discord callback error:', error)
    return NextResponse.redirect(`${SITE_URL}/login?error=discord_error`)
  }
}
