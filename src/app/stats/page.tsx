'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, Users, Sword, Shield, Clock, Trophy,
  TrendingUp, TrendingDown, Target, Skull, Heart,
  MapPin, Flame, Zap, Calendar, ChevronDown, Swords
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN SERVER STATISTIKEN - Maximale Daten
// ═══════════════════════════════════════════════════════════════════════════

const WIPE_HISTORY: { date: string; players: number; duration: string; topClan: string; raids: number; topKiller: string; topKills: number; factionWinner: string }[] = [
  { date: 'Dezember 2024 (Wipe 2)', players: 2156, duration: '7 Tage', topClan: 'Phoenix Rising', raids: 487, topKiller: 'ShadowHunter', topKills: 847, factionWinner: 'Seraphar' },
  { date: 'Dezember 2024 (Wipe 1)', players: 1847, duration: '7 Tage', topClan: 'Dragons of Chaos', raids: 342, topKiller: 'BloodMoon', topKills: 723, factionWinner: 'Vorgaroth' },
  { date: 'November 2024 (Wipe 2)', players: 1789, duration: '7 Tage', topClan: 'Iron Legion', raids: 378, topKiller: 'NightStalker', topKills: 689, factionWinner: 'Seraphar' },
  { date: 'November 2024 (Wipe 1)', players: 1623, duration: '7 Tage', topClan: 'Knights of Light', raids: 298, topKiller: 'DragonSlayer', topKills: 612, factionWinner: 'Vorgaroth' },
  { date: 'Oktober 2024 (Wipe 2)', players: 1567, duration: '7 Tage', topClan: 'Shadow Clan', raids: 312, topKiller: 'StormRider', topKills: 578, factionWinner: 'Seraphar' },
  { date: 'Oktober 2024 (Wipe 1)', players: 1456, duration: '7 Tage', topClan: 'Shadow Assassins', raids: 267, topKiller: 'IronFist', topKills: 534, factionWinner: 'Vorgaroth' },
  { date: 'September 2024 (Wipe 2)', players: 1389, duration: '7 Tage', topClan: 'Phoenix Rising', raids: 289, topKiller: 'BloodMoon', topKills: 501, factionWinner: 'Seraphar' },
  { date: 'September 2024 (Wipe 1)', players: 1289, duration: '7 Tage', topClan: 'Dragons of Chaos', raids: 234, topKiller: 'ShadowHunter', topKills: 489, factionWinner: 'Vorgaroth' },
  { date: 'August 2024 (Wipe 2)', players: 1234, duration: '7 Tage', topClan: 'Knights of Light', raids: 256, topKiller: 'NightWalker', topKills: 467, factionWinner: 'Seraphar' },
  { date: 'August 2024 (Wipe 1)', players: 1134, duration: '7 Tage', topClan: 'Iron Legion', raids: 198, topKiller: 'DragonFury', topKills: 423, factionWinner: 'Vorgaroth' },
]

