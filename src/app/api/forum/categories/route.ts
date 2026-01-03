import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { DEMO_CATEGORIES } from '@/store/forumStore'
import { optionalUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isLocked: false },
      orderBy: { order: 'asc' },
      include: {
        boards: {
          where: { isLocked: false },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { threads: true }
            },
            threads: {
              orderBy: { updatedAt: 'desc' },
              take: 1,
              select: {
                id: true,
                title: true,
                updatedAt: true,
                author: {
                  select: { username: true, avatar: true }
                }
              }
            }
          }
        }
      }
    })

    // Transform data for frontend
    const result = categories.map(cat => ({
      ...cat,
      boards: cat.boards.map(board => ({
        ...board,
        threadCount: board._count.threads,
        lastThread: board.threads[0] || null,
        _count: undefined,
        threads: undefined,
      }))
    }))

    return NextResponse.json({ categories: result })
  } catch (error) {
    console.error('Get forum categories error:', error)
    // Demo fallback with access control
    const user = await optionalUser(request)
    const isStaff = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'superadmin'
    const userFaction = user?.faction

    const filtered = DEMO_CATEGORIES.map((cat) => ({
      ...cat,
      boards: cat.boards.filter((b) => {
        if (isStaff) return true
        if (b.isPrivate && !user) return false
        if (b.factionOnly && (!userFaction || userFaction !== b.factionOnly)) return false
        return true
      })
    }))

    return NextResponse.json({ categories: filtered })
  }
}
