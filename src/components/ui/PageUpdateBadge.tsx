'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getChangelogAnchorId, getChangelogEntry } from '@/data/changelogEntries'

interface PageUpdateBadgeProps {
  version: string
  label?: string
  className?: string
}

export function PageUpdateBadge({ version, label, className }: PageUpdateBadgeProps) {
  const entry = getChangelogEntry(version)
  if (!entry) return null

  const href = `/changelog#${getChangelogAnchorId(version)}`

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-200 text-xs font-semibold tracking-wide uppercase hover:bg-purple-500/20 transition-all backdrop-blur',
        className
      )}
    >
      <span className="font-mono text-[11px] text-purple-300">Was ist neu?</span>
      <span className="font-bold text-white">{label ?? entry.title}</span>
      <ArrowUpRight className="w-3 h-3 text-purple-200" />
    </Link>
  )
}
