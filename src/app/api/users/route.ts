import { NextRequest, NextResponse } from 'next/server'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

export const dynamic = 'force-dynamic'

const DEMO_USERS = Array.from({ length: 24 }).map((_, i) => {
  const factions = ['seraphar', 'vorgaroth', null] as const
  const roles = ['player', 'vip', 'moderator', 'admin'] as const
  const faction = factions[i % factions.length]
  const role = roles[i % roles.length]
  const createdAt = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
  const lastActive = new Date(Date.now() - (i % 6) * 60 * 60 * 1000)
  return {
    id: `demo-user-${i + 1}`,
    username: `DemoUser${String(i + 1).padStart(2, '0')}`,
    displayName: `Demo User ${i + 1}`,
    avatar: null,
    role,
    faction,
    createdAt,
    lastActive,
    _count: { forumPosts: Math.max(0, 200 - i * 7), forumThreads: Math.max(0, 60 - i * 2) },
  }
})

// GET /api/users - Get users list with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '20', 10) || 20, 100)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)
    const search = searchParams.get('search') || ''
    const sortByParam = searchParams.get('sortBy')
    const sortBy =
      sortByParam && ['createdAt', 'lastActive', 'username', 'displayName', 'role'].includes(sortByParam)
        ? sortByParam
        : 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { error: 'DATABASE_URL ist nicht konfiguriert' },
          { status: 500 }
        )
      }

      const filtered = !search
        ? DEMO_USERS
        : DEMO_USERS.filter((u) =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            (u.displayName || '').toLowerCase().includes(search.toLowerCase())
          )

      const start = (page - 1) * limit
      const users = filtered.slice(start, start + limit)
      const total = filtered.length

      return NextResponse.json({
        success: true,
        simulated: true,
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    }

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { displayName: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const prisma = (await import('@/lib/db')).default

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          role: true,
          faction: true,
          createdAt: true,
          lastActive: true,
          _count: {
            select: {
              forumPosts: true,
              forumThreads: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder } as any,
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Benutzer' },
      { status: 500 }
    )
  }
}
