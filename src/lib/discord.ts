// Discord Integration Service
// ═══════════════════════════════════════════════════════════════════════════

const DISCORD_API_URL = 'https://discord.com/api/v10'
const DISCORD_CDN_URL = 'https://cdn.discordapp.com'

// Environment variables (set in .env)
const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || ''
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || ''
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || ''
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/discord/callback'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  global_name?: string
  avatar?: string
  email?: string
  verified?: boolean
  banner?: string
  accent_color?: number
}

export interface DiscordGuildMember {
  user: DiscordUser
  nick?: string
  avatar?: string
  roles: string[]
  joined_at: string
  premium_since?: string
}

export interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  permissions: string
}

export interface WebhookPayload {
  content?: string
  username?: string
  avatar_url?: string
  embeds?: DiscordEmbed[]
}

export interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  timestamp?: string
  color?: number
  footer?: { text: string; icon_url?: string }
  image?: { url: string }
  thumbnail?: { url: string }
  author?: { name: string; url?: string; icon_url?: string }
  fields?: Array<{ name: string; value: string; inline?: boolean }>
}

// ═══════════════════════════════════════════════════════════════════════════
// OAUTH2
// ═══════════════════════════════════════════════════════════════════════════

export function getDiscordAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds guilds.members.read',
    ...(state && { state })
  })
  
  return `https://discord.com/api/oauth2/authorize?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
} | null> {
  try {
    const response = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI
      })
    })

    if (!response.ok) {
      console.error('Discord token exchange failed:', await response.text())
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Discord token exchange error:', error)
    return null
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
} | null> {
  try {
    const response = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error('Discord refresh token error:', error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// USER API
// ═══════════════════════════════════════════════════════════════════════════

export async function getDiscordUser(accessToken: string): Promise<DiscordUser | null> {
  try {
    const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error('Discord get user error:', error)
    return null
  }
}

export async function getUserGuilds(accessToken: string): Promise<Array<{
  id: string
  name: string
  icon?: string
  owner: boolean
  permissions: string
}> | null> {
  try {
    const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error('Discord get guilds error:', error)
    return null
  }
}

export function getDiscordAvatarUrl(user: DiscordUser, size = 128): string {
  if (user.avatar) {
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png'
    return `${DISCORD_CDN_URL}/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`
  }
  
  // Default avatar
  const defaultIndex = parseInt(user.discriminator) % 5
  return `${DISCORD_CDN_URL}/embed/avatars/${defaultIndex}.png`
}

// ═══════════════════════════════════════════════════════════════════════════
// GUILD/SERVER API (Bot Token required)
// ═══════════════════════════════════════════════════════════════════════════

export async function getGuildMember(userId: string): Promise<DiscordGuildMember | null> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) return null

  try {
    const response = await fetch(
      `${DISCORD_API_URL}/guilds/${DISCORD_GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    )

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error('Discord get guild member error:', error)
    return null
  }
}

export async function getGuildRoles(): Promise<DiscordRole[] | null> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) return null

  try {
    const response = await fetch(
      `${DISCORD_API_URL}/guilds/${DISCORD_GUILD_ID}/roles`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    )

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error('Discord get roles error:', error)
    return null
  }
}

