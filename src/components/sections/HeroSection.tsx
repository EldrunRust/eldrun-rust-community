'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Play, Copy, Check, Users, Zap, Shield, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FloatingEmbers } from '@/components/ui/FireParticles'
import { HeroBackgroundRotator } from '@/components/sections/HeroBackgroundRotator'
import { useStore } from '@/store/useStore'
import { SERVER_INFO } from '@/data/serverData'
import { cn } from '@/lib/utils'

export function HeroSection() {
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { serverStats } = useStore()
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const copyIP = async () => {
    await navigator.clipboard.writeText(`${SERVER_INFO.ip}:${SERVER_INFO.port}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

function FactionBar() {
  const { factionScore } = useStore()
  const total = Math.max(1, factionScore.seraphar + factionScore.vorgaroth)
  const serapharPct = Math.min(100, Math.max(0, (factionScore.seraphar / total) * 100))
  const vorgarothPct = 100 - serapharPct

  return (
    <div className="relative w-full h-12 bg-metal-800/80 border border-metal-700 rounded-xl overflow-hidden shadow-inner">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/60 via-amber-400/50 to-amber-500/40 transition-all duration-500"
        style={{ width: `${serapharPct}%` }}
      />
      <div
        className="absolute inset-y-0 right-0 bg-gradient-to-l from-purple-600/60 via-purple-500/50 to-purple-600/40 transition-all duration-500"
        style={{ width: `${vorgarothPct}%` }}
      />
      <div className="relative z-10 flex items-center justify-between px-4 text-sm font-mono text-white">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          Seraphar {serapharPct.toFixed(0)}%
        </span>
        <span className="text-metal-500 text-xs uppercase tracking-wider">Artefakt-Kontrolle</span>
        <span className="flex items-center gap-2">
          Vorgaroth {vorgarothPct.toFixed(0)}%
          <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
        </span>
      </div>
    </div>
  )
}

function FactionButton({ faction }: { faction: 'seraphar' | 'vorgaroth' }) {
  const { supportFaction } = useStore()
  const [cooldown, setCooldown] = useState(false)

  const handleSupport = () => {
    if (cooldown) return
    supportFaction(faction, Math.floor(Math.random() * 3) + 2)
    setCooldown(true)
    setTimeout(() => setCooldown(false), 2000)
  }

  const isSeraphar = faction === 'seraphar'
  return (
    <button
      onClick={handleSupport}
      disabled={cooldown}
      className={cn(
        'group flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-300',
        isSeraphar
          ? 'border-amber-600/50 bg-amber-900/20 hover:border-amber-400 hover:bg-amber-900/30'
          : 'border-purple-700/50 bg-purple-900/20 hover:border-purple-500 hover:bg-purple-900/30',
        cooldown && 'opacity-60 cursor-not-allowed'
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black text-white shadow-inner',
            isSeraphar ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-gradient-to-br from-purple-500 to-purple-700'
          )}
        >
          {isSeraphar ? '☀️' : '🐉'}
        </div>
        <div className="text-left">
          <p className="text-xs font-mono text-metal-400 uppercase tracking-wider">Support</p>
          <p className="font-display font-bold text-white">{isSeraphar ? 'Seraphar' : 'Vorgaroth'}</p>
        </div>
      </div>
      <span className="text-xs font-mono text-metal-400 group-hover:text-white transition-colors">
        {cooldown ? 'Cooldown' : '+Ruhm'}
      </span>
    </button>
  )
}

  const connectToServer = () => {
    window.location.href = SERVER_INFO.steam
  }

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <HeroBackgroundRotator intervalMs={30000} />
        <div className="absolute inset-0 bg-gradient-to-b from-metal-950/80 via-metal-950/60 to-metal-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-metal-950/50 via-transparent to-metal-950/50" />
        
        {/* Floating Ember Particles */}
        <FloatingEmbers count={25} />
        
        {/* Scanline effect */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }} />
        </div>
      </div>

      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 container-rust text-center"
      >
        {/* Server Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-3 px-4 py-2 mb-8 bg-metal-900/80 backdrop-blur-sm border border-metal-700 rounded-full"
        >
          <span className={cn(
            "w-2 h-2 rounded-full",
            serverStats.status === 'online' ? 'bg-radiation-400 animate-pulse' : 'bg-blood-500'
          )} />
          <span className="font-medieval text-sm text-metal-300 tracking-wider">
            {serverStats.status === 'online' ? 'SERVER ONLINE' : 'SERVER OFFLINE'}
          </span>
          <span className="text-metal-500">|</span>
          <span className="font-mono text-sm text-rust-400">
            {serverStats.players}/{serverStats.maxPlayers} Players
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-medieval-decorative font-black text-6xl sm:text-8xl lg:text-9xl mb-4 tracking-wide"
        >
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 drop-shadow-[0_0_30px_rgba(212,168,83,0.5)]">{SERVER_INFO.name}</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-medieval text-xl sm:text-2xl lg:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 mb-6 tracking-[0.3em] uppercase"
        >
          {SERVER_INFO.tagline}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg sm:text-xl text-metal-300 max-w-2xl mx-auto mb-10 font-body leading-relaxed"
        >
          {SERVER_INFO.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button 
            variant="rust" 
            size="lg" 
            onClick={connectToServer}
            leftIcon={<Play className="w-5 h-5" />}
          >
            Jetzt Spielen
          </Button>
          
          <button
            onClick={copyIP}
            className="group flex items-center gap-3 px-6 py-4 bg-metal-900/80 border border-metal-700 hover:border-rust-500 transition-all duration-300"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
          >
            <span className="font-mono text-metal-300 group-hover:text-rust-400 transition-colors">
              {SERVER_INFO.ip}:{SERVER_INFO.port}
            </span>
            {copied ? (
              <Check className="w-5 h-5 text-radiation-400" />
            ) : (
              <Copy className="w-5 h-5 text-metal-500 group-hover:text-rust-400 transition-colors" />
            )}
          </button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-rust-500" />
              <span className="font-display font-bold text-2xl text-white">{serverStats.maxPlayers}</span>
            </div>
            <span className="text-xs font-mono text-metal-500 uppercase">Max Slots</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-rust-500" />
              <span className="font-display font-bold text-2xl text-white">2x</span>
            </div>
            <span className="text-xs font-mono text-metal-500 uppercase">Gather Rate</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-rust-500" />
              <span className="font-display font-bold text-2xl text-white">24/7</span>
            </div>
            <span className="text-xs font-mono text-metal-500 uppercase">Anti-Cheat</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-10 max-w-2xl mx-auto space-y-4"
        >
          <FactionBar />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FactionButton faction="seraphar" />
            <FactionButton faction="vorgaroth" />
          </div>
        </motion.div>

      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-metal-500"
        >
          <span className="text-xs font-mono uppercase tracking-wider">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-metal-950 to-transparent z-[5]" />
    </section>
  )
}
