'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MedievalPageHeaderProps {
  icon: LucideIcon
  badge: string
  title: string
  subtitle?: string
  description?: string
  gradient?: string
  glowColor?: string
  children?: React.ReactNode
}

export function MedievalPageHeader({
  icon: Icon,
  badge,
  title,
  subtitle,
  description,
  gradient = 'from-gold-300 via-gold-400 to-gold-600',
  glowColor = 'rgba(212,168,83,0.3)',
  children
}: MedievalPageHeaderProps) {
  return (
    <div className="relative overflow-hidden border-b border-gold-900/30">
      {/* Background */}
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
      
      {/* Decorative Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      
      <div className="container-rust pt-32 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-metal-900/50 border border-gold-700/30 rounded-full mb-6">
            <Icon className="w-5 h-5 text-gold-500" />
            <span className="font-medieval text-sm text-gold-500 uppercase tracking-[0.2em]">
              {badge}
            </span>
          </div>
          
          {/* Title */}
          <h1 className="font-medieval-decorative font-black text-5xl md:text-7xl mb-4">
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient} drop-shadow-[0_0_30px_${glowColor}]`}>
              {title}
            </span>
          </h1>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="font-medieval text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 mb-2 tracking-[0.2em] uppercase">
              {subtitle}
            </p>
          )}
          
          {/* Description */}
          {description && (
            <p className="text-metal-400 max-w-2xl mx-auto font-body mt-4">
              {description}
            </p>
          )}
          
          {/* Custom Content */}
          {children}
        </motion.div>
      </div>
    </div>
  )
}

export default MedievalPageHeader
