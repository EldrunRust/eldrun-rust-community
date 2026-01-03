'use client'

import { motion } from 'framer-motion'

export type RankType = 'newcomer' | 'active' | 'veteran' | 'elite' | 'legend' | 'moderator' | 'admin' | 'vip'

interface RankBadgeProps {
  rank: RankType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

const RANK_CONFIG: Record<RankType, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  glow?: string
}> = {
  newcomer: {
    label: 'Neuling',
    color: 'text-metal-400',
    bgColor: 'bg-metal-800',
    borderColor: 'border-metal-600',
    icon: '🌱'
  },
  active: {
    label: 'Aktiv',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-500/50',
    icon: '⚔️'
  },
  veteran: {
    label: 'Veteran',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-500/50',
    icon: '🛡️',
    glow: 'shadow-purple-500/20'
  },
  elite: {
    label: 'Elite',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
    borderColor: 'border-amber-500/50',
    icon: '💎',
    glow: 'shadow-amber-500/30'
  },
  legend: {
    label: 'Legende',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-500/50',
    icon: '🔥',
    glow: 'shadow-red-500/40'
  },
  moderator: {
    label: 'Moderator',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/30',
    borderColor: 'border-cyan-500/50',
    icon: '🛡️',
    glow: 'shadow-cyan-500/30'
  },
  admin: {
    label: 'Admin',
    color: 'text-rust-400',
    bgColor: 'bg-rust-900/30',
    borderColor: 'border-rust-500/50',
    icon: '👑',
    glow: 'shadow-rust-500/50'
  },
  vip: {
    label: 'VIP',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    borderColor: 'border-yellow-500/50',
    icon: '⭐',
    glow: 'shadow-yellow-500/40'
  }
}

const SIZE_CONFIG = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-2 gap-2'
}

export function RankBadge({ rank, size = 'md', showLabel = true, animated = true }: RankBadgeProps) {
  const config = RANK_CONFIG[rank]
  const sizeClass = SIZE_CONFIG[size]

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
        inline-flex items-center rounded-full border font-medium
        ${config.bgColor} ${config.borderColor} ${config.color} ${sizeClass}
        ${config.glow ? `shadow-lg ${config.glow}` : ''}
      `}
      {...animationProps}
    >
      <span className="text-base">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </Badge>
  )
}

export function RankIcon({ rank, size = 24 }: { rank: RankType; size?: number }) {
  const config = RANK_CONFIG[rank]
  
  return (
    <span 
      className={`inline-flex items-center justify-center ${config.color}`}
      style={{ fontSize: size }}
    >
      {config.icon}
    </span>
  )
}
