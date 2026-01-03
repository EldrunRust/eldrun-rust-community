'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Skull, Shield, AlertTriangle, Search, Calendar, Clock,
  ExternalLink, Eye, Ban, Flame, Target, Crosshair,
  ChevronDown, ChevronUp, Users, Coins, FileWarning,
  Gavel, Scale, Filter, TrendingUp, Award, Zap
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

// Cheater Database - Permanently Banned Players
const BLACKLIST_DATA = [
  {
    id: 'BL-2024-0847',
    steamId: '76561198847291034',
    steamName: 'xX_H4CK3R_Xx',
    steamAvatar: '🎭',
    banDate: '2024-12-15T14:32:00',
    cheatType: 'Aimbot + ESP',
    cheatDetails: 'Automatisches Zielen auf Kopf, Wallhack zur Spielererkennung durch Wände',
    detectionMethod: 'EAC + Server Anti-Cheat',
    evidence: ['Replay-Analyse', 'Statistik-Anomalie', 'Spieler-Reports (12)'],
    damageDealt: {
      playersKilled: 47,
      basesRaided: 3,
      itemsStolen: 'ca. 150.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 23,
      totalRefunded: '75.000 Coins',
      itemsRestored: true
    },
    previousBans: 2,
    playtimeBeforeBan: '12h 34m',
    faction: 'Vorgaroth',
    level: 15,
    notes: 'Zweiter Account nach erstem Ban. IP-Sperre aktiv.'
  },
  {
    id: 'BL-2024-0846',
    steamId: '76561199123456789',
    steamName: 'CheatMaster9000',
    steamAvatar: '💀',
    banDate: '2024-12-14T22:15:00',
    cheatType: 'Speedhack',
    cheatDetails: 'Bewegungsgeschwindigkeit 3x höher als normal, Fly-Hack zum Überfliegen von Basen',
    detectionMethod: 'Server Anti-Cheat',
    evidence: ['Server-Logs', 'Bewegungsanalyse', 'Video-Beweis'],
    damageDealt: {
      playersKilled: 12,
      basesRaided: 7,
      itemsStolen: 'ca. 80.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 15,
      totalRefunded: '45.000 Coins',
      itemsRestored: true
    },
    previousBans: 0,
    playtimeBeforeBan: '5h 12m',
    faction: 'Seraphar',
    level: 8,
    notes: 'Erster Verstoß. Sofortiger Permanent-Ban.'
  },
  {
    id: 'BL-2024-0845',
    steamId: '76561198555444333',
    steamName: 'NoRecoilPro',
    steamAvatar: '🔫',
    banDate: '2024-12-14T18:45:00',
    cheatType: 'No Recoil Script',
    cheatDetails: 'Externes Script zur Eliminierung von Waffenrückstoß',
    detectionMethod: 'Statistik-Analyse',
    evidence: ['Headshot-Rate 87%', 'Spray-Pattern Analyse', 'Spieler-Reports (8)'],
    damageDealt: {
      playersKilled: 89,
      basesRaided: 0,
      itemsStolen: 'ca. 20.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 31,
      totalRefunded: '35.000 Coins',
      itemsRestored: false
    },
    previousBans: 1,
    playtimeBeforeBan: '48h 22m',
    faction: 'Vorgaroth',
    level: 34,
    notes: 'Leugnete Cheats trotz eindeutiger Beweise.'
  },
  {
    id: 'BL-2024-0844',
    steamId: '76561198777888999',
    steamName: 'WallHacker_DE',
    steamAvatar: '👁️',
    banDate: '2024-12-13T09:20:00',
    cheatType: 'ESP / Wallhack',
    cheatDetails: 'Sieht Spieler, Loot und Basen durch Wände und Terrain',
    detectionMethod: 'Admin-Beobachtung',
    evidence: ['Admin-Spectate', 'Verdächtige Bewegungsmuster', 'Spieler-Reports (15)'],
    damageDealt: {
      playersKilled: 34,
      basesRaided: 12,
      itemsStolen: 'ca. 200.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 28,
      totalRefunded: '120.000 Coins',
      itemsRestored: true
    },
    previousBans: 0,
    playtimeBeforeBan: '72h 15m',
    faction: 'Seraphar',
    level: 42,
    notes: 'Gab Cheats nach Konfrontation zu.'
  },
  {
    id: 'BL-2024-0843',
    steamId: '76561198111222333',
    steamName: 'ItemDuper2024',
    steamAvatar: '📦',
    banDate: '2024-12-12T16:00:00',
    cheatType: 'Item Duplication Exploit',
    cheatDetails: 'Ausnutzung eines Server-Bugs zur Vervielfältigung von Items',
    detectionMethod: 'Economy-Monitoring',
    evidence: ['Inventar-Logs', 'Verdächtige Item-Mengen', 'Trade-History'],
    damageDealt: {
      playersKilled: 0,
      basesRaided: 0,
      itemsStolen: 'Duplizierte Items im Wert von 500.000+ Scrap'
    },
    compensation: {
      playersCompensated: 0,
      totalRefunded: '0 Coins',
      itemsRestored: false
    },
    previousBans: 0,
    playtimeBeforeBan: '156h 44m',
    faction: 'Vorgaroth',
    level: 67,
    notes: 'Exploit umgehend gepatcht. Alle duplizierten Items entfernt.'
  },
  {
    id: 'BL-2024-0842',
    steamId: '76561198999888777',
    steamName: 'RageQuitCheater',
    steamAvatar: '😤',
    banDate: '2024-12-11T21:30:00',
    cheatType: 'Aimbot + Triggerbot',
    cheatDetails: 'Automatisches Zielen und Schießen sobald Feind im Fadenkreuz',
    detectionMethod: 'EAC Detection',
    evidence: ['EAC-Ban', 'Reaktionszeit-Analyse', 'Spieler-Reports (22)'],
    damageDealt: {
      playersKilled: 156,
      basesRaided: 8,
      itemsStolen: 'ca. 300.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 67,
      totalRefunded: '200.000 Coins',
      itemsRestored: true
    },
    previousBans: 4,
    playtimeBeforeBan: '23h 11m',
    faction: 'Vorgaroth',
    level: 28,
    notes: '5. Account! Hardware-ID Ban implementiert.'
  },
  {
    id: 'BL-2024-0841',
    steamId: '76561198444555666',
    steamName: 'SilentAimDE',
    steamAvatar: '🎯',
    banDate: '2024-12-10T14:15:00',
    cheatType: 'Silent Aim',
    cheatDetails: 'Schüsse treffen Ziel unabhängig von Zielrichtung des Spielers',
    detectionMethod: 'Server Anti-Cheat',
    evidence: ['Schuss-Trajektorien-Analyse', 'Kill-Cam Reviews', 'Statistik-Anomalie'],
    damageDealt: {
      playersKilled: 78,
      basesRaided: 2,
      itemsStolen: 'ca. 45.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 34,
      totalRefunded: '55.000 Coins',
      itemsRestored: true
    },
    previousBans: 1,
    playtimeBeforeBan: '34h 56m',
    faction: 'Seraphar',
    level: 31,
    notes: 'Versuchte Berufung wurde abgelehnt.'
  },
  {
    id: 'BL-2024-0840',
    steamId: '76561198222333444',
    steamName: 'BaseFinder_Pro',
    steamAvatar: '🏠',
    banDate: '2024-12-09T11:45:00',
    cheatType: 'Radar Hack',
    cheatDetails: 'Externes Overlay zeigt alle Basen, Spieler und Fahrzeuge auf der Karte',
    detectionMethod: 'Verhaltensanalyse',
    evidence: ['Unnatürliches Navigationsmuster', 'Findet versteckte Basen sofort', 'Spieler-Reports (9)'],
    damageDealt: {
      playersKilled: 23,
      basesRaided: 31,
      itemsStolen: 'ca. 400.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 45,
      totalRefunded: '180.000 Coins',
      itemsRestored: true
    },
    previousBans: 0,
    playtimeBeforeBan: '89h 23m',
    faction: 'Vorgaroth',
    level: 51,
    notes: 'Systematisches Ausrauben von Solo-Spielern.'
  },
  // Weitere Cheater-Einträge
  {
    id: 'BL-2024-0839',
    steamId: '76561198333222111',
    steamName: 'HackGodRussia',
    steamAvatar: '🇷🇺',
    banDate: '2024-12-08T08:00:00',
    cheatType: 'Aimbot + Speedhack',
    cheatDetails: 'Kombination aus automatischem Zielen und erhöhter Bewegungsgeschwindigkeit',
    detectionMethod: 'EAC + Server Anti-Cheat',
    evidence: ['EAC-Detection', 'Server-Logs', 'Spieler-Reports (31)'],
    damageDealt: {
      playersKilled: 234,
      basesRaided: 15,
      itemsStolen: 'ca. 600.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 89,
      totalRefunded: '350.000 Coins',
      itemsRestored: true
    },
    previousBans: 7,
    playtimeBeforeBan: '8h 15m',
    faction: 'Vorgaroth',
    level: 19,
    notes: '8. Ban! VPN und Account-Sharing detektiert. Hardware-ID + IP-Range gebannt.'
  },
  {
    id: 'BL-2024-0838',
    steamId: '76561198666777888',
    steamName: 'InfiniteAmmo_Pro',
    steamAvatar: '🔫',
    banDate: '2024-12-07T19:30:00',
    cheatType: 'Infinite Ammo Exploit',
    cheatDetails: 'Ausnutzung eines Bugs für unbegrenzte Munition',
    detectionMethod: 'Economy-Monitoring',
    evidence: ['Inventar-Logs', 'Munitionsverbrauch-Analyse', 'Video-Beweis'],
    damageDealt: {
      playersKilled: 67,
      basesRaided: 4,
      itemsStolen: 'ca. 50.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 28,
      totalRefunded: '40.000 Coins',
      itemsRestored: false
    },
    previousBans: 0,
    playtimeBeforeBan: '45h 30m',
    faction: 'Seraphar',
    level: 38,
    notes: 'Bug wurde nach Entdeckung innerhalb von 2 Stunden gepatcht.'
  },
  {
    id: 'BL-2024-0837',
    steamId: '76561198999111222',
    steamName: 'TeleportHacker',
    steamAvatar: '⚡',
    banDate: '2024-12-06T12:45:00',
    cheatType: 'Teleport Hack',
    cheatDetails: 'Teleportation zu beliebigen Koordinaten auf der Karte',
    detectionMethod: 'Server Anti-Cheat',
    evidence: ['Positions-Logs', 'Unmögliche Bewegungsmuster', 'Admin-Beobachtung'],
    damageDealt: {
      playersKilled: 45,
      basesRaided: 22,
      itemsStolen: 'ca. 350.000 Scrap Wert'
    },
    compensation: {
      playersCompensated: 42,
      totalRefunded: '200.000 Coins',
      itemsRestored: true
    },
    previousBans: 1,
    playtimeBeforeBan: '28h 12m',
    faction: 'Vorgaroth',
    level: 25,
    notes: 'Teleportierte direkt in verschlossene Basen. Schwerer Exploit.'
  },
  {
    id: 'BL-2024-0836',
    steamId: '76561198444333222',
    steamName: 'GodMode_Aktiv',
    steamAvatar: '🛡️',
    banDate: '2024-12-05T16:20:00',
    cheatType: 'God Mode / Invincibility',
    cheatDetails: 'Unverwundbarkeit durch externe Manipulation',
    detectionMethod: 'Damage-Log Analyse',
    evidence: ['Keine Damage-Registrierung', 'Spieler-Reports (45)', 'Video-Beweis'],
    damageDealt: {
      playersKilled: 312,
      basesRaided: 28,
      itemsStolen: 'ca. 1.000.000+ Scrap Wert'
    },
    compensation: {
      playersCompensated: 156,
      totalRefunded: '500.000 Coins',
      itemsRestored: true
    },
    previousBans: 3,
    playtimeBeforeBan: '15h 45m',
    faction: 'Seraphar',
    level: 22,
    notes: 'Einer der schlimmsten Fälle. Hardware-ID permanent gebannt.'
  },
  {
    id: 'BL-2024-0835',
    steamId: '76561198777666555',
    steamName: 'ResourceSpawner',
    steamAvatar: '💎',
    banDate: '2024-12-04T10:00:00',
    cheatType: 'Item Spawn Exploit',
    cheatDetails: 'Spawnen von Items durch Server-Exploit',
    detectionMethod: 'Economy-Monitoring',
    evidence: ['Inventar-Anomalie', 'Keine Craft-/Farm-History', 'Admin-Untersuchung'],
    damageDealt: {
      playersKilled: 0,
      basesRaided: 0,
      itemsStolen: 'Gespawnte Items im Wert von 2.000.000+ Scrap'
    },
    compensation: {
      playersCompensated: 0,
      totalRefunded: '0 Coins',
      itemsRestored: false
    },
    previousBans: 0,
    playtimeBeforeBan: '200h 00m',
    faction: 'Vorgaroth',
    level: 78,
    notes: 'Langjähriger Spieler, der Exploit entdeckt und ausgenutzt hat. Alle Items entfernt.'
  },
  {
    id: 'BL-2024-0834',
    steamId: '76561198888999000',
    steamName: 'AutoClicker_Pro',
    steamAvatar: '🖱️',
    banDate: '2024-12-03T14:30:00',
    cheatType: 'Auto-Clicker / Macro',
    cheatDetails: 'Automatisches Klicken für Farming und Crafting',
    detectionMethod: 'Verhaltensanalyse',
    evidence: ['Unnatürliche Klickmuster', '24/7 Aktivität', 'Keine Pausen'],
    damageDealt: {
      playersKilled: 0,
      basesRaided: 0,
      itemsStolen: 'Unfaire Ressourcen-Vorteile'
    },
    compensation: {
      playersCompensated: 0,
      totalRefunded: '0 Coins',
      itemsRestored: false
    },
    previousBans: 0,
    playtimeBeforeBan: '312h 45m',
    faction: 'Seraphar',
    level: 92,
    notes: '7-Tage Ban, kein Permanent wegen geringem Schaden. Bei Wiederholung Permanent.'
  },
]

