'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Crown, Skull, Target, Swords, Shield, 
  TrendingUp, Medal, Star, Flame, Zap, Heart,
  ChevronUp, ChevronDown, Award, Users, Activity, User
} from 'lucide-react'
import { Player, HeatmapStats as Stats } from '@/hooks/useHeatmapSimulation'
import { useStore } from '@/store/useStore'

interface HeatmapLeaderboardProps {
  stats: Stats
  players: Player[]
  selectedPlayer: string | null
  onSelectPlayer: (id: string | null) => void
}

type LeaderboardTab = 'kills' | 'kd' | 'faction' | 'achievements'
type SortField = 'kills' | 'deaths' | 'kd' | 'health' | 'name'
type SortOrder = 'asc' | 'desc'

// Eldrun Achievements - Based on server features
const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', icon: '🩸', description: 'Erster Kill der Session', points: 100 },
  { id: 'dominator', name: 'Dominator', icon: '👑', description: '10+ Kills ohne Tod', points: 500 },
  { id: 'survivor', name: 'Survivor', icon: '🛡️', description: '30 Minuten ohne Tod', points: 200 },
  { id: 'headhunter', name: 'Headhunter', icon: '🎯', description: '5 Kills in 5 Minuten', points: 300 },
  { id: 'revenge', name: 'Rache', icon: '⚡', description: 'Killer eliminiert', points: 150 },
  { id: 'team_player', name: 'Teamplayer', icon: '🤝', description: '3 Assists', points: 100 },
  { id: 'faction_hero', name: 'Fraktionsheld', icon: '⭐', description: 'Top Killer der Fraktion', points: 400 },
  { id: 'monument_master', name: 'Monument Meister', icon: '🏛️', description: 'Alle Monumente besucht', points: 250 },
  { id: 'raid_master', name: 'Raid Meister', icon: '🐉', description: 'Raid Base auf Nightmare bezwungen', points: 750 },
  { id: 'quest_champion', name: 'Quest Champion', icon: '📜', description: '50 Quests abgeschlossen', points: 600 },
  { id: 'pet_master', name: 'Tiermeister', icon: '🐺', description: '3 verschiedene Pets gezähmt', points: 350 },
  { id: 'castle_lord', name: 'Burgherr', icon: '🏰', description: 'Castle auf Max Level', points: 800 },
  { id: 'prestige', name: 'Prestige', icon: '💎', description: 'Level 100 erreicht', points: 1000 },
  { id: 'class_master', name: 'Klassenmeister', icon: '⚔️', description: 'Ultimate-Fähigkeit freigeschaltet', points: 450 },
  { id: 'guild_founder', name: 'Gildengründer', icon: '👥', description: 'Gilde mit 10+ Mitgliedern', points: 400 },
  { id: 'bounty_hunter', name: 'Kopfgeldjäger', icon: '💰', description: '10 Kopfgelder erfüllt', points: 550 },
]

// Generate random achievements for players
const getPlayerAchievements = (player: Player) => {
  const seed = player.id.charCodeAt(0) + player.kills
  const count = Math.min(ACHIEVEMENTS.length, Math.floor(seed % 5) + 1)
  return ACHIEVEMENTS.slice(0, count)
}

