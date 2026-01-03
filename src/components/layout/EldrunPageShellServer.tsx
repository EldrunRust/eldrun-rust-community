import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'

type PageColumns = 1 | 2 | 3 | 4 | 6 | 12

type EldrunPageShellServerProps = {
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

export function EldrunPageShellServer({
  icon: Icon,
  badge,
  title,
  subtitle,
  description,
  gradient = 'from-gold-300 via-gold-400 to-gold-600',
  glowColor = 'rgba(212,168,83,0.3)',
  className,
  containerClassName,
  grid,
  children,
}: EldrunPageShellServerProps) {
  const gridCols = grid?.cols ?? 12
  const gridClassName = grid?.className ?? ''

  return (
    <div className={['min-h-screen bg-metal-950', className].filter(Boolean).join(' ')}>
      <div className="relative overflow-hidden border-b border-gold-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-metal-900 via-metal-950 to-metal-950" />
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: glowColor }}
          />
          <div
            className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: glowColor }}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

        <div className="container-rust pt-32 pb-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-metal-900/50 border border-gold-700/30 rounded-full mb-6">
              <Icon className="w-5 h-5 text-gold-500" />
              <span className="font-medieval text-sm text-gold-500 uppercase tracking-[0.2em]">
                {badge}
              </span>
            </div>

            <h1 className="font-medieval-decorative font-black text-5xl md:text-7xl mb-4">
              <span
                className={[
                  'text-transparent bg-clip-text bg-gradient-to-r',
                  gradient,
                ].join(' ')}
                style={{ filter: `drop-shadow(0 0 30px ${glowColor})` }}
              >
                {title}
              </span>
            </h1>

            {subtitle && (
              <p className="font-medieval text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 mb-2 tracking-[0.2em] uppercase">
                {subtitle}
              </p>
            )}

            {description && (
              <p className="text-metal-400 max-w-2xl mx-auto font-body mt-4">{description}</p>
            )}
          </div>
        </div>
      </div>

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
