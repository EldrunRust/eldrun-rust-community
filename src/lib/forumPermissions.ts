'use client'

import type { ForumBoard } from '@/store/forumStore'
import type { UserProfile } from '@/store/useStore'
import { getEffectiveBoardAccessPolicy } from '@/lib/forumAccessPolicy'

export function isForumStaff(user: UserProfile | null | undefined): boolean {
  return !!user && (user.role === 'admin' || user.role === 'moderator')
}

export function canAccessBoard(board: ForumBoard, user: UserProfile | null | undefined): boolean {
  if (isForumStaff(user)) return true

  const policy = getEffectiveBoardAccessPolicy({
    categoryId: board.categoryId,
    boardId: board.id,
  })

  const isPrivate = policy.isPrivate ?? board.isPrivate
  const factionOnly = policy.factionOnly ?? board.factionOnly

  if (isPrivate && !user) return false

  if (factionOnly) {
    if (!user?.faction) return false
    if (user.faction !== factionOnly) return false
  }

  return true
}
