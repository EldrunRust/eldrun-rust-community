'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Skull, Target, Clock, Users, ChevronUp, ChevronDown, Crown } from 'lucide-react'
import { LEADERBOARD_DATA } from '@/data/serverData'
import { cn } from '@/lib/utils'

type SortKey = 'kills' | 'deaths' | 'kd' | 'playtime'

export function LeaderboardSection() {
  const [sortKey, setSortKey] = useState<SortKey>('kills')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedData = [...LEADERBOARD_DATA].sort((a, b) => {
    const multiplier = sortDirection === 'desc' ? -1 : 1
    return (a[sortKey] - b[sortKey]) * multiplier
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50 text-yellow-400'
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50 text-gray-300'
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/50 text-amber-500'
      default:
        return 'bg-metal-900/50 border-metal-700 text-metal-300'
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Crown className={cn("w-5 h-5", rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : "text-amber-500")} />
    }
    return <span className="font-mono text-metal-500">#{rank}</span>
  }

  return (
    <section id="leaderboard" className="relative py-24 bg-metal-950">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rust-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rust-600/5 rounded-full blur-3xl" />
      </div>

      <div className="container-rust relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-rust-500/10 border border-rust-500/30 rounded-full"
          >
            <Trophy className="w-4 h-4 text-rust-400" />
            <span className="font-mono text-sm text-rust-400 uppercase tracking-wider">Top Players</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-5xl text-white mb-4"
          >
            Leaderboard
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-metal-400 max-w-2xl mx-auto"
          >
            Die besten Spieler unseres Servers. Kämpfe dich nach oben!
          </motion.p>
        </div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-metal-900/50 border border-metal-800 backdrop-blur-sm overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))' }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-metal-800/50 border-b border-metal-700 font-display font-bold text-sm uppercase tracking-wider text-metal-400">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('kills')}
                className={cn("flex items-center gap-1 hover:text-rust-400 transition-colors", sortKey === 'kills' && 'text-rust-400')}
              >
                <Skull className="w-4 h-4" />
                Kills
                {sortKey === 'kills' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('deaths')}
                className={cn("flex items-center gap-1 hover:text-rust-400 transition-colors", sortKey === 'deaths' && 'text-rust-400')}
              >
                <Target className="w-4 h-4" />
                Deaths
                {sortKey === 'deaths' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('kd')}
                className={cn("flex items-center gap-1 hover:text-rust-400 transition-colors", sortKey === 'kd' && 'text-rust-400')}
              >
                K/D
                {sortKey === 'kd' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('playtime')}
                className={cn("flex items-center gap-1 hover:text-rust-400 transition-colors", sortKey === 'playtime' && 'text-rust-400')}
              >
                <Clock className="w-4 h-4" />
                Hours
                {sortKey === 'playtime' && (sortDirection === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
              </button>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-metal-800">
            <AnimatePresence mode="popLayout">
              {sortedData.map((player, index) => (
                <motion.div
                  key={player.name}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors duration-300 hover:bg-metal-800/30",
                    player.rank <= 3 && "bg-gradient-to-r from-transparent via-metal-800/20 to-transparent"
                  )}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex justify-center">
                    <div className={cn(
                      "w-10 h-10 flex items-center justify-center border",
                      getRankStyle(player.rank)
                    )}
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                      {getRankIcon(player.rank)}
                    </div>
                  </div>

                  {/* Player */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rust-500/30 to-rust-600/20 border border-rust-500/30 flex items-center justify-center font-display font-bold text-rust-400">
                      {player.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display font-bold text-white">{player.name}</p>
                      {player.clan && (
                        <p className="text-xs font-mono text-rust-400">[{player.clan}]</p>
                      )}
                    </div>
                  </div>

                  {/* Kills */}
                  <div className="col-span-2">
                    <span className="font-mono text-lg text-white">{player.kills.toLocaleString()}</span>
                  </div>

                  {/* Deaths */}
                  <div className="col-span-2">
                    <span className="font-mono text-lg text-metal-300">{player.deaths.toLocaleString()}</span>
                  </div>

                  {/* K/D */}
                  <div className="col-span-2">
                    <span className={cn(
                      "font-mono text-lg font-bold",
                      player.kd >= 3 ? "text-radiation-400" : player.kd >= 2 ? "text-rust-400" : "text-metal-300"
                    )}>
                      {player.kd.toFixed(2)}
                    </span>
                  </div>

                  {/* Playtime */}
                  <div className="col-span-2">
                    <span className="font-mono text-lg text-metal-300">{player.playtime}h</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <button className="px-8 py-3 bg-metal-800 border border-metal-700 font-display font-bold uppercase tracking-wider text-metal-300 hover:border-rust-500 hover:text-rust-400 transition-all duration-300"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
            Alle Spieler anzeigen
          </button>
        </motion.div>
      </div>
    </section>
  )
}