const CLAN_STATS: { rank: number; name: string; tag: string; members: number; kills: number; deaths: number; kd: number; raids: number; raidSuccess: number; territories: number; color: string; faction: string }[] = [
  { rank: 1, name: 'Phoenix Rising', tag: 'PHX', members: 48, kills: 28456, deaths: 7123, kd: 4.00, raids: 156, raidSuccess: 89, territories: 12, color: 'text-orange-400', faction: 'Seraphar' },
  { rank: 2, name: 'Iron Legion', tag: 'IRON', members: 45, kills: 24789, deaths: 8234, kd: 3.01, raids: 134, raidSuccess: 78, territories: 10, color: 'text-blue-400', faction: 'Vorgaroth' },
  { rank: 3, name: 'Dragons of Chaos', tag: 'DoC', members: 42, kills: 22456, deaths: 6234, kd: 3.60, raids: 128, raidSuccess: 82, territories: 9, color: 'text-purple-400', faction: 'Vorgaroth' },
  { rank: 4, name: 'Knights of Light', tag: 'KoL', members: 38, kills: 19876, deaths: 6789, kd: 2.93, raids: 112, raidSuccess: 71, territories: 8, color: 'text-amber-400', faction: 'Seraphar' },
  { rank: 5, name: 'Shadow Clan', tag: 'SDW', members: 35, kills: 17654, deaths: 5678, kd: 3.11, raids: 98, raidSuccess: 75, territories: 7, color: 'text-gray-400', faction: 'Vorgaroth' },
  { rank: 6, name: 'Night Watch', tag: 'NTW', members: 32, kills: 15234, deaths: 5234, kd: 2.91, raids: 87, raidSuccess: 68, territories: 6, color: 'text-indigo-400', faction: 'Seraphar' },
  { rank: 7, name: 'Blood Raiders', tag: 'BLD', members: 28, kills: 13456, deaths: 4987, kd: 2.70, raids: 76, raidSuccess: 64, territories: 5, color: 'text-red-400', faction: 'Vorgaroth' },
  { rank: 8, name: 'Storm Breakers', tag: 'STM', members: 25, kills: 11234, deaths: 4234, kd: 2.65, raids: 65, raidSuccess: 59, territories: 4, color: 'text-cyan-400', faction: 'Seraphar' },
  { rank: 9, name: 'Dark Council', tag: 'DRK', members: 22, kills: 9876, deaths: 3987, kd: 2.48, raids: 54, raidSuccess: 52, territories: 3, color: 'text-emerald-400', faction: 'Vorgaroth' },
  { rank: 10, name: 'Golden Eagles', tag: 'GLD', members: 20, kills: 8234, deaths: 3456, kd: 2.38, raids: 43, raidSuccess: 48, territories: 2, color: 'text-yellow-400', faction: 'Seraphar' },
  { rank: 11, name: 'Void Walkers', tag: 'VWK', members: 18, kills: 7123, deaths: 3123, kd: 2.28, raids: 38, raidSuccess: 45, territories: 2, color: 'text-violet-400', faction: 'Vorgaroth' },
  { rank: 12, name: 'Frost Giants', tag: 'FST', members: 16, kills: 6234, deaths: 2876, kd: 2.17, raids: 32, raidSuccess: 41, territories: 1, color: 'text-sky-400', faction: 'Seraphar' },
]

// Umfassende Server-Statistiken
const SERVER_STATS = {
  // Spieler Stats
  totalPlayers: 24567,
  activePlayers: 187,
  peakPlayers: 312,
  newPlayersToday: 47,
  returningPlayers: 89,
  
  // Kampf Stats
  totalKills: 1247856,
  totalDeaths: 987234,
  headshots: 456789,
  headshotRate: 36.6,
  longestKillStreak: 47,
  longestKillStreakPlayer: 'BloodMoon',
  
  // Raid Stats  
  totalRaids: 8976,
  successfulRaids: 6234,
  raidSuccessRate: 69.4,
  c4Used: 34567,
  rocketsUsed: 23456,
  
  // Wirtschaft Stats
  totalCoinsEarned: 987654321,
  totalCoinsSpent: 765432198,
  shopPurchases: 156789,
  tradingVolume: 234567890,
  casinoWinnings: 45678901,
  casinoLosses: 43210987,
  
  // Zeit Stats
  totalPlaytime: 456789,
  averageSession: 4.2,
  longestSession: 18.5,
  longestSessionPlayer: 'NightOwl',
  
  // Server Stats
  uptime: 99.7,
  averagePing: 23,
  serverRestarts: 12,
  
  // Fraktionen
  serapharKills: 623456,
  vorgarothKills: 624400,
  serapharPlayers: 12345,
  vorgarothPlayers: 12222,
  factionWarWins: { seraphar: 6, vorgaroth: 4 },
}

