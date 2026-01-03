import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/achievements - Get all achievements with user progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get all achievement definitions
    const achievements = await prisma.achievement.findMany({
      orderBy: { points: 'desc' }
    })

    // If no userId, return just definitions without progress
    if (!userId) {
      return NextResponse.json({
        achievements: achievements.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon || '🏆',
          category: a.category,
          points: a.points,
          rarity: a.rarity,
          progress: undefined,
          unlockedAt: undefined
        })),
        totalPoints: 0,
        unlockedCount: 0
      })
    }

    // Get user's progress on achievements
    const userProgress = await prisma.userAchievement.findMany({
      where: { userId }
    })

    // Merge achievements with user progress
    const mergedAchievements = achievements.map(a => {
      const progress = userProgress.find(p => p.achievementId === a.id)
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon || '🏆',
        category: a.category,
        points: a.points,
        rarity: a.rarity,
        progress: progress ? { current: progress.progress, max: progress.target } : undefined,
        unlockedAt: progress?.completedAt?.toISOString()
      }
    })

    const completedAchievements = userProgress.filter(p => p.completed)
    const totalPoints = completedAchievements.reduce((acc, p) => {
      const achievement = achievements.find(a => a.id === p.achievementId)
      return acc + (achievement?.points || 0)
    }, 0)

    return NextResponse.json({
      achievements: mergedAchievements,
      totalPoints,
      unlockedCount: completedAchievements.length
    })
  } catch (error) {
    console.error('Achievements GET error:', error)
    return NextResponse.json({
      achievements: [],
      totalPoints: 0,
      unlockedCount: 0
    })
  }
}

// POST /api/achievements - Update achievement progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, achievementId, progress } = body

    if (!userId || !achievementId) {
      return NextResponse.json(
        { error: 'userId und achievementId erforderlich' },
        { status: 400 }
      )
    }

    // Get achievement definition
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    })

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement nicht gefunden' },
        { status: 404 }
      )
    }

    // Upsert user achievement progress
    const userAchievement = await prisma.userAchievement.upsert({
      where: {
        id: `${userId}-${achievementId}`
      },
      create: {
        id: `${userId}-${achievementId}`,
        userId,
        achievementId,
        progress: progress || 0,
        target: 100,
        completed: (progress || 0) >= 100,
        completedAt: (progress || 0) >= 100 ? new Date() : null
      },
      update: {
        progress: progress || 0,
        completed: (progress || 0) >= 100,
        completedAt: (progress || 0) >= 100 ? new Date() : undefined
      }
    })

    return NextResponse.json({
      success: true,
      userAchievement
    })
  } catch (error) {
    console.error('Achievement update error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren' },
      { status: 500 }
    )
  }
}
