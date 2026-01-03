'use client'

import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { MedievalPageHeader } from '@/components/ui/MedievalPageHeader'

type PageColumns = 1 | 2 | 3 | 4 | 6 | 12

type EldrunPageShellProps = {
  icon: LucideIcon
  badge: string
  title: string
  subtitle?: string
  description?: string
  gradient?: string
  glowColor?: string
  className?: string
  containerClassName?: string
  grid?: {
    cols?: PageColumns
    className?: string
  }
  children: ReactNode
}

export function EldrunPageShell({
  icon,
  badge,
  title,
  subtitle,
  description,
  gradient,
  glowColor,
  className,
  containerClassName,
  grid,
  children,
}: EldrunPageShellProps) {
  const gridCols = grid?.cols ?? 12
  const gridClassName = grid?.className ?? ''

  return (
    <div className={['min-h-screen bg-metal-950', className].filter(Boolean).join(' ')}>
      <MedievalPageHeader
        icon={icon}
        badge={badge}
        title={title}
        subtitle={subtitle}
        description={description}
        gradient={gradient}
        glowColor={glowColor}
      />

      <div className={['container-rust py-10', containerClassName].filter(Boolean).join(' ')}>
        {grid ? (
          <div
            className={[
              'grid gap-6',
              gridCols === 12 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12' : '',
              gridCols === 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6' : '',
              gridCols === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : '',
              gridCols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : '',
              gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' : '',
              gridCols === 1 ? 'grid-cols-1' : '',
              gridClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
