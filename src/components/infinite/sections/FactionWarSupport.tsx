'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Swords } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

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

export function FactionWarSupport() {
  return (
    <section className="py-14 bg-metal-950">
      <div className="container-rust">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl bg-metal-900/60 border border-metal-700/80 rounded-2xl p-6 backdrop-blur"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/20 border border-amber-500/30 flex items-center justify-center">
                <Swords className="w-6 h-6 text-amber-300" />
              </div>
              <div className="text-left">
                <p className="text-xs font-mono text-metal-500 uppercase tracking-wider">Fraktionskrieg</p>
                <p className="font-display font-bold text-xl text-white tracking-wide">Seraphar vs Vorgaroth</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-metal-400">
              <Flame className="w-4 h-4 text-orange-400" />
              Live Support – wähle deine Seite
            </div>
          </div>

          <FactionBar />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FactionButton faction="seraphar" />
            <FactionButton faction="vorgaroth" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
