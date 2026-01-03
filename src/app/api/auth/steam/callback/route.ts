import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'

const JWT_SECRET = getJwtSecret()
const STEAM_API_KEY = process.env.STEAM_API_KEY || ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'

export const dynamic = 'force-dynamic'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)

// Extract Steam ID from OpenID claimed_id
function extractSteamId(claimedId: string): string | null {
  const match = claimedId.match(/\/id\/(\d+)$/)
  return match ? match[1] : null
}

// Verify OpenID response with Steam
async function verifyOpenIdResponse(params: URLSearchParams): Promise<boolean> {
  const verifyParams = new URLSearchParams(params)
  verifyParams.set('openid.mode', 'check_authentication')
  
  try {
    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    })
    
    const text = await response.text()
    return text.includes('is_valid:true')
  } catch {
    return false
  }
}

// Get Steam user profile
async function getSteamProfile(steamId: string) {
  if (!STEAM_API_KEY) {
    return {
      steamid: steamId,
      personaname: `Player_${steamId.slice(-6)}`,
      avatarfull: null,
    }
  }
  
  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`
    )
    const data = await response.json()
    return data.response?.players?.[0] || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    if (!hasDb) {
      return NextResponse.redirect(`${SITE_URL}/login?error=server_config`)
    }

    const prisma = (await import('@/lib/db')).default
    
    // Verify the OpenID response
    const isValid = await verifyOpenIdResponse(searchParams)
    if (!isValid) {
      return NextResponse.redirect(`${SITE_URL}/login?error=steam_verification_failed`)
    }
    
    // Extract Steam ID
    const claimedId = searchParams.get('openid.claimed_id')
    if (!claimedId) {
      return NextResponse.redirect(`${SITE_URL}/login?error=steam_no_id`)
    }
    
    const steamId = extractSteamId(claimedId)
    if (!steamId) {
      return NextResponse.redirect(`${SITE_URL}/login?error=steam_invalid_id`)
    }
    
    // Get Steam profile
    const profile = await getSteamProfile(steamId)
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { steamId }
    })
    
    if (!user) {
      // Create new user from Steam
      const username = profile?.personaname || `Player_${steamId.slice(-6)}`
      
      // Ensure unique username
      let finalUsername = username
      let counter = 1
      while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
        finalUsername = `${username}_${counter}`
        counter++
      }
      
      // Generate placeholder email
      const placeholderEmail = `steam_${steamId}@eldrun.local`
      
      user = await prisma.user.create({
        data: {
          username: finalUsername,
          email: placeholderEmail,
          steamId,
          avatar: profile?.avatarfull || null,
          role: 'player',
          emailVerified: false, // Steam users should add email later
          coins: 0,
          casinoCoins: 0,
          casinoWelcomeClaimed: false,
        }
      })
    } else {
      // Update avatar if changed
      if (profile?.avatarfull && profile.avatarfull !== user.avatar) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: profile.avatarfull }
        })
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
        steamId: user.steamId,
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
    console.error('Steam callback error:', error)
    return NextResponse.redirect(`${SITE_URL}/login?error=steam_error`)
  }
}
