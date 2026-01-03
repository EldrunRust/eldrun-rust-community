import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendVoteRewardEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { userId, siteId } = await request.json()

    if (!userId || !siteId) {
      return NextResponse.json(
        { error: 'userId und siteId erforderlich' },
        { status: 400 }
      )
    }

    // Get vote site config
    const voteSite = await prisma.voteSite.findUnique({
      where: { siteId }
    })

    if (!voteSite || !voteSite.isActive) {
      return NextResponse.json(
        { error: 'Vote-Seite nicht gefunden oder inaktiv' },
        { status: 404 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Check cooldown
    const cooldownMs = voteSite.cooldownHours * 60 * 60 * 1000
    const lastVote = await prisma.vote.findFirst({
      where: {
        userId,
        siteId,
        votedAt: { gt: new Date(Date.now() - cooldownMs) }
      },
      orderBy: { votedAt: 'desc' }
    })

    if (lastVote) {
      const nextVoteTime = new Date(lastVote.votedAt.getTime() + cooldownMs)
      const remainingMs = nextVoteTime.getTime() - Date.now()
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000))
      
      return NextResponse.json(
        { 
          error: `Du kannst erst in ${remainingHours} Stunde(n) wieder voten.`,
          nextVoteAt: nextVoteTime.toISOString()
        },
        { status: 429 }
      )
    }

    // Create vote record
    const vote = await prisma.vote.create({
      data: {
        user: { connect: { id: userId } },
        siteId,
        siteName: voteSite.name,
        rewardCoins: voteSite.rewardCoins,
        rewardXp: voteSite.rewardXp,
        claimed: true,
      }
    })

    // Update user coins and XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: voteSite.rewardCoins },
        xp: { increment: voteSite.rewardXp },
      }
    })

    // Send vote reward email (async)
    if (user.email && !user.email.includes('@eldrun.local')) {
      sendVoteRewardEmail(
        user.email,
        user.username,
        voteSite.name,
        voteSite.rewardCoins,
        voteSite.rewardXp
      ).catch(err => console.error('Failed to send vote reward email:', err))
    }

    return NextResponse.json({
      success: true,
      message: `Danke fürs Voten! +${voteSite.rewardCoins} Coins, +${voteSite.rewardXp} XP`,
      reward: {
        coins: voteSite.rewardCoins,
        xp: voteSite.rewardXp,
      },
      vote
    })

  } catch (error) {
    console.error('Vote claim error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}