export async function addRoleToMember(userId: string, roleId: string): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) return false

  try {
    const response = await fetch(
      `${DISCORD_API_URL}/guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    )

    return response.ok
  } catch (error) {
    console.error('Discord add role error:', error)
    return false
  }
}

export async function removeRoleFromMember(userId: string, roleId: string): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) return false

  try {
    const response = await fetch(
      `${DISCORD_API_URL}/guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${roleId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    )

    return response.ok
  } catch (error) {
    console.error('Discord remove role error:', error)
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOKS
// ═══════════════════════════════════════════════════════════════════════════

export async function sendWebhook(webhookUrl: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    return response.ok
  } catch (error) {
    console.error('Discord webhook error:', error)
    return false
  }
}

// Pre-built embed templates
export const EmbedTemplates = {
  // New user registered
  userRegistered: (username: string, avatarUrl?: string): DiscordEmbed => ({
    title: '🎮 Neuer Spieler registriert!',
    description: `**${username}** hat sich bei ELDRUN registriert.`,
    color: 0x57F287, // Green
    thumbnail: avatarUrl ? { url: avatarUrl } : undefined,
    timestamp: new Date().toISOString(),
    footer: { text: 'ELDRUN Community' }
  }),

  // New shop order
  newOrder: (orderId: string, username: string, total: number, items: string[]): DiscordEmbed => ({
    title: '🛒 Neue Bestellung!',
    description: `**${username}** hat eine Bestellung aufgegeben.`,
    color: 0x5865F2, // Discord Blurple
    fields: [
      { name: 'Bestellung', value: `#${orderId}`, inline: true },
      { name: 'Betrag', value: `€${total.toFixed(2)}`, inline: true },
      { name: 'Artikel', value: items.join('\n') || 'Keine Artikel' }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'ELDRUN Shop' }
  }),

  // Player ban
  playerBanned: (playerName: string, reason: string, duration: string, bannedBy: string): DiscordEmbed => ({
    title: '🔨 Spieler gebannt',
    description: `**${playerName}** wurde vom Server gebannt.`,
    color: 0xED4245, // Red
    fields: [
      { name: 'Grund', value: reason },
      { name: 'Dauer', value: duration, inline: true },
      { name: 'Gebannt von', value: bannedBy, inline: true }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'ELDRUN Moderation' }
  }),

  // Server event
  serverEvent: (eventType: string, title: string, description: string): DiscordEmbed => ({
    title: `🎯 ${title}`,
    description,
    color: 0xFEE75C, // Yellow
    fields: [
      { name: 'Event', value: eventType, inline: true }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'ELDRUN Server' }
  }),

  // Forum post
  newForumPost: (title: string, author: string, boardName: string, url: string): DiscordEmbed => ({
    title: '📝 Neuer Forum-Beitrag',
    description: `**${author}** hat einen neuen Beitrag erstellt.`,
    color: 0x9B59B6, // Purple
    fields: [
      { name: 'Titel', value: title },
      { name: 'Board', value: boardName, inline: true }
    ],
    url,
    timestamp: new Date().toISOString(),
    footer: { text: 'ELDRUN Forum' }
  }),

  // Vote reminder
  voteReminder: (): DiscordEmbed => ({
    title: '🗳️ Vote für ELDRUN!',
    description: 'Unterstütze unseren Server und erhalte tolle Belohnungen!',
    color: 0xE67E22, // Orange
    fields: [
      { name: 'Belohnungen', value: '• 500 Coins\n• 100 XP\n• Exklusive Items' }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: 'ELDRUN Voting' }
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE SYNC MAPPING
// ═══════════════════════════════════════════════════════════════════════════

// Map website roles to Discord role IDs
export const ROLE_MAPPING: Record<string, string> = {
  // Website Role -> Discord Role ID
  'vip': process.env.DISCORD_ROLE_VIP || '',
  'vip_plus': process.env.DISCORD_ROLE_VIP_PLUS || '',
  'moderator': process.env.DISCORD_ROLE_MODERATOR || '',
  'admin': process.env.DISCORD_ROLE_ADMIN || '',
  'verified': process.env.DISCORD_ROLE_VERIFIED || ''
}

export async function syncUserRoles(
  discordUserId: string, 
  websiteRoles: string[]
): Promise<{ added: string[]; removed: string[] }> {
  const result = { added: [] as string[], removed: [] as string[] }
  
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    return result
  }

  // Get current Discord roles
  const member = await getGuildMember(discordUserId)
  if (!member) return result

  const currentRoles = new Set(member.roles)

  // Sync each mapped role
  for (const [websiteRole, discordRoleId] of Object.entries(ROLE_MAPPING)) {
    if (!discordRoleId) continue

    const shouldHaveRole = websiteRoles.includes(websiteRole)
    const hasRole = currentRoles.has(discordRoleId)

    if (shouldHaveRole && !hasRole) {
      // Add role
      if (await addRoleToMember(discordUserId, discordRoleId)) {
        result.added.push(websiteRole)
      }
    } else if (!shouldHaveRole && hasRole) {
      // Remove role
      if (await removeRoleFromMember(discordUserId, discordRoleId)) {
        result.removed.push(websiteRole)
      }
    }
  }

  return result
}
