import { NextRequest, NextResponse } from 'next/server'
import { DEMO_FORUM_USERS } from '@/store/forumStore'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowDemoFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

// GET /api/forum/online - Get currently online users
export async function GET(request: NextRequest) {
  try {
    if (!useDb) {
      if (allowDemoFallback) {
        return NextResponse.json({ users: DEMO_FORUM_USERS })
      }

      return NextResponse.json(
        { users: [], error: 'DATABASE_URL ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    const prisma = (await import('@/lib/db')).default
    const now = new Date()
    // Users active in last 15 minutes are considered online
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

    const users = await prisma.user.findMany({
      where: {
        lastActive: { gte: fifteenMinutesAgo }
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        faction: true,
        lastActive: true
      },
      orderBy: { lastActive: 'desc' },
      take: 50
    })

    const formattedUsers = users.map(user => ({
      ...user,
      // Add any additional formatting here if needed
    }))

    return NextResponse.json({
      users: formattedUsers
    })

  } catch (error) {
    console.error('Error fetching online users:', error)
    // Demo fallback
    return NextResponse.json({ users: DEMO_FORUM_USERS })
  }
}
