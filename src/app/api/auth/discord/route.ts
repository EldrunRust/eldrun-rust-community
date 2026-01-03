import { NextResponse } from 'next/server'

// Discord OAuth2 Authentication
// Redirects user to Discord authorization page

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const REDIRECT_URI = `${SITE_URL}/api/auth/discord/callback`

export async function GET() {
  if (!DISCORD_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Discord OAuth nicht konfiguriert' },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
  })

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`
  
  return NextResponse.redirect(discordAuthUrl)
}
