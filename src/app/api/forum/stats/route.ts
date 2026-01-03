import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { DEMO_FORUM_USERS } from '@/store/forumStore'

// GET /api/forum/stats - Get public forum statistics
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get forum statistics
    const [
      totalThreads,
      totalPosts,
      totalMembers,
      threadsToday,
      postsToday,
      newestMember
    ] = await Promise.all([
      prisma.forumThread.count({ where: { isDeleted: false } }),
      prisma.forumPost.count(),
      prisma.user.count(),
      prisma.forumThread.count({ where: { createdAt: { gte: today }, isDeleted: false } }),
      prisma.forumPost.count({ where: { createdAt: { gte: today } } }),
      prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          displayName: true,
          createdAt: true
        }
      })
    ])

    // Get online users (active in last 15 minutes)
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
    const onlineUsers = await prisma.user.count({
      where: { lastActive: { gte: fifteenMinutesAgo } }
    })

    // Get record from ServerConfig if it exists
    let recordOnline = onlineUsers
    let recordOnlineDate = now
    
    const recordConfig = await prisma.serverConfig.findUnique({
      where: { key: 'forum_record_online' }
    })
    
    if (recordConfig) {
      const recordData = JSON.parse(recordConfig.value)
      recordOnline = Math.max(recordData.count || 0, onlineUsers)
      recordOnlineDate = recordData.date ? new Date(recordData.date) : now
      
      // Update if new record
      if (onlineUsers > (recordData.count || 0)) {
        await prisma.serverConfig.update({
          where: { key: 'forum_record_online' },
          data: { value: JSON.stringify({ count: onlineUsers, date: now.toISOString() }) }
        })
        recordOnlineDate = now
      }
    } else {
      // Create record config
      await prisma.serverConfig.create({
        data: {
          key: 'forum_record_online',
          value: JSON.stringify({ count: onlineUsers, date: now.toISOString() }),
          description: 'Record number of online users in forum'
        }
      })
    }

    // Estimate online guests (could be tracked via sessions in production)
    const onlineGuests = Math.floor(onlineUsers * 2.5)

    return NextResponse.json({
      totalThreads,
      totalPosts,
      totalMembers,
      newestMember,
      onlineUsers,
      onlineGuests,
      recordOnline,
      recordOnlineDate,
      postsToday,
      threadsToday
    })

  } catch (error) {
    console.error('Forum stats error:', error)
    // Demo fallback
    const onlineUsers = DEMO_FORUM_USERS.length
    return NextResponse.json({
      totalThreads: 420,
      totalPosts: 6800,
      totalMembers: 1280,
      newestMember: { id: 'demo-new', username: 'NewComer', displayName: 'NewComer', createdAt: new Date() },
      onlineUsers,
      onlineGuests: Math.floor(onlineUsers * 2.5),
      recordOnline: 420,
      recordOnlineDate: new Date(),
      postsToday: 42,
      threadsToday: 7,
    })
  }
}
