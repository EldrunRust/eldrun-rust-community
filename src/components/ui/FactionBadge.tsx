'use client'

import { motion } from 'framer-motion'

export type FactionType = 'seraphar' | 'vorgaroth'

interface FactionBadgeProps {
  faction: FactionType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  showLogo?: boolean
  animated?: boolean
}

const FACTION_CONFIG: Record<FactionType, {
  name: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  logo: string
  gradient: string
  glow: string
}> = {
  seraphar: {
    name: 'SERAPHAR',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
    borderColor: 'border-amber-500/50',
    icon: '🦁',
    logo: '/images/factions/seraphar-logo.png',
    gradient: 'from-amber-500/20 to-amber-900/30',
    glow: 'shadow-amber-500/30'
  },
  vorgaroth: {
    name: 'VORGAROTH',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500/50',
    icon: '🐉',
    logo: '/images/factions/vorgaroth-logo.png',
    gradient: 'from-red-500/20 to-red-900/30',
    glow: 'shadow-red-500/30'
  }
}

const SIZE_CONFIG = {
  sm: { badge: 'text-xs px-2 py-0.5 gap-1', logo: 16, icon: 'text-sm' },
  md: { badge: 'text-sm px-3 py-1 gap-1.5', logo: 20, icon: 'text-base' },
  lg: { badge: 'text-base px-4 py-2 gap-2', logo: 28, icon: 'text-xl' },
  xl: { badge: 'text-lg px-5 py-3 gap-3', logo: 40, icon: 'text-2xl' }
}

export function FactionBadge({ 
  faction, 
  size = 'md', 
  showLabel = true, 
  showLogo = false,
  animated = true 
}: FactionBadgeProps) {
  const config = FACTION_CONFIG[faction]
  const sizeConfig = SIZE_CONFIG[size]

  const Badge = animated ? motion.div : 'div'
  const animationProps = animated ? {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    whileHover: { scale: 1.05 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <Badge
      className={`
        inline-flex items-center rounded-lg border font-bold
        bg-gradient-to-r ${config.gradient} ${config.borderColor} ${config.color} 
        ${sizeConfig.badge} shadow-lg ${config.glow}
      `}
      {...animationProps}
    >
      {showLogo ? (
        <img 
          src={config.logo} 
          alt={config.name} 
          style={{ width: sizeConfig.logo, height: sizeConfig.logo }}
          className="object-contain"
        />
      ) : (
        <span className={sizeConfig.icon}>{config.icon}</span>
      )}
      {showLabel && <span className="font-display tracking-wide">{config.name}</span>}
    </Badge>
  )
}

export function FactionIcon({ faction, size = 24 }: { faction: FactionType; size?: number }) {
  const config = FACTION_CONFIG[faction]
  
  return (
    <span 
      className={`inline-flex items-center justify-center ${config.color}`}
      style={{ fontSize: size }}
    >
      {config.icon}
    </span>
  )
}

export function FactionLogo({ faction, size = 48 }: { faction: FactionType; size?: number }) {
  const config = FACTION_CONFIG[faction]
  
  return (
    <motion.img 
      src={config.logo} 
      alt={config.name}
      style={{ width: size, height: size }}
      className="object-contain drop-shadow-lg"
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ duration: 0.3 }}
    />
  )
}