export function HeatmapLeaderboard({ stats, players, selectedPlayer, onSelectPlayer }: HeatmapLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('kills')
  const [sortField, setSortField] = useState<SortField>('kills')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  
  // Get current logged-in user for highlighting
  const { currentUser } = useStore()

  const alivePlayers = players.filter(p => p.status !== 'dead')
  const selected = players.find(p => p.id === selectedPlayer)
  
  // Check if player matches logged-in user (by username)
  const isCurrentUser = (playerName: string) => {
    return currentUser && currentUser.username.toLowerCase() === playerName.toLowerCase()
  }

  // Sort players
  const sortedPlayers = [...players].sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0

    switch (sortField) {
      case 'kills': aVal = a.kills; bVal = b.kills; break
      case 'deaths': aVal = a.deaths; bVal = b.deaths; break
      case 'kd': aVal = a.kills / Math.max(1, a.deaths); bVal = b.kills / Math.max(1, b.deaths); break
      case 'health': aVal = a.health; bVal = b.health; break
      case 'name': aVal = a.name; bVal = b.name; break
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
    }
    return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  const displayPlayers = showAllPlayers ? sortedPlayers : sortedPlayers.slice(0, 10)

  // Faction stats
  const serapharPlayers = players.filter(p => p.faction === 'seraphar')
  const vorgarothPlayers = players.filter(p => p.faction === 'vorgaroth')
  const serapharKills = serapharPlayers.reduce((s, p) => s + p.kills, 0)
  const vorgarothKills = vorgarothPlayers.reduce((s, p) => s + p.kills, 0)
  const serapharDeaths = serapharPlayers.reduce((s, p) => s + p.deaths, 0)
  const vorgarothDeaths = vorgarothPlayers.reduce((s, p) => s + p.deaths, 0)
  const totalKills = serapharKills + vorgarothKills

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const tabs: { id: LeaderboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'kills', label: 'Top Kills', icon: <Skull className="w-4 h-4" /> },
    { id: 'kd', label: 'K/D Ratio', icon: <Target className="w-4 h-4" /> },
    { id: 'faction', label: 'Fraktionen', icon: <Swords className="w-4 h-4" /> },
    { id: 'achievements', label: 'Erfolge', icon: <Trophy className="w-4 h-4" /> },
  ]

  return (
    <div id="leaderboard" className="bg-metal-900/50 border border-metal-800">
      {/* Header */}
      <div className="p-4 border-b border-metal-800">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            LEADERBOARD
          </h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-1 bg-metal-800 text-xs">
              <Activity className="w-3 h-3 text-green-400 animate-pulse" />
              <span className="text-metal-400">LIVE</span>
            </span>
            <span className="text-xs text-metal-500 font-mono">{players.length} Spieler</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-display uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-rust-500/20 text-rust-400 border-b-2 border-rust-500'
                  : 'text-metal-400 hover:text-white hover:bg-metal-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* KILLS TAB */}
          {activeTab === 'kills' && (
            <motion.div
              key="kills"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2">
                <QuickStat icon={<Users />} label="Online" value={alivePlayers.length} color="text-green-400" />
                <QuickStat icon={<Skull />} label="Total Kills" value={stats.totalKills} color="text-red-400" />
                <QuickStat icon={<Heart />} label="Deaths" value={stats.totalDeaths} color="text-purple-400" />
                <QuickStat icon={<Target />} label="Avg K/D" value={(stats.totalKills / Math.max(1, stats.totalDeaths)).toFixed(2)} color="text-amber-400" />
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-2 py-1 bg-metal-800/50 text-xs text-metal-500 uppercase">
                <div className="col-span-1">#</div>
                <div className="col-span-4 cursor-pointer hover:text-white flex items-center gap-1" onClick={() => toggleSort('name')}>
                  Spieler
                  {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="col-span-2">Fraktion</div>
                <div className="col-span-2 cursor-pointer hover:text-white flex items-center gap-1" onClick={() => toggleSort('kills')}>
                  Kills
                  {sortField === 'kills' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="col-span-1 cursor-pointer hover:text-white flex items-center gap-1" onClick={() => toggleSort('deaths')}>
                  D
                  {sortField === 'deaths' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
                <div className="col-span-2 cursor-pointer hover:text-white flex items-center gap-1" onClick={() => toggleSort('kd')}>
                  K/D
                  {sortField === 'kd' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </div>

              {/* Player Rows */}
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {displayPlayers.map((player, index) => {
                  const rank = sortedPlayers.findIndex(p => p.id === player.id) + 1
                  const kd = (player.kills / Math.max(1, player.deaths)).toFixed(2)
                  const isSelected = player.id === selectedPlayer
                  
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => onSelectPlayer(isSelected ? null : player.id)}
                      className={`grid grid-cols-12 gap-2 px-2 py-2 cursor-pointer transition-all ${
                        isSelected ? 'bg-rust-500/20 border-l-2 border-rust-500' : 'bg-metal-800/30 hover:bg-metal-800/60'
                      } ${player.status === 'dead' ? 'opacity-50' : ''}`}
                    >
                      <div className="col-span-1 flex items-center">
                        <span className={`font-mono text-sm ${
                          rank === 1 ? 'text-yellow-400' :
                          rank === 2 ? 'text-gray-300' :
                          rank === 3 ? 'text-amber-600' : 'text-metal-500'
                        }`}>
                          {rank === 1 && '🥇'}
                          {rank === 2 && '🥈'}
                          {rank === 3 && '🥉'}
                          {rank > 3 && `#${rank}`}
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                        <span className="text-white text-sm truncate">{player.name}</span>
                        {player.status === 'combat' && <Flame className="w-3 h-3 text-red-400 animate-pulse" />}
                        {player.status === 'dead' && <Skull className="w-3 h-3 text-metal-500" />}
                      </div>
                      <div className="col-span-2">
                        <span className={`text-xs px-1.5 py-0.5 ${
                          player.faction === 'seraphar' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {player.faction.toUpperCase()}
                        </span>
                      </div>
                      <div className="col-span-2 font-mono text-sm text-white">{player.kills}</div>
                      <div className="col-span-1 font-mono text-sm text-metal-400">{player.deaths}</div>
                      <div className="col-span-2 font-mono text-sm">
                        <span className={parseFloat(kd) >= 2 ? 'text-green-400' : parseFloat(kd) >= 1 ? 'text-yellow-400' : 'text-red-400'}>
                          {kd}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Show More Button */}
              {players.length > 10 && (
                <button
                  onClick={() => setShowAllPlayers(!showAllPlayers)}
                  className="w-full py-2 text-sm text-metal-400 hover:text-white bg-metal-800/50 hover:bg-metal-800 transition-colors"
                >
                  {showAllPlayers ? 'Weniger anzeigen' : `Alle ${players.length} Spieler anzeigen`}
                </button>
              )}
            </motion.div>
          )}

          {/* K/D RATIO TAB */}
          {activeTab === 'kd' && (
            <motion.div
              key="kd"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Top K/D Players */}
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => (b.kills / Math.max(1, b.deaths)) - (a.kills / Math.max(1, a.deaths)))
                  .slice(0, 10)
                  .map((player, index) => {
                    const kd = player.kills / Math.max(1, player.deaths)
                    const maxKd = players.reduce((max, p) => Math.max(max, p.kills / Math.max(1, p.deaths)), 0)
                    
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelectPlayer(player.id === selectedPlayer ? null : player.id)}
                        className={`p-3 cursor-pointer transition-all ${
                          player.id === selectedPlayer ? 'bg-rust-500/20 border border-rust-500/50' : 'bg-metal-800/30 hover:bg-metal-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl ${
                              index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-metal-500'
                            }`}>
                              {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }} />
                            <span className="font-display font-bold text-white">{player.name}</span>
                            <span className={`text-xs px-1 ${player.faction === 'seraphar' ? 'text-amber-400' : 'text-red-400'}`}>
                              [{player.faction.toUpperCase()}]
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono text-2xl font-bold ${
                              kd >= 3 ? 'text-green-400' : kd >= 2 ? 'text-yellow-400' : kd >= 1 ? 'text-orange-400' : 'text-red-400'
                            }`}>
                              {kd.toFixed(2)}
                            </span>
                            <span className="text-metal-500 text-xs ml-1">K/D</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-metal-400">
                          <span>Kills: <span className="text-white font-mono">{player.kills}</span></span>
                          <span>Deaths: <span className="text-white font-mono">{player.deaths}</span></span>
                        </div>
                        <div className="mt-2 h-2 bg-metal-900 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(kd / maxKd) * 100}%` }}
                            transition={{ delay: index * 0.05, duration: 0.5 }}
                            className={`h-full ${
                              kd >= 3 ? 'bg-green-500' : kd >= 2 ? 'bg-yellow-500' : kd >= 1 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            </motion.div>
          )}

          {/* FACTION TAB */}
          {activeTab === 'faction' && (
            <motion.div
              key="faction"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Faction War Banner */}
              <div className="relative p-6 bg-gradient-to-r from-rust-900/50 via-metal-900 to-purple-900/50 border border-metal-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Swords className="w-20 h-20 text-metal-800" />
                </div>
                <div className="relative grid grid-cols-3 gap-4">
                  {/* SERAPHAR */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                      <span className="text-3xl">☀️</span>
                    </div>
                    <h3 className="font-display font-black text-xl text-amber-400">SERAPHAR</h3>
                    <p className="text-metal-500 text-xs">Licht über Allem</p>
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-display font-black text-4xl text-metal-600">VS</span>
                    <div className="mt-2 text-center">
                      <span className="text-xs text-metal-500">FACTION WAR</span>
                    </div>
                  </div>

                  {/* VORGAROTH */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                      <span className="text-3xl">🐉</span>
                    </div>
                    <h3 className="font-display font-black text-xl text-red-400">VORGAROTH</h3>
                    <p className="text-metal-500 text-xs">Feuer und Blut</p>
                  </div>
                </div>
              </div>

              {/* Faction Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* SERAPHAR Stats */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30">
                  <h4 className="font-display font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    SERAPHAR STATS
                  </h4>
                  <div className="space-y-2 text-sm">
                    <StatRow label="Spieler" value={serapharPlayers.length} />
                    <StatRow label="Alive" value={serapharPlayers.filter(p => p.status !== 'dead').length} />
                    <StatRow label="Total Kills" value={serapharKills} highlight />
                    <StatRow label="Total Deaths" value={serapharDeaths} />
                    <StatRow label="Avg K/D" value={(serapharKills / Math.max(1, serapharDeaths)).toFixed(2)} />
                    <StatRow label="Top Killer" value={[...serapharPlayers].sort((a, b) => b.kills - a.kills)[0]?.name || '-'} />
                  </div>
                </div>

                {/* VORGAROTH Stats */}
                <div className="p-4 bg-red-500/10 border border-red-500/30">
                  <h4 className="font-display font-bold text-red-400 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    VORGAROTH STATS
                  </h4>
                  <div className="space-y-2 text-sm">
                    <StatRow label="Spieler" value={vorgarothPlayers.length} />
                    <StatRow label="Alive" value={vorgarothPlayers.filter(p => p.status !== 'dead').length} />
                    <StatRow label="Total Kills" value={vorgarothKills} highlight />
                    <StatRow label="Total Deaths" value={vorgarothDeaths} />
                    <StatRow label="Avg K/D" value={(vorgarothKills / Math.max(1, vorgarothDeaths)).toFixed(2)} />
                    <StatRow label="Top Killer" value={[...vorgarothPlayers].sort((a, b) => b.kills - a.kills)[0]?.name || '-'} />
                  </div>
                </div>
              </div>

              {/* Kill Distribution */}
              <div>
                <h4 className="text-sm text-metal-500 uppercase mb-2">Kill Verteilung</h4>
                <div className="h-8 flex rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(serapharKills / Math.max(1, totalKills)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-amber-500 flex items-center justify-center"
                  >
                    <span className="text-xs font-mono text-white font-bold">
                      {totalKills > 0 ? Math.round((serapharKills / totalKills) * 100) : 50}%
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(vorgarothKills / Math.max(1, totalKills)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-red-500 flex items-center justify-center"
                  >
                    <span className="text-xs font-mono text-white font-bold">
                      {totalKills > 0 ? Math.round((vorgarothKills / totalKills) * 100) : 50}%
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Winner */}
              {totalKills > 0 && (
                <div className={`p-4 text-center ${serapharKills > vorgarothKills ? 'bg-amber-500/20' : 'bg-red-500/20'} border ${serapharKills > vorgarothKills ? 'border-amber-500/50' : 'border-red-500/50'}`}>
                  <Crown className={`w-8 h-8 mx-auto mb-2 ${serapharKills > vorgarothKills ? 'text-amber-400' : 'text-red-400'}`} />
                  <p className="font-display font-black text-2xl text-white">
                    {serapharKills > vorgarothKills ? 'SERAPHAR' : serapharKills < vorgarothKills ? 'VORGAROTH' : 'UNENTSCHIEDEN'}
                  </p>
                  <p className="text-metal-400 text-sm">führt mit {Math.abs(serapharKills - vorgarothKills)} Kills</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* All Achievements */}
              <div>
                <h4 className="text-sm text-metal-500 uppercase mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Verfügbare Erfolge
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {ACHIEVEMENTS.map((ach, i) => (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 bg-metal-800/50 border border-metal-700 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">{ach.icon}</span>
                        <div className="flex-1">
                          <h5 className="font-display font-bold text-white text-sm">{ach.name}</h5>
                          <p className="text-metal-500 text-xs">{ach.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-amber-400" />
                            <span className="text-xs text-amber-400 font-mono">{ach.points} XP</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Top Achievement Holders */}
              <div>
                <h4 className="text-sm text-metal-500 uppercase mb-3 flex items-center gap-2">
                  <Medal className="w-4 h-4" />
                  Top Spieler nach Erfolgen
                </h4>
                <div className="space-y-2">
                  {[...players]
                    .sort((a, b) => getPlayerAchievements(b).length - getPlayerAchievements(a).length)
                    .slice(0, 5)
                    .map((player, index) => {
                      const achievements = getPlayerAchievements(player)
                      const totalPoints = achievements.reduce((s, a) => s + a.points, 0)
                      
                      return (
                        <div
                          key={player.id}
                          onClick={() => onSelectPlayer(player.id === selectedPlayer ? null : player.id)}
                          className={`p-3 cursor-pointer transition-all ${
                            player.id === selectedPlayer ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-metal-800/30 hover:bg-metal-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg ${index === 0 ? 'text-yellow-400' : 'text-metal-500'}`}>
                                {index === 0 ? '👑' : `#${index + 1}`}
                              </span>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                              <span className="font-bold text-white">{player.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400" />
                              <span className="font-mono text-amber-400">{totalPoints}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {achievements.map(ach => (
                              <span key={ach.id} className="text-lg" title={ach.name}>{ach.icon}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Player Detail */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-metal-800 bg-metal-800/50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: selected.color }}>
                <span className="text-white font-bold">{selected.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-white">{selected.name}</h3>
                <span className={`text-xs ${selected.faction === 'seraphar' ? 'text-amber-400' : 'text-red-400'}`}>
                  {selected.faction.toUpperCase()} FRAKTION
                </span>
              </div>
            </div>
            <button 
              onClick={() => onSelectPlayer(null)}
              className="text-metal-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 bg-metal-900">
              <p className="text-2xl font-mono font-bold text-white">{selected.kills}</p>
              <p className="text-xs text-metal-500">Kills</p>
            </div>
            <div className="text-center p-2 bg-metal-900">
              <p className="text-2xl font-mono font-bold text-white">{selected.deaths}</p>
              <p className="text-xs text-metal-500">Deaths</p>
            </div>
            <div className="text-center p-2 bg-metal-900">
              <p className={`text-2xl font-mono font-bold ${
                (selected.kills / Math.max(1, selected.deaths)) >= 2 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {(selected.kills / Math.max(1, selected.deaths)).toFixed(2)}
              </p>
              <p className="text-xs text-metal-500">K/D</p>
            </div>
            <div className="text-center p-2 bg-metal-900">
              <p className={`text-2xl font-mono font-bold ${
                selected.health > 50 ? 'text-green-400' : selected.health > 25 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {selected.health}%
              </p>
              <p className="text-xs text-metal-500">Health</p>
            </div>
          </div>

          {/* Achievements */}
          <div className="mt-3">
            <p className="text-xs text-metal-500 mb-2">Erfolge</p>
            <div className="flex gap-2 flex-wrap">
              {getPlayerAchievements(selected).map(ach => (
                <div key={ach.id} className="flex items-center gap-1 px-2 py-1 bg-metal-900 text-xs">
                  <span>{ach.icon}</span>
                  <span className="text-metal-300">{ach.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-metal-800/50 p-3 border border-metal-700">
      <div className={`flex items-center gap-1 ${color} mb-1`}>
        {icon}
        <span className="text-xs text-metal-500">{label}</span>
      </div>
      <span className={`font-mono text-xl font-bold ${color}`}>{value}</span>
    </div>
  )
}

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-metal-500">{label}</span>
      <span className={`font-mono ${highlight ? 'text-white font-bold' : 'text-metal-300'}`}>{value}</span>
    </div>
  )
}