// Statistics
const STATS = {
  totalBanned: 847,
  thisMonth: 34,
  thisWeek: 14,
  compensationPaid: '4.2M Coins',
  playersProtected: 24567,
  detectionRate: '99.8%'
}

const CHEAT_TYPES = [
  'Alle', 'Aimbot', 'ESP / Wallhack', 'Speedhack', 'No Recoil', 
  'Item Duplication', 'Radar Hack', 'Silent Aim', 'Fly Hack'
]

export default function BlacklistPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCheatType, setSelectedCheatType] = useState('Alle')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'damage'>('date')

  const filteredData = BLACKLIST_DATA
    .filter(entry => {
      const matchesSearch = 
        entry.steamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.steamId.includes(searchQuery) ||
        entry.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedCheatType === 'Alle' || 
        entry.cheatType.toLowerCase().includes(selectedCheatType.toLowerCase())
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.banDate).getTime() - new Date(a.banDate).getTime()
      }
      return b.damageDealt.playersKilled - a.damageDealt.playersKilled
    })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCheatColor = (cheatType: string) => {
    if (cheatType.includes('Aimbot')) return 'text-red-400 bg-red-500/10 border-red-500/30'
    if (cheatType.includes('ESP') || cheatType.includes('Wallhack')) return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    if (cheatType.includes('Speed')) return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    if (cheatType.includes('Recoil')) return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    if (cheatType.includes('Duplication')) return 'text-green-400 bg-green-500/10 border-green-500/30'
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  }

  return (
    <EldrunPageShell
      icon={Skull}
      badge="BLACKLIST"
      title="CHEATER BLACKLIST"
      subtitle="ZERO TOLERANCE"
      description={`${STATS.totalBanned} permanent gebannte Cheater. ${STATS.compensationPaid} Entschädigung ausgezahlt. ${STATS.detectionRate} Erkennungsrate.`}
      gradient="from-red-400 via-red-500 to-red-700"
      glowColor="rgba(239,68,68,0.22)"
    >
      <AuthGate>
      <div>
        {/* Zero Tolerance Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-red-950/50 to-black border border-red-900/50 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gavel className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white mb-2">
                ⚖️ ZERO TOLERANCE POLICY
              </h2>
              <p className="text-metal-400 mb-4">
                Bei Eldrun gilt eine strikte Null-Toleranz-Politik gegenüber Cheatern. 
                <span className="text-red-400 font-bold"> Es gibt keine Verwarnungen, keine zweiten Chancen, keine Ausnahmen.</span>
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-red-400">
                  <Ban className="w-4 h-4" />
                  <span>Permanent Ban bei 1. Verstoß</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <FileWarning className="w-4 h-4" />
                  <span>Öffentliche Listung auf Blacklist</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <Scale className="w-4 h-4" />
                  <span>Entschädigung für Geschädigte</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
            <input
              type="text"
              placeholder="Suche nach Steam-ID, Name oder Ban-ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-red-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCheatType}
              onChange={(e) => setSelectedCheatType(e.target.value)}
              className="px-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white focus:outline-none focus:border-red-500"
            >
              {CHEAT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'damage' : 'date')}
              className="px-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white hover:border-red-500 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {sortBy === 'date' ? 'Nach Datum' : 'Nach Schaden'}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-metal-500 mb-4">
          {filteredData.length} Cheater gefunden
        </p>

        {/* Blacklist Entries */}
        <div className="space-y-4">
          {filteredData.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-metal-900/50 border border-red-900/30 rounded-xl overflow-hidden hover:border-red-500/50 transition-all"
            >
              {/* Main Row */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar & Status */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-red-900/30 rounded-xl flex items-center justify-center text-3xl border border-red-500/30">
                      {entry.steamAvatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <Ban className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-lg">{entry.steamName}</h3>
                      <span className="text-xs font-mono text-red-400 bg-red-900/30 px-2 py-0.5 rounded">
                        {entry.id}
                      </span>
                    </div>
                    <p className="text-metal-500 text-sm font-mono">{entry.steamId}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCheatColor(entry.cheatType)}`}>
                        {entry.cheatType}
                      </span>
                      <span className="text-metal-500 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.banDate)}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-red-400 font-bold">{entry.damageDealt.playersKilled}</p>
                      <p className="text-metal-500 text-xs">Kills</p>
                    </div>
                    <div className="text-center">
                      <p className="text-orange-400 font-bold">{entry.damageDealt.basesRaided}</p>
                      <p className="text-metal-500 text-xs">Raids</p>
                    </div>
                    <div className="text-center">
                      <p className="text-amber-400 font-bold">{entry.previousBans}</p>
                      <p className="text-metal-500 text-xs">Vorherige</p>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button className="p-2 text-metal-400 hover:text-white transition-colors">
                    {expandedEntry === entry.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedEntry === entry.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-red-900/30 mt-2">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Cheat Details */}
                        <div className="p-4 bg-red-900/20 rounded-lg border border-red-900/30">
                          <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Cheat-Details
                          </h4>
                          <p className="text-metal-400 text-sm mb-2">{entry.cheatDetails}</p>
                          <p className="text-metal-500 text-xs">
                            Erkennung: <span className="text-white">{entry.detectionMethod}</span>
                          </p>
                        </div>

                        {/* Damage Caused */}
                        <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-900/30">
                          <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                            <Flame className="w-4 h-4" />
                            Verursachter Schaden
                          </h4>
                          <ul className="text-sm text-metal-400 space-y-1">
                            <li>• {entry.damageDealt.playersKilled} Spieler getötet</li>
                            <li>• {entry.damageDealt.basesRaided} Basen geraided</li>
                            <li>• {entry.damageDealt.itemsStolen}</li>
                          </ul>
                        </div>

                        {/* Compensation */}
                        <div className="p-4 bg-green-900/20 rounded-lg border border-green-900/30">
                          <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            Entschädigung
                          </h4>
                          <ul className="text-sm text-metal-400 space-y-1">
                            <li>• {entry.compensation.playersCompensated} Spieler entschädigt</li>
                            <li>• {entry.compensation.totalRefunded} ausgezahlt</li>
                            <li>• Items wiederhergestellt: {entry.compensation.itemsRestored ? '✅' : '❌'}</li>
                          </ul>
                        </div>

                        {/* Evidence */}
                        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-900/30">
                          <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Beweise
                          </h4>
                          <ul className="text-sm text-metal-400 space-y-1">
                            {entry.evidence.map((ev, i) => (
                              <li key={i}>• {ev}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Player Info */}
                        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-900/30">
                          <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Spieler-Info
                          </h4>
                          <ul className="text-sm text-metal-400 space-y-1">
                            <li>• Fraktion: <span className="text-white">{entry.faction}</span></li>
                            <li>• Level: <span className="text-white">{entry.level}</span></li>
                            <li>• Spielzeit: <span className="text-white">{entry.playtimeBeforeBan}</span></li>
                            <li>• Vorherige Bans: <span className="text-red-400">{entry.previousBans}</span></li>
                          </ul>
                        </div>

                        {/* Notes */}
                        <div className="p-4 bg-metal-800/50 rounded-lg border border-metal-700">
                          <h4 className="font-bold text-metal-300 mb-2 flex items-center gap-2">
                            <FileWarning className="w-4 h-4" />
                            Admin-Notizen
                          </h4>
                          <p className="text-metal-400 text-sm">{entry.notes}</p>
                        </div>
                      </div>

                      {/* Steam Profile Link */}
                      <div className="mt-4 flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                        <span className="text-metal-400 text-sm font-mono">
                          Steam Profil: https://steamcommunity.com/profiles/{entry.steamId}
                        </span>
                        <a
                          href={`https://steamcommunity.com/profiles/${entry.steamId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-metal-700 hover:bg-metal-600 rounded-lg text-sm text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Profil öffnen
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Report CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-gradient-to-r from-red-950/30 to-purple-950/30 border border-red-500/30 rounded-xl text-center"
        >
          <Crosshair className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-white mb-2">
            Cheater melden?
          </h3>
          <p className="text-metal-400 mb-4 max-w-xl mx-auto">
            Du hast einen Verdacht oder Beweise? Melde verdächtige Spieler und hilf uns, 
            Eldrun sauber zu halten. Bestätigte Meldungen werden belohnt!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://discord.gg/eldrun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              Cheater melden
            </a>
            <a
              href="/forum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-metal-700 hover:bg-metal-600 text-white font-bold rounded-lg transition-colors"
            >
              <Award className="w-5 h-5" />
              Forum besuchen
            </a>
          </div>
        </motion.div>

        {/* Legal Note */}
        <div className="mt-8 p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
          <p className="text-metal-500 text-xs">
            <Shield className="w-4 h-4 inline mr-1" />
            Alle angezeigten Informationen sind öffentlich zugänglich (Steam-ID, Steam-Name, Steam-Profil). 
            Die Blacklist dient dem Schutz der Community und der Transparenz unserer Anti-Cheat-Maßnahmen.
            Datenschutzrechtlich geschützte Informationen werden nicht veröffentlicht.
          </p>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
