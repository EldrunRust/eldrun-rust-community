import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { optionalUser, requireAuth } from '@/lib/auth'
import { getEffectiveBoardAccessPolicy } from '@/lib/forumAccessPolicy'

// GET /api/forum/threads/[id] - Get single thread with posts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const threadId = params.id

    const viewer = await optionalUser(request)

    // Increment view count
    await prisma.forumThread.update({
      where: { id: threadId },
      data: { views: { increment: 1 } }
    })

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
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
        board: {
          select: { 
            id: true, 
            name: true, 
            slug: true,
            category: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        tags: true,
        _count: {
          select: { posts: true }
        }
      }
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
    const isStaffByViewer = viewer?.role === 'admin' || viewer?.role === 'moderator' || viewer?.role === 'superadmin'
    if (policy.factionOnly && !isStaffByViewer) {
      if (!viewer?.faction || viewer.faction !== policy.factionOnly) {
        return NextResponse.json({ error: 'Thread nicht gefunden' }, { status: 404 })
      }
    }

    return NextResponse.json({
      thread: {
        ...thread,
        postCount: thread._count.posts,
        _count: undefined
      }
    })
  } catch (error) {
    console.error('Get forum thread error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Threads' },
      { status: 500 }
    )
  }
}

// PATCH /api/forum/threads/[id] - Update thread (title, content, status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request)
  if (!auth.success || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const threadId = params.id
    const body = await request.json()
    const { title, content, isPinned, isLocked, isAnnouncement } = body

    // Check if user is author or moderator/admin
    const viewer = await optionalUser(request)
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      select: { authorId: true, board: { select: { id: true, slug: true, category: { select: { id: true, slug: true } } } } }
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
    const isStaffByViewer = viewer?.role === 'admin' || viewer?.role === 'moderator' || viewer?.role === 'superadmin'
    if (policy.factionOnly && !isStaffByViewer) {
      if (!viewer?.faction || viewer.faction !== policy.factionOnly) {
        return NextResponse.json({ error: 'Thread nicht gefunden' }, { status: 404 })
      }
    }

    const isAuthor = thread.authorId === auth.user.userId
    const isModerator = ['moderator', 'admin', 'superadmin'].includes(auth.user.role)

    if (!isAuthor && !isModerator) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    
    // Authors can only update title and content
    if (title !== undefined && (isAuthor || isModerator)) {
      updateData.title = title
      updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100)
    }
    if (content !== undefined && (isAuthor || isModerator)) {
      updateData.content = content
    }
    
    // Only moderators can change status
    if (isModerator) {
      if (isPinned !== undefined) updateData.isPinned = isPinned
      if (isLocked !== undefined) updateData.isLocked = isLocked
      if (isAnnouncement !== undefined) updateData.isAnnouncement = isAnnouncement
    }

    const updatedThread = await prisma.forumThread.update({
      where: { id: threadId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      thread: updatedThread
    })
  } catch (error) {
    console.error('Update forum thread error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Threads' },
      { status: 500 }
    )
  }
}

// DELETE /api/forum/threads/[id] - Delete thread (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request)
  if (!auth.success || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const threadId = params.id

    const viewer = await optionalUser(request)
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      select: { authorId: true, boardId: true, board: { select: { id: true, slug: true, category: { select: { id: true, slug: true } } } } }
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
    const isStaffByViewer = viewer?.role === 'admin' || viewer?.role === 'moderator' || viewer?.role === 'superadmin'
    if (policy.factionOnly && !isStaffByViewer) {
      if (!viewer?.faction || viewer.faction !== policy.factionOnly) {
        return NextResponse.json({ error: 'Thread nicht gefunden' }, { status: 404 })
      }
    }

    const isAuthor = thread.authorId === auth.user.userId
    const isModerator = ['moderator', 'admin', 'superadmin'].includes(auth.user.role)

    if (!isAuthor && !isModerator) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      )
    }

    // Soft delete - mark as deleted but keep data
    await prisma.forumThread.update({
      where: { id: threadId },
      data: { isDeleted: true }
    })

    // Update board thread count
    await prisma.forumBoard.update({
      where: { id: thread.boardId },
      data: { threadCount: { decrement: 1 } }
    })

    return NextResponse.json({
      success: true,
      message: 'Thread gelöscht'
    })
  } catch (error) {
    console.error('Delete forum thread error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Threads' },
      { status: 500 }
    )
  }
}
