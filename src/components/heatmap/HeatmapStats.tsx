'use client'

import { motion } from 'framer-motion'
import { Users, Skull, Target, Trophy, Swords, Crown } from 'lucide-react'
import { Player, HeatmapStats as Stats } from '@/hooks/useHeatmapSimulation'
import { useStore } from '@/store/useStore'

interface HeatmapStatsProps {
  stats: Stats
  players: Player[]
  selectedPlayer: string | null
  onSelectPlayer: (id: string | null) => void
}

export function HeatmapStats({ stats, players, selectedPlayer, onSelectPlayer }: HeatmapStatsProps) {
  const alivePlayers = players.filter(p => p.status !== 'dead')
  const topKillers = [...players].sort((a, b) => b.kills - a.kills).slice(0, 5)
  const selected = players.find(p => p.id === selectedPlayer)
  const { factionScore, supportFaction } = useStore()
  const totalScore = Math.max(1, factionScore.seraphar + factionScore.vorgaroth)
  const serapharPct = (factionScore.seraphar / totalScore) * 100
  const vorgarothPct = 100 - serapharPct

  return (
    <div className="bg-metal-900/50 border border-metal-800 p-4 space-y-4">
      <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
        <Trophy className="w-4 h-4 text-rust-400" />
        Server Stats
      </h3>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox icon={<Users className="w-4 h-4" />} label="Online" value={alivePlayers.length} color="text-radiation-400" />
        <StatBox icon={<Skull className="w-4 h-4" />} label="Kills" value={stats.totalKills} color="text-blood-500" />
        <StatBox 
          icon={<div className="w-3 h-3 rounded-full bg-amber-500" />} 
          label="Seraphar" 
          value={players.filter(p => p.faction === 'seraphar' && p.status !== 'dead').length} 
          color="text-amber-400" 
        />
        <StatBox 
          icon={<div className="w-3 h-3 rounded-full bg-red-500" />} 
          label="Vorgaroth" 
          value={players.filter(p => p.faction === 'vorgaroth' && p.status !== 'dead').length} 
          color="text-red-400" 
        />
      </div>

      {/* Global Faction Control (Store) */}
      <div className="space-y-2 p-3 bg-metal-900/60 border border-metal-800">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-rust-400" />
          <span className="text-xs text-metal-400 uppercase tracking-wider">Global Faction Control</span>
        </div>
        <div className="h-3 bg-metal-800 rounded-full overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/80 to-amber-400/60 transition-all"
            style={{ width: `${serapharPct}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-600/70 to-red-500/60 transition-all"
            style={{ width: `${vorgarothPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-metal-400">
          <span className="text-amber-400">Seraphar {serapharPct.toFixed(0)}%</span>
          <span className="text-red-400">Vorgaroth {vorgarothPct.toFixed(0)}%</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <button
            onClick={() => supportFaction('seraphar', Math.floor(Math.random() * 3) + 1)}
            className="px-2 py-2 bg-amber-900/30 border border-amber-500/40 rounded-lg hover:border-amber-400 transition-colors"
          >
            +Support Seraphar
          </button>
          <button
            onClick={() => supportFaction('vorgaroth', Math.floor(Math.random() * 3) + 1)}
            className="px-2 py-2 bg-red-900/30 border border-red-500/40 rounded-lg hover:border-red-400 transition-colors"
          >
            +Support Vorgaroth
          </button>
        </div>
      </div>

      {/* Selected Player Info */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-metal-800 border border-metal-700"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selected.color }} />
              <span className="font-display font-bold text-white">{selected.name}</span>
            </div>
            <button 
              onClick={() => onSelectPlayer(null)}
              className="text-metal-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-metal-500">Fraktion:</span>
              <span className={`ml-1 ${selected.faction === 'seraphar' ? 'text-amber-400' : 'text-red-400'}`}>
                {selected.faction.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-metal-500">Status:</span>
              <span className={`ml-1 ${selected.status === 'combat' ? 'text-blood-500' : 'text-radiation-400'}`}>
                {selected.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-metal-500">Kills:</span>
              <span className="ml-1 text-white font-mono">{selected.kills}</span>
            </div>
            <div>
              <span className="text-metal-500">Deaths:</span>
              <span className="ml-1 text-white font-mono">{selected.deaths}</span>
            </div>
            <div>
              <span className="text-metal-500">K/D:</span>
              <span className="ml-1 text-white font-mono">
                {(selected.kills / Math.max(1, selected.deaths)).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-metal-500">Health:</span>
              <span className={`ml-1 font-mono ${selected.health > 50 ? 'text-radiation-400' : 'text-blood-500'}`}>
                {selected.health}%
              </span>
            </div>
          </div>
          <div className="mt-2 h-2 bg-metal-900 rounded overflow-hidden">
            <div 
              className={`h-full transition-all ${selected.health > 50 ? 'bg-radiation-400' : selected.health > 25 ? 'bg-yellow-500' : 'bg-blood-500'}`}
              style={{ width: `${selected.health}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Top Killers */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-metal-500 uppercase">Top Killers</span>
        </div>
        <div className="space-y-1">
          {topKillers.map((player, index) => (
            <motion.button
              key={player.id}
              whileHover={{ x: 3 }}
              onClick={() => onSelectPlayer(player.id === selectedPlayer ? null : player.id)}
              className={`w-full flex items-center gap-2 px-2 py-1 text-left transition-colors ${
                player.id === selectedPlayer 
                  ? 'bg-metal-700 border-l-2 border-rust-500' 
                  : 'bg-metal-800/50 hover:bg-metal-800'
              }`}
            >
              <span className={`w-5 text-xs font-mono ${
                index === 0 ? 'text-yellow-500' : 
                index === 1 ? 'text-gray-400' : 
                index === 2 ? 'text-amber-600' : 'text-metal-500'
              }`}>
                #{index + 1}
              </span>
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: player.color }} 
              />
              <span className="flex-1 text-xs text-white truncate">{player.name}</span>
              <span className="text-xs font-mono text-metal-400">{player.kills}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Faction War Score */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Swords className="w-4 h-4 text-rust-400" />
          <span className="text-xs text-metal-500 uppercase">Faction War</span>
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-400">SERAPHAR</span>
              <span className="text-metal-400 font-mono">
                {players.filter(p => p.faction === 'seraphar').reduce((s, p) => s + p.kills, 0)} kills
              </span>
            </div>
            <div className="h-2 bg-metal-800 rounded overflow-hidden">
              <div 
                className="h-full bg-amber-500"
                style={{ 
                  width: `${(players.filter(p => p.faction === 'seraphar').reduce((s, p) => s + p.kills, 0) / 
                    Math.max(1, stats.totalKills)) * 100}%` 
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400">VORGAROTH</span>
              <span className="text-metal-400 font-mono">
                {players.filter(p => p.faction === 'vorgaroth').reduce((s, p) => s + p.kills, 0)} kills
              </span>
            </div>
            <div className="h-2 bg-metal-800 rounded overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ 
                  width: `${(players.filter(p => p.faction === 'vorgaroth').reduce((s, p) => s + p.kills, 0) / 
                    Math.max(1, stats.totalKills)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: number
  color: string 
}) {
  return (
    <div className="bg-metal-800/50 p-2 border border-metal-700">
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span className="text-xs text-metal-500">{label}</span>
      </div>
      <span className={`font-mono text-lg ${color}`}>{value}</span>
    </div>
  )
}
