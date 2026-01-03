// Twitch API Integration
// ═══════════════════════════════════════════════════════════════════════════

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET

interface TwitchAccessToken {
  access_token: string
  expires_in: number
  token_type: string
}

interface TwitchStream {
  id: string
  user_id: string
  user_login: string
  user_name: string
  game_id: string
  game_name: string
  type: string
  title: string
  viewer_count: number
  started_at: string
  language: string
  thumbnail_url: string
  is_mature: boolean
}

interface TwitchUser {
  id: string
  login: string
  display_name: string
  type: string
  broadcaster_type: string
  description: string
  profile_image_url: string
  offline_image_url: string
  view_count: number
  created_at: string
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error('Twitch credentials nicht konfiguriert')
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )

  if (!response.ok) {
    throw new Error('Twitch Auth fehlgeschlagen')
  }

  const data: TwitchAccessToken = await response.json()
  
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return data.access_token
}

// Get streams for a specific game (Rust = 263490)
export async function getRustStreams(limit = 20): Promise<TwitchStream[]> {
  if (!isTwitchConfigured()) {
    return []
  }

  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?game_id=263490&first=${limit}`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.data || []
  } catch (e) {
    console.error('Twitch API error:', e)
    return []
  }
}

// Search streams by title/tag containing keywords
export async function searchStreams(query: string, limit = 20): Promise<TwitchStream[]> {
  if (!isTwitchConfigured()) return []

  try {
    const token = await getAccessToken()
    
    // Get Rust streams and filter by query
    const streams = await getRustStreams(100)
    
    const filtered = streams.filter(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.user_name.toLowerCase().includes(query.toLowerCase())
    )
    
    return filtered.slice(0, limit)
  } catch (e) {
    console.error('Twitch search error:', e)
    return []
  }
}

// Get specific streamer info
export async function getStreamer(username: string): Promise<TwitchUser | null> {
  if (!isTwitchConfigured()) return null

  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${username}`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.data?.[0] || null
  } catch (e) {
    console.error('Twitch user error:', e)
    return null
  }
}

// Check if a specific streamer is live
export async function isStreamerLive(username: string): Promise<{ live: boolean; stream?: TwitchStream }> {
  if (!isTwitchConfigured()) return { live: false }

  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${username}`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) return { live: false }

    const data = await response.json()
    const stream = data.data?.[0]
    
    return {
      live: !!stream && stream.type === 'live',
      stream,
    }
  } catch (e) {
    console.error('Twitch live check error:', e)
    return { live: false }
  }
}

// Get clips for Rust
export async function getRustClips(limit = 10): Promise<Array<{
  id: string
  url: string
  embed_url: string
  broadcaster_name: string
  title: string
  view_count: number
  created_at: string
  thumbnail_url: string
  duration: number
}>> {
  if (!isTwitchConfigured()) return []

  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `https://api.twitch.tv/helix/clips?game_id=263490&first=${limit}`,
      {
        headers: {
          'Client-ID': TWITCH_CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.data || []
  } catch (e) {
    console.error('Twitch clips error:', e)
    return []
  }
}

export function isTwitchConfigured(): boolean {
  return !!(TWITCH_CLIENT_ID && TWITCH_CLIENT_SECRET)
}

const twitch = {
  getRustStreams,
  searchStreams,
  getStreamer,
  isStreamerLive,
  getRustClips,
  isTwitchConfigured,
}

export default twitch
