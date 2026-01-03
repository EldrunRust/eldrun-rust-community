'use client'

import { motion } from 'framer-motion'
import { Star, Skull, Clock, Target } from 'lucide-react'

interface PlayerData {
  name: string
  clan: string
  kills: number
  kd: number
  playtime: number
  achievement: string
  quote: string
}

export function PlayerSpotlight({ data }: { data: PlayerData }) {
  return (
    <section className="py-6 px-4">
      <div className="container-rust max-w-2xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-metal-900/70 border border-metal-700 p-6 flex items-center gap-6"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-rust-500/30 to-rust-700/30 border-2 border-rust-500 flex items-center justify-center font-display font-black text-2xl text-rust-400 flex-shrink-0">
            {data.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-mono text-yellow-500 uppercase">Player Spotlight</span>
            </div>
            <h3 className="font-display font-bold text-xl text-white">{data.name}</h3>
            <p className="text-rust-400 text-sm mb-2">[{data.clan}] • {data.achievement}</p>
            <p className="text-metal-500 text-sm italic mb-3">&quot;{data.quote}&quot;</p>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-metal-400"><Skull className="w-3 h-3" /> {data.kills}</span>
              <span className="flex items-center gap-1 text-metal-400"><Target className="w-3 h-3" /> {data.kd} K/D</span>
              <span className="flex items-center gap-1 text-metal-400"><Clock className="w-3 h-3" /> {data.playtime}h</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
