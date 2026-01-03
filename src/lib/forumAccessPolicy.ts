export type ForumFaction = 'seraphar' | 'vorgaroth'

export type ForumBoardAccessPolicy = {
  isPrivate?: boolean
  factionOnly?: ForumFaction
}

export type ForumCategoryAccessPolicy = {
  isPrivate?: boolean
  factionOnly?: ForumFaction
}

function mergePolicy(parent: ForumBoardAccessPolicy, child: ForumBoardAccessPolicy): ForumBoardAccessPolicy {
  return {
    isPrivate: child.isPrivate ?? parent.isPrivate,
    factionOnly: child.factionOnly ?? parent.factionOnly,
  }
}

const POLICY_BY_CATEGORY_ID: Record<string, ForumCategoryAccessPolicy> = {
  // Example for future use:
  // 'cat_internal': { isPrivate: true },
}

const POLICY_BY_CATEGORY_SLUG: Record<string, ForumCategoryAccessPolicy> = {
  // Example:
  // 'internal': { isPrivate: true },
}

const POLICY_BY_BOARD_ID: Record<string, ForumBoardAccessPolicy> = {
  board_seraphar: { factionOnly: 'seraphar' },
  board_vorgaroth: { factionOnly: 'vorgaroth' },
}

const POLICY_BY_BOARD_SLUG: Record<string, ForumBoardAccessPolicy> = {
  // If your DB uses slugs, add them here (preferred).
  // Example:
  // 'seraphar-kommando': { factionOnly: 'seraphar' },
  // 'vorgaroth-kriegsschmiede': { factionOnly: 'vorgaroth' },
}

export function getBoardAccessPolicy(input: {
  id?: string | null
  slug?: string | null
}): ForumBoardAccessPolicy {
  if (input.id && POLICY_BY_BOARD_ID[input.id]) return POLICY_BY_BOARD_ID[input.id]
  if (input.slug && POLICY_BY_BOARD_SLUG[input.slug]) return POLICY_BY_BOARD_SLUG[input.slug]
  return {}
}

export function getCategoryAccessPolicy(input: {
  id?: string | null
  slug?: string | null
}): ForumCategoryAccessPolicy {
  if (input.id && POLICY_BY_CATEGORY_ID[input.id]) return POLICY_BY_CATEGORY_ID[input.id]
  if (input.slug && POLICY_BY_CATEGORY_SLUG[input.slug]) return POLICY_BY_CATEGORY_SLUG[input.slug]
  return {}
}

export function getEffectiveBoardAccessPolicy(input: {
  categoryId?: string | null
  categorySlug?: string | null
  boardId?: string | null
  boardSlug?: string | null
}): ForumBoardAccessPolicy {
  const categoryPolicy = getCategoryAccessPolicy({ id: input.categoryId, slug: input.categorySlug })
  const boardPolicy = getBoardAccessPolicy({ id: input.boardId, slug: input.boardSlug })
  return mergePolicy(categoryPolicy, boardPolicy)
}
