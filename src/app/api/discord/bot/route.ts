import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getGuildMember } from '@/lib/discord'

// Bot Command Handlers
// These endpoints are called by the Discord bot to interact with the website

// GET /api/discord/bot - Bot status and info
export async function GET() {
  return NextResponse.json({
    name: 'ELDRUN Bot',
    version: '1.0.0',
    status: 'online',
    commands: [
      '/link <code> - Verknüpfe Discord mit Website',
      '/stats - Zeige Server-Statistiken',
      '/profile <user> - Zeige Spieler-Profil',
      '/leaderboard - Top 10 Spieler',
      '/vote - Vote-Links anzeigen',
      '/shop - Shop-Link',
      '/help - Hilfe anzeigen'
    ]
  })
}

// POST /api/discord/bot - Handle bot commands
export async function POST(request: NextRequest) {
  try {
    // Verify bot token
    const authHeader = request.headers.get('Authorization')
    const botToken = process.env.DISCORD_BOT_API_KEY
    
    if (!botToken || authHeader !== `Bearer ${botToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { command, discordId, args } = body

    switch (command) {
      case 'link': {
        // Link Discord account with website account using a code
        const linkCode = args?.code
        if (!linkCode) {
          return NextResponse.json({
            success: false,
            message: 'Bitte gib einen Verknüpfungscode an. `/link <code>`'
          })
        }

        // Find pending link request
        const pendingLink = await prisma.user.findFirst({
          where: {
            verifyToken: linkCode,
            discordId: null
          }
        })

        if (!pendingLink) {
          return NextResponse.json({
            success: false,
            message: 'Ungültiger oder abgelaufener Code.'
          })
        }

        // Check if Discord already linked
        const existingLink = await prisma.user.findUnique({
          where: { discordId }
        })

        if (existingLink) {
          return NextResponse.json({
            success: false,
            message: 'Dein Discord-Konto ist bereits mit einem anderen Account verknüpft.'
          })
        }

        // Link accounts
        await prisma.user.update({
          where: { id: pendingLink.id },
          data: { 
            discordId,
            verifyToken: null
          }
        })

        return NextResponse.json({
          success: true,
          message: `✅ Erfolgreich verknüpft mit **${pendingLink.username}**!`
        })
      }

      case 'stats': {
        // Get server statistics
        const [
          totalUsers,
          onlineUsers,
          totalOrders,
          totalPosts
        ] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({
            where: {
              lastActive: {
                gte: new Date(Date.now() - 15 * 60 * 1000) // Active in last 15 min
              }
            }
          }),
          prisma.shopOrder.count(),
          prisma.forumPost.count()
        ])

        return NextResponse.json({
          success: true,
          embed: {
            title: '📊 ELDRUN Statistiken',
            fields: [
              { name: 'Registrierte Spieler', value: totalUsers.toLocaleString(), inline: true },
              { name: 'Online', value: onlineUsers.toLocaleString(), inline: true },
              { name: 'Shop-Bestellungen', value: totalOrders.toLocaleString(), inline: true },
              { name: 'Forum-Beiträge', value: totalPosts.toLocaleString(), inline: true }
            ],
            color: 0xc45c3c
          }
        })
      }

      case 'profile': {
        // Get user profile
        const targetDiscordId = args?.userId || discordId
        
        const user = await prisma.user.findUnique({
          where: { discordId: targetDiscordId },
          select: {
            username: true,
            displayName: true,
            level: true,
            xp: true,
            coins: true,
            faction: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                forumPosts: true,
                shopOrders: true
              }
            }
          }
        })

        if (!user) {
          return NextResponse.json({
            success: false,
            message: 'Kein verknüpftes ELDRUN-Konto gefunden.'
          })
        }

        return NextResponse.json({
          success: true,
          embed: {
            title: `👤 ${user.displayName || user.username}`,
            fields: [
              { name: 'Level', value: user.level.toString(), inline: true },
              { name: 'XP', value: user.xp.toLocaleString(), inline: true },
              { name: 'Coins', value: user.coins.toLocaleString(), inline: true },
              { name: 'Fraktion', value: user.faction || 'Keine', inline: true },
              { name: 'Rolle', value: user.role, inline: true },
              { name: 'Forum Posts', value: user._count.forumPosts.toString(), inline: true },
              { name: 'Dabei seit', value: new Date(user.createdAt).toLocaleDateString('de-DE'), inline: true }
            ],
            color: user.faction === 'seraphar' ? 0xf4a460 : user.faction === 'vorgaroth' ? 0x8b0000 : 0xc45c3c
          }
        })
      }

      case 'leaderboard': {
        // Get top 10 players
        const topPlayers = await prisma.user.findMany({
          take: 10,
          orderBy: { xp: 'desc' },
          select: {
            username: true,
            level: true,
            xp: true,
            faction: true
          }
        })

        const leaderboardText = topPlayers
          .map((p, i) => `${i + 1}. **${p.username}** - Level ${p.level} (${p.xp.toLocaleString()} XP)`)
          .join('\n')

        return NextResponse.json({
          success: true,
          embed: {
            title: '🏆 Top 10 Spieler',
            description: leaderboardText,
            color: 0xffd700
          }
        })
      }

      case 'vote': {
        const voteSites = await prisma.voteSite.findMany({
          where: { isActive: true },
          select: { name: true, url: true, rewardCoins: true }
        })

        const voteText = voteSites
          .map(s => `• [${s.name}](${s.url}) - ${s.rewardCoins} Coins`)
          .join('\n')

        return NextResponse.json({
          success: true,
          embed: {
            title: '🗳️ Vote für ELDRUN!',
            description: voteText || 'Keine Vote-Sites verfügbar.',
            footer: { text: 'Täglich voten für Belohnungen!' },
            color: 0x57F287
          }
        })
      }

      case 'shop': {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eldrun.de'
        
        return NextResponse.json({
          success: true,
          embed: {
            title: '🛒 ELDRUN Shop',
            description: `Besuche unseren Shop für VIP-Pakete, Kits und mehr!`,
            url: `${siteUrl}/shop`,
            fields: [
              { name: 'Zahlungsmethoden', value: 'PayPal, Kreditkarte, Paysafecard', inline: false }
            ],
            color: 0x5865F2
          }
        })
      }

      default:
        return NextResponse.json({
          success: false,
          message: `Unbekannter Befehl: ${command}`
        })
    }

  } catch (error) {
    console.error('Discord bot command error:', error)
    return NextResponse.json(
      { error: 'Interner Fehler' },
      { status: 500 }
    )
  }
}