// Top Spieler Statistiken
const TOP_PLAYERS = {
  kills: [
    { name: 'BloodMoon', value: 15678, faction: 'Vorgaroth', clan: 'Dragons of Chaos' },
    { name: 'ShadowHunter', value: 14234, faction: 'Seraphar', clan: 'Phoenix Rising' },
    { name: 'NightStalker', value: 12987, faction: 'Vorgaroth', clan: 'Shadow Clan' },
    { name: 'DragonSlayer', value: 11456, faction: 'Seraphar', clan: 'Knights of Light' },
    { name: 'StormRider', value: 10234, faction: 'Seraphar', clan: 'Storm Breakers' },
  ],
  kd: [
    { name: 'Assassin', value: 8.45, faction: 'Vorgaroth', clan: 'Shadow Clan' },
    { name: 'Headhunter', value: 7.23, faction: 'Seraphar', clan: 'Phoenix Rising' },
    { name: 'BloodMoon', value: 6.89, faction: 'Vorgaroth', clan: 'Dragons of Chaos' },
    { name: 'Sniper', value: 6.34, faction: 'Seraphar', clan: 'Night Watch' },
    { name: 'Ghost', value: 5.98, faction: 'Vorgaroth', clan: 'Void Walkers' },
  ],
  raids: [
    { name: 'RaidKing', value: 234, faction: 'Vorgaroth', clan: 'Blood Raiders' },
    { name: 'ExplosiveExpert', value: 198, faction: 'Seraphar', clan: 'Phoenix Rising' },
    { name: 'DemolitionMan', value: 176, faction: 'Vorgaroth', clan: 'Iron Legion' },
    { name: 'Breacher', value: 154, faction: 'Seraphar', clan: 'Storm Breakers' },
    { name: 'SiegeKing', value: 143, faction: 'Vorgaroth', clan: 'Dragons of Chaos' },
  ],
  playtime: [
    { name: 'NightOwl', value: 2456, faction: 'Seraphar', clan: 'Night Watch' },
    { name: 'NoLifer', value: 2234, faction: 'Vorgaroth', clan: 'Void Walkers' },
    { name: 'Dedicated', value: 2012, faction: 'Seraphar', clan: 'Phoenix Rising' },
    { name: 'Marathon', value: 1876, faction: 'Vorgaroth', clan: 'Iron Legion' },
    { name: 'Grinder', value: 1734, faction: 'Seraphar', clan: 'Knights of Light' },
  ],
}

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clans' | 'history'>('overview')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const { factionScore } = useStore()
  const totalScore = Math.max(1, factionScore.seraphar + factionScore.vorgaroth)
  const serapharPct = Math.round((factionScore.seraphar / totalScore) * 100)
  const vorgarothPct = 100 - serapharPct

  return (
    <EldrunPageShell
      icon={BarChart3}
      badge="STATISTIKEN"
      title="SERVER STATISTIKEN"
      subtitle="DETAILLIERTE EINBLICKE"
      description="Umfassende Statistiken zu Spielern, Clans, Raids und mehr auf dem Eldrun Server."
      gradient="from-indigo-300 via-indigo-400 to-indigo-600"
      glowColor="rgba(99,102,241,0.22)"
    >
      <div>
        <AuthGate>
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'overview', name: 'Übersicht', icon: BarChart3 },
            { id: 'clans', name: 'Clan Statistiken', icon: Shield },
            { id: 'history', name: 'Wipe History', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                  : 'bg-metal-800 text-metal-400 border border-metal-700 hover:border-metal-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Global Faction Control */}
            <div className="bg-metal-900/60 border border-metal-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Swords className="w-5 h-5 text-rust-400" />
                <div>
                  <p className="text-xs font-mono text-metal-500 uppercase tracking-wider">Global Faction War</p>
                  <p className="font-display font-bold text-white">Seraphar vs Vorgaroth</p>
                </div>
              </div>
              <div className="h-4 bg-metal-800 rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/80 to-amber-400/60 transition-all"
                  style={{ width: `${serapharPct}%` }}
                />
                <div
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-600/70 to-red-500/60 transition-all"
                  style={{ width: `${vorgarothPct}%` }}
                />
              </div>
              <div className="flex justify-between text-sm font-mono text-metal-400 mt-2">
                <span className="text-amber-400">Seraphar {serapharPct}%</span>
                <span className="text-red-400">Vorgaroth {vorgarothPct}%</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Gesamt Spieler', value: SERVER_STATS.totalPlayers.toLocaleString(), icon: Users, color: 'text-blue-400' },
                { label: 'Aktiv Jetzt', value: SERVER_STATS.activePlayers, icon: Zap, color: 'text-green-400' },
                { label: 'Gesamt Kills', value: (SERVER_STATS.totalKills / 1000).toFixed(1) + 'K', icon: Skull, color: 'text-red-400' },
                { label: 'Raids', value: SERVER_STATS.totalRaids.toLocaleString(), icon: Flame, color: 'text-orange-400' },
                { label: 'Spielstunden', value: (SERVER_STATS.totalPlaytime / 1000).toFixed(0) + 'K', icon: Clock, color: 'text-purple-400' },
                { label: 'Ø Session', value: SERVER_STATS.averageSession + 'h', icon: Target, color: 'text-amber-400' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-metal-900/50 border border-metal-800 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-metal-500">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Spieler Aktivität (7 Tage)</h3>
                <div className="h-48 flex items-end gap-2">
                  {[65, 78, 92, 85, 110, 95, 120].map((value, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / 120) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-metal-500">
                  <span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>
                </div>
              </div>

              <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Kills nach Waffe</h3>
                <div className="space-y-3">
                  {[
                    { name: 'AK-47', value: 35, color: 'bg-red-500' },
                    { name: 'LR-300', value: 25, color: 'bg-orange-500' },
                    { name: 'MP5', value: 18, color: 'bg-amber-500' },
                    { name: 'Bolt', value: 12, color: 'bg-blue-500' },
                    { name: 'Andere', value: 10, color: 'bg-metal-500' },
                  ].map((weapon, i) => (
                    <div key={weapon.name} className="flex items-center gap-3">
                      <span className="text-sm text-metal-400 w-16">{weapon.name}</span>
                      <div className="flex-1 h-4 bg-metal-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${weapon.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${weapon.value}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm text-metal-400 w-10 text-right">{weapon.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Peak Spielzeiten</h3>
              <div className="grid grid-cols-24 gap-1">
                {Array.from({ length: 24 }).map((_, hour) => {
                  const intensity = hour >= 18 && hour <= 23 ? 0.9 : 
                                   hour >= 14 && hour <= 17 ? 0.6 :
                                   hour >= 10 && hour <= 13 ? 0.4 :
                                   hour >= 6 && hour <= 9 ? 0.3 : 0.15
                  return (
                    <div key={hour} className="text-center">
                      <div 
                        className="h-16 rounded transition-all"
                        style={{ 
                          backgroundColor: `rgba(99, 102, 241, ${intensity})`,
                        }}
                      />
                      <span className="text-xs text-metal-500">{hour}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Clans Tab */}
        {activeTab === 'clans' && (
          <div className="space-y-6">
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-metal-800">
                    <th className="px-6 py-4 text-left text-sm text-metal-400">Rang</th>
                    <th className="px-6 py-4 text-left text-sm text-metal-400">Clan</th>
                    <th className="px-6 py-4 text-center text-sm text-metal-400">Mitglieder</th>
                    <th className="px-6 py-4 text-center text-sm text-metal-400">Kills</th>
                    <th className="px-6 py-4 text-center text-sm text-metal-400">Deaths</th>
                    <th className="px-6 py-4 text-center text-sm text-metal-400">K/D</th>
                    <th className="px-6 py-4 text-center text-sm text-metal-400">Raids</th>
                  </tr>
                </thead>
                <tbody>
                  {CLAN_STATS.map((clan, index) => (
                    <motion.tr
                      key={clan.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-metal-800/50 hover:bg-metal-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          clan.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                          clan.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                          clan.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                          'bg-metal-700 text-metal-400'
                        }`}>
                          {clan.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${clan.color}`}>{clan.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-metal-300">{clan.members}</td>
                      <td className="px-6 py-4 text-center text-green-400 font-bold">{clan.kills.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center text-red-400">{clan.deaths.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${clan.kd >= 2 ? 'text-green-400' : clan.kd >= 1.5 ? 'text-amber-400' : 'text-red-400'}`}>
                          {clan.kd.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-orange-400 font-bold">{clan.raids}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {WIPE_HISTORY.map((wipe, index) => (
              <motion.div
                key={wipe.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-metal-900/50 border border-metal-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{wipe.date}</h3>
                    <p className="text-sm text-metal-400">{wipe.duration} Wipe</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 font-bold">{wipe.topClan}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-metal-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">{wipe.players}</div>
                    <div className="text-xs text-metal-400">Spieler</div>
                  </div>
                  <div className="text-center p-3 bg-metal-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">{wipe.raids}</div>
                    <div className="text-xs text-metal-400">Raids</div>
                  </div>
                  <div className="text-center p-3 bg-metal-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{wipe.duration}</div>
                    <div className="text-xs text-metal-400">Dauer</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </AuthGate>
      </div>
    </EldrunPageShell>
  )
}
