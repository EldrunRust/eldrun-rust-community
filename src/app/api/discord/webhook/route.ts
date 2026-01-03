import { NextRequest, NextResponse } from 'next/server'
import { sendWebhook, EmbedTemplates, WebhookPayload } from '@/lib/discord'

// Webhook URLs from environment
const WEBHOOKS = {
  general: process.env.DISCORD_WEBHOOK_GENERAL || '',
  shop: process.env.DISCORD_WEBHOOK_SHOP || '',
  moderation: process.env.DISCORD_WEBHOOK_MODERATION || '',
  forum: process.env.DISCORD_WEBHOOK_FORUM || '',
  server: process.env.DISCORD_WEBHOOK_SERVER || '',
  logs: process.env.DISCORD_WEBHOOK_LOGS || ''
}

type WebhookChannel = keyof typeof WEBHOOKS

// POST /api/discord/webhook - Send webhook notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, type, data } = body as {
      channel: WebhookChannel
      type: string
      data: Record<string, unknown>
    }

    // Validate channel
    const webhookUrl = WEBHOOKS[channel]
    if (!webhookUrl) {
      return NextResponse.json(
        { error: `Webhook für Channel "${channel}" nicht konfiguriert` },
        { status: 400 }
      )
    }

    // Build payload based on type
    let payload: WebhookPayload

    switch (type) {
      case 'user_registered':
        payload = {
          embeds: [EmbedTemplates.userRegistered(
            data.username as string,
            data.avatarUrl as string | undefined
          )]
        }
        break

      case 'new_order':
        payload = {
          embeds: [EmbedTemplates.newOrder(
            data.orderId as string,
            data.username as string,
            data.total as number,
            data.items as string[]
          )]
        }
        break

      case 'player_banned':
        payload = {
          embeds: [EmbedTemplates.playerBanned(
            data.playerName as string,
            data.reason as string,
            data.duration as string,
            data.bannedBy as string
          )]
        }
        break

      case 'server_event':
        payload = {
          embeds: [EmbedTemplates.serverEvent(
            data.eventType as string,
            data.title as string,
            data.description as string
          )]
        }
        break

      case 'new_forum_post':
        payload = {
          embeds: [EmbedTemplates.newForumPost(
            data.title as string,
            data.author as string,
            data.boardName as string,
            data.url as string
          )]
        }
        break

      case 'vote_reminder':
        payload = {
          embeds: [EmbedTemplates.voteReminder()]
        }
        break

      case 'custom':
        payload = {
          content: data.content as string | undefined,
          embeds: data.embeds as WebhookPayload['embeds']
        }
        break

      default:
        return NextResponse.json(
          { error: `Unbekannter Notification-Typ: ${type}` },
          { status: 400 }
        )
    }

    // Add ELDRUN branding
    payload.username = 'ELDRUN'
    payload.avatar_url = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`
      : undefined

    // Send webhook
    const success = await sendWebhook(webhookUrl, payload)

    if (!success) {
      return NextResponse.json(
        { error: 'Webhook konnte nicht gesendet werden' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification gesendet'
    })

  } catch (error) {
    console.error('Discord webhook error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Notification' },
      { status: 500 }
    )
  }
}

// GET /api/discord/webhook - Test webhook configuration
export async function GET() {
  const status: Record<string, boolean> = {}

  for (const [channel, url] of Object.entries(WEBHOOKS)) {
    status[channel] = !!url
  }

  return NextResponse.json({
    webhooks: status,
    configured: Object.values(status).filter(Boolean).length,
    total: Object.keys(status).length
  })
}
