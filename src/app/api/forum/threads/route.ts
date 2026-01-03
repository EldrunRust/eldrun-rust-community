import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { optionalUser, requireAuth } from '@/lib/auth'
import { getEffectiveBoardAccessPolicy } from '@/lib/forumAccessPolicy'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get('boardId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const viewer = await optionalUser(request)

    if (boardId) {
      const board = await prisma.forumBoard.findUnique({
        where: { id: boardId },
        select: { id: true, slug: true, category: { select: { id: true, slug: true } } }
      })

      if (!board) {
        return NextResponse.json({ error: 'Board nicht gefunden' }, { status: 404 })
      }

      const policy = getEffectiveBoardAccessPolicy({
        categoryId: board.category?.id,
        categorySlug: board.category?.slug,
        boardId: board.id,
        boardSlug: board.slug,
      })
      const isStaff = viewer?.role === 'admin' || viewer?.role === 'moderator' || viewer?.role === 'superadmin'
      if (policy.factionOnly && !isStaff) {
        if (!viewer?.faction || viewer.faction !== policy.factionOnly) {
          return NextResponse.json({ error: 'Board nicht gefunden' }, { status: 404 })
        }
      }
    }

    const where = boardId ? { boardId, isDeleted: false } : { isDeleted: false }

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, username: true, avatar: true, role: true }
          },
          board: {
            select: { id: true, name: true, slug: true }
          },
          _count: {
            select: { posts: true }
          }
        }
      }),
      prisma.forumThread.count({ where })
    ])

    return NextResponse.json({
      threads: threads.map(t => ({
        ...t,
        postCount: t._count.posts,
        _count: undefined
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get forum threads error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Threads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Auth check - user must be logged in to create threads
  const auth = await requireAuth(request)
  if (!auth.success || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { boardId, title, content } = body
    const authorId = auth.user.userId // Use authenticated user's ID

    if (!boardId || !title || !content || !authorId) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    // Verify board exists and access is allowed
    const board = await prisma.forumBoard.findUnique({
      where: { id: boardId },
      select: { id: true, slug: true, category: { select: { id: true, slug: true } } }
    })

    if (!board) {
      return NextResponse.json(
        { error: 'Board nicht gefunden' },
        { status: 404 }
      )
    }

    const viewer = await optionalUser(request)
    const policy = getEffectiveBoardAccessPolicy({
      categoryId: board.category?.id,
      categorySlug: board.category?.slug,
      boardId: board.id,
      boardSlug: board.slug,
    })
    const isStaff = viewer?.role === 'admin' || viewer?.role === 'moderator' || viewer?.role === 'superadmin'
    if (policy.factionOnly && !isStaff) {
      if (!viewer?.faction || viewer.faction !== policy.factionOnly) {
        return NextResponse.json(
          { error: 'Board nicht gefunden' },
          { status: 404 }
        )
      }
    }

    // Create thread
    const thread = await prisma.forumThread.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100),
        content,
        board: { connect: { id: boardId } },
        author: { connect: { id: authorId } },
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true }
        },
        board: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    // Update board thread count
    await prisma.forumBoard.update({
      where: { id: boardId },
      data: { threadCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      thread
    })
  } catch (error) {
    console.error('Create forum thread error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Threads' },
      { status: 500 }
    )
  }
}
