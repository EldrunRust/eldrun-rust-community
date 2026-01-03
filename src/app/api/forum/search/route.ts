import { NextRequest, NextResponse } from 'next/server'

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0)
const deploymentEnv = process.env.ELDRUN_DEPLOYMENT || process.env.VERCEL_ENV
const isProdDeployment = deploymentEnv ? deploymentEnv === 'production' : process.env.NODE_ENV === 'production'
const allowSimulationFallback =
  !isProdDeployment && (process.env.DEMO_MODE === 'true' || process.env.SIMULATION_MODE === 'true')
const useDb = hasDb

export const dynamic = 'force-dynamic'

// GET /api/forum/search - Search forum threads and posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'all' // all, threads, posts, users
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], query: '' })
    }

    if (!useDb) {
      if (!allowSimulationFallback) {
        return NextResponse.json(
          { error: 'DATABASE_URL ist nicht konfiguriert', results: [] },
          { status: 500 }
        )
      }

      return NextResponse.json({ results: [], query, total: 0, simulated: true })
    }

    const prisma = (await import('@/lib/db')).default

    type SearchResult =
      | { type: 'thread'; id: string; title: string; excerpt: string; authorName: string; createdAt: Date; boardName: string; relevance: number }
      | { type: 'post'; id: string; title: string; excerpt: string; authorName: string; createdAt: Date; threadTitle: string; threadId: string; relevance: number }
      | { type: 'user'; id: string; title: string; excerpt: string; authorName: string; createdAt: Date; avatar: string | null; role: string; relevance: number }

    const results: SearchResult[] = []

    // Search threads
    if (type === 'all' || type === 'threads') {
      const threads = await prisma.forumThread.findMany({
        where: {
          isDeleted: false,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ]
        },
        include: {
          author: {
            select: { id: true, username: true, displayName: true }
          },
          board: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'threads' ? limit : Math.floor(limit / 2)
      })

      threads.forEach(thread => {
        results.push({
          type: 'thread',
          id: thread.id,
          title: thread.title,
          excerpt: thread.content.substring(0, 200),
          authorName: thread.author.displayName || thread.author.username,
          createdAt: thread.createdAt,
          boardName: thread.board.name,
          relevance: thread.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 1
        })
      })
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.forumPost.findMany({
        where: {
          content: { contains: query }
        },
        include: {
          author: {
            select: { id: true, username: true, displayName: true }
          },
          thread: {
            select: { id: true, title: true, boardId: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'posts' ? limit : Math.floor(limit / 2)
      })

      posts.forEach(post => {
        results.push({
          type: 'post',
          id: post.id,
          title: post.thread.title,
          excerpt: post.content.substring(0, 200),
          authorName: post.author.displayName || post.author.username,
          createdAt: post.createdAt,
          threadTitle: post.thread.title,
          threadId: post.thread.id,
          relevance: 1
        })
      })
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query } },
            { displayName: { contains: query } }
          ]
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          role: true,
          createdAt: true,
          _count: {
            select: { forumPosts: true, forumThreads: true }
          }
        },
        take: type === 'users' ? limit : 5
      })

      users.forEach(user => {
        results.push({
          type: 'user',
          id: user.id,
          title: user.displayName || user.username,
          excerpt: `${user._count.forumPosts} Beiträge, ${user._count.forumThreads} Themen`,
          authorName: user.displayName || user.username,
          createdAt: user.createdAt,
          avatar: user.avatar,
          role: user.role,
          relevance: (user.displayName || user.username).toLowerCase().startsWith(query.toLowerCase()) ? 3 : 1
        })
      })
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance)

    return NextResponse.json({
      results: results.slice(0, limit),
      query,
      total: results.length
    })

  } catch (error) {
    console.error('Forum search error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Suche', results: [] },
      { status: 500 }
    )
  }
}
