'use client'

import { motion } from 'framer-motion'
import { Trophy, Skull, Crown } from 'lucide-react'

const TOP_PLAYERS = [
  { rank: 1, name: 'DeathBringer', kills: 2847, clan: 'APEX' },
  { rank: 2, name: 'ShadowHunter', kills: 2341, clan: 'APEX' },
  { rank: 3, name: 'RustLord', kills: 2156, clan: 'VOID' },
  { rank: 4, name: 'NightRaider', kills: 1987, clan: 'STORM' },
  { rank: 5, name: 'IronWolf', kills: 1876, clan: 'VOID' },
]

export function LeaderboardMini() {
  return (
    <section className="py-8 px-4">
      <div className="container-rust">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-metal-900 via-metal-900/80 to-metal-950 border border-metal-700 p-6"
          style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-rust-400" />
              <h3 className="font-display font-bold text-xl text-white">Top 5 Spieler</h3>
            </div>
            <button className="text-sm text-rust-400 hover:text-rust-300 font-mono">Alle anzeigen →</button>
          </div>
          
          <div className="space-y-2">
            {TOP_PLAYERS.map((player) => (
              <motion.div
                key={player.rank}
                whileHover={{ x: 5 }}
                className={`flex items-center gap-4 p-3 ${player.rank <= 3 ? 'bg-rust-500/10 border border-rust-500/20' : 'bg-metal-800/50'}`}
              >
                <div className={`w-8 h-8 flex items-center justify-center font-mono font-bold ${
                  player.rank === 1 ? 'text-yellow-400' : 
                  player.rank === 2 ? 'text-gray-300' : 
                  player.rank === 3 ? 'text-amber-500' : 'text-metal-500'
                }`}>
                  {player.rank <= 3 ? <Crown className="w-5 h-5" /> : `#${player.rank}`}
                </div>
                <div className="flex-1">
                  <span className="font-display font-bold text-white">{player.name}</span>
                  <span className="text-rust-400 text-sm ml-2">[{player.clan}]</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-metal-400">
                  <Skull className="w-4 h-4" />
                  <span>{player.kills.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
