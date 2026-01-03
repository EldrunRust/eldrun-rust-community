'use client'

import { motion } from 'framer-motion'
import { Users, MapPin, Skull, Trophy, Swords } from 'lucide-react'
import { useStore } from '@/store/useStore'

interface ClanData {
  name: string
  fullName: string
  members: number
  territory: number
  totalKills: number
  description: string
  achievements: string[]
}

export function ClanSpotlight({ data }: { data: ClanData }) {
  const { factionScore } = useStore()
  const totalScore = Math.max(1, factionScore.seraphar + factionScore.vorgaroth)
  const serapharPct = Math.round((factionScore.seraphar / totalScore) * 100)
  const vorgarothPct = 100 - serapharPct

  return (
    <section className="py-8 px-4">
      <div className="container-rust">
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1 bg-rust-500/10 border border-rust-500/30 text-rust-400 font-mono text-xs uppercase">
            <Trophy className="w-3 h-3" /> Clan Spotlight
          </span>
        </div>
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-gradient-to-br from-metal-900 to-metal-950 border border-rust-500/30 p-6 text-center"
          style={{ clipPath: 'polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)' }}
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-rust-500 to-rust-700 flex items-center justify-center text-3xl font-display font-black text-white"
               style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            {data.name.charAt(0)}
          </div>
          <h3 className="font-display font-black text-2xl text-white mb-1">[{data.name}]</h3>
          <p className="text-rust-400 font-display mb-4">{data.fullName}</p>
          <p className="text-metal-400 text-sm mb-6 max-w-md mx-auto">{data.description}</p>
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-metal-500" />
              <span className="block font-mono text-xl text-white">{data.members}</span>
              <span className="text-xs text-metal-500">Members</span>
            </div>
            <div className="text-center">
              <MapPin className="w-5 h-5 mx-auto mb-1 text-metal-500" />
              <span className="block font-mono text-xl text-white">{data.territory}</span>
              <span className="text-xs text-metal-500">Territory</span>
            </div>
            <div className="text-center">
              <Skull className="w-5 h-5 mx-auto mb-1 text-metal-500" />
              <span className="block font-mono text-xl text-white">{data.totalKills.toLocaleString()}</span>
              <span className="text-xs text-metal-500">Kills</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {data.achievements.map((a, i) => (
              <span key={i} className="px-2 py-1 bg-rust-500/10 border border-rust-500/20 text-rust-400 text-xs">🏆 {a}</span>
            ))}
          </div>

          {/* Global Faction War Snapshot */}
          <div className="mt-6 space-y-2 text-left">
            <div className="flex items-center gap-2 justify-center">
              <Swords className="w-4 h-4 text-rust-400" />
              <span className="text-xs font-mono text-metal-400 uppercase tracking-wider">Fraktionskrieg – Global</span>
            </div>
            <div className="h-2.5 bg-metal-800 rounded-full overflow-hidden relative mx-auto max-w-lg">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/80 to-amber-400/60 transition-all"
                style={{ width: `${serapharPct}%` }}
              />
              <div
                className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-600/70 to-red-500/60 transition-all"
                style={{ width: `${vorgarothPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-metal-400 max-w-lg mx-auto">
              <span className="text-amber-400">Seraphar {serapharPct}%</span>
              <span className="text-red-400">Vorgaroth {vorgarothPct}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
