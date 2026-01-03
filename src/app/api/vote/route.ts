import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Vote sites configuration
const VOTE_SITES = [
  { id: 'rust-servers', name: 'Rust-Servers.net', reward: 500, cooldownHours: 12 },
  { id: 'top-rust', name: 'TopRustServers.com', reward: 500, cooldownHours: 12 },
  { id: 'trackyserver', name: 'TrackyServer.com', reward: 400, cooldownHours: 24 },
  { id: 'battlemetrics', name: 'BattleMetrics', reward: 300, cooldownHours: 24 },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get vote counts from database
    const totalVotesCount = await prisma.vote.count()
    const monthlyVotesCount = await prisma.vote.count({
      where: { votedAt: { gte: monthStart } }
    })

    // If no userId, return server stats only
    if (!userId) {
      return NextResponse.json({
        totalVotes: 0,
        monthlyVotes: 0,
        sites: VOTE_SITES.map(s => ({ ...s, canVote: true, nextVoteTime: null, lastVoted: null })),
        serverRank: null,
        serverTotalVotes: totalVotesCount,
        serverMonthlyVotes: monthlyVotesCount
      })
    }

    // Get user's votes from database
    const userVotes = await prisma.vote.findMany({
      where: { userId },
      orderBy: { votedAt: 'desc' }
    })

    const userTotalVotes = userVotes.length
    const userMonthlyVotes = userVotes.filter(v => v.votedAt >= monthStart).length

    // Calculate which sites can be voted on
    const availableSites = VOTE_SITES.map(site => {
      const lastVote = userVotes.find(v => v.siteId === site.id)
      const cooldownMs = site.cooldownHours * 3600000
      const canVote = !lastVote || (now.getTime() - lastVote.votedAt.getTime() > cooldownMs)
      const nextVoteTime = lastVote 
        ? new Date(lastVote.votedAt.getTime() + cooldownMs)
        : null

      return {
        ...site,
        canVote,
        nextVoteTime,
        lastVoted: lastVote?.votedAt
      }
    })

    // Get top voters this month
    const topVoters = await prisma.vote.groupBy({
      by: ['userId'],
      where: { votedAt: { gte: monthStart } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    })

    return NextResponse.json({
      totalVotes: userTotalVotes,
      monthlyVotes: userMonthlyVotes,
      sites: availableSites,
      dailyBonusAvailable: false,
      dailyBonusAmount: 500,
      topVoters: topVoters.map(v => ({ visitorId: v.userId, monthlyVotes: v._count?.id || 0 })),
      serverRank: null,
      serverTotalVotes: totalVotesCount,
      serverMonthlyVotes: monthlyVotesCount
    })
  } catch (error) {
    console.error('Vote GET error:', error)
    return NextResponse.json({
      totalVotes: 0,
      monthlyVotes: 0,
      sites: VOTE_SITES.map(s => ({ ...s, canVote: true, nextVoteTime: null, lastVoted: null })),
      serverRank: null,
      serverTotalVotes: 0,
      serverMonthlyVotes: 0
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, siteId } = body

    if (!userId || !siteId) {
      return NextResponse.json(
        { error: 'Fehlende Parameter' },
        { status: 400 }
      )
    }

    const site = VOTE_SITES.find(s => s.id === siteId)
    if (!site) {
      return NextResponse.json(
        { error: 'Ungültige Vote-Seite' },
        { status: 400 }
      )
    }

    // Check cooldown from database
    const lastVote = await prisma.vote.findFirst({
      where: { userId, siteId },
      orderBy: { votedAt: 'desc' }
    })

    if (lastVote) {
      const cooldownMs = site.cooldownHours * 3600000
      const timeSinceVote = Date.now() - lastVote.votedAt.getTime()
      if (timeSinceVote < cooldownMs) {
        const remainingMs = cooldownMs - timeSinceVote
        const remainingHours = Math.ceil(remainingMs / 3600000)
        return NextResponse.json(
          { error: `Du kannst erst in ${remainingHours} Stunden wieder voten.` },
          { status: 429 }
        )
      }
    }

    // Record vote in database
    await prisma.vote.create({
      data: {
        userId,
        siteId,
        siteName: site.name,
        rewardCoins: site.reward
      }
    })

    // Get updated user stats
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const userVotes = await prisma.vote.findMany({
      where: { userId },
      orderBy: { votedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      reward: site.reward,
      bonusAwarded: false,
      bonusAmount: 0,
      totalReward: site.reward,
      totalVotes: userVotes.length,
      monthlyVotes: userVotes.filter(v => v.votedAt >= monthStart).length
    })

  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    )
  }
}
