import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { optionalUser, requireAuth } from '@/lib/auth'
import { getEffectiveBoardAccessPolicy } from '@/lib/forumAccessPolicy'

// GET /api/forum/posts?threadId=xxx - Get posts for a thread
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID ist erforderlich' },
        { status: 400 }
      )
    }

    const viewer = await optionalUser(request)
    const threadMeta = await prisma.forumThread.findUnique({
      where: { id: threadId },
      select: { id: true, board: { select: { id: true, slug: true, category: { select: { id: true, slug: true } } } } }
    })

    if (!threadMeta) {
      return NextResponse.json({ error: 'Thread nicht gefunden' }, { status: 404 })
    }

    const policy = getEffectiveBoardAccessPolicy({
      categoryId: threadMeta.board.category?.id,
      categorySlug: threadMeta.board.category?.slug,
      boardId: threadMeta.board.id,
      boardSlug: threadMeta.board.slug,
    })
    const isStaff = viewer?.role === 'admin' || viewer?.role === 'moderator' || viewer?.role === 'superadmin'
    if (policy.factionOnly && !isStaff) {
      if (!viewer?.faction || viewer.faction !== policy.factionOnly) {
        return NextResponse.json({ error: 'Thread nicht gefunden' }, { status: 404 })
      }
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where: { threadId, isDeleted: false },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          author: {
            select: { 
              id: true, 
              username: true, 
              displayName: true,
              avatar: true, 
              role: true,
              level: true,
              faction: true,
              createdAt: true
            }
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              author: {
                select: { username: true }
              }
            }
          }
        }
      }),
      prisma.forumPost.count({ where: { threadId, isDeleted: false } })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get forum posts error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Posts' },
      { status: 500 }
    )
  }
}

// POST /api/forum/posts - Create a new post (reply)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.success || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { threadId, content, replyToId } = body
    const authorId = auth.user.userId

    if (!threadId || !content) {
      return NextResponse.json(
        { error: 'Thread ID und Inhalt sind erforderlich' },
        { status: 400 }
      )
    }

    // Verify thread exists and is not locked
    const viewer = await optionalUser(request)
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      select: { id: true, isLocked: true, boardId: true, board: { select: { id: true, slug: true, category: { select: { id: true, slug: true } } } } }
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread nicht gefunden' },
        { status: 404 }
      )
    }

    const policy = getEffectiveBoardAccessPolicy({
      categoryId: thread.board.category?.id,
      categorySlug: thread.board.category?.slug,
      boardId: thread.board.id,
      boardSlug: thread.board.slug,
    })
    const isStaff = viewer?.role === 'admin' || viewer?.role === 'moderator' || viewer?.role === 'superadmin'
    if (policy.factionOnly && !isStaff) {
      if (!viewer?.faction || viewer.faction !== policy.factionOnly) {
        return NextResponse.json({ error: 'Thread nicht gefunden' }, { status: 404 })
      }
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Dieser Thread ist geschlossen' },
        { status: 403 }
      )
    }

    // Create post
    const post = await prisma.forumPost.create({
      data: {
        content,
        thread: { connect: { id: threadId } },
        author: { connect: { id: authorId } },
        ...(replyToId && { replyTo: { connect: { id: replyToId } } })
      },
      include: {
        author: {
          select: { 
            id: true, 
            username: true, 
            displayName: true,
            avatar: true, 
            role: true 
          }
        }
      }
    })

    // Update thread reply count and last reply
    await prisma.forumThread.update({
      where: { id: threadId },
      data: {
        replyCount: { increment: 1 },
        lastReplyAt: new Date(),
        lastReplyById: authorId,
        updatedAt: new Date()
      }
    })

    // Update board post count
    await prisma.forumBoard.update({
      where: { id: thread.boardId },
      data: { 
        postCount: { increment: 1 },
        lastPostAt: new Date(),
        lastPostById: authorId
      }
    })

    return NextResponse.json({
      success: true,
      post
    })
  } catch (error) {
    console.error('Create forum post error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Posts' },
      { status: 500 }
    )
  }
}
