'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Trophy, Sword, Shield, Crown, Star,
  Search, Filter, ChevronRight, Medal, Target,
  Flame, Zap, Heart, Plus, ExternalLink, Settings
} from 'lucide-react'
import Link from 'next/link'
import { ClanApplicationModal, ClanData, ClanRecruitmentSettings, ClanApplication } from '@/components/clans/ClanApplicationModal'
import { ClanSettingsModal } from '@/components/clans/ClanSettingsModal'
import { useStore } from '@/store/useStore'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

// Extended Clan interface with recruitment settings
interface Clan extends ClanData {
  recruitmentSettings?: ClanRecruitmentSettings
}

// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN GILDEN & CLANS - Die mächtigsten Organisationen
// ═══════════════════════════════════════════════════════════════════════════

const CLANS: Clan[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TOP TIER GILDEN - Die Elite
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: '1',
    name: 'Phoenix Rising',
    tag: 'PHX',
    logo: '🔥',
    faction: 'seraphar',
    level: 25,
    members: 48,
    maxMembers: 50,
    kills: 28456,
    wars: { won: 45, lost: 8 },
    founded: '2024-01-10',
    leader: 'PhoenixQueen',
    description: 'Die #1 Gilde auf Eldrun! Aus der Asche geboren, zum Sieg bestimmt. 45 Gildenkriege gewonnen, 12 Territorien kontrolliert.',
    recruiting: true,
    requirements: 'Level 60+, K/D 3.0+, Discord & Mic Pflicht, Daily Active',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 60,
      minKD: 3.0,
      minPlaytime: 200,
      minCoins: 25000,
      requiredClass: [],
      requiredFaction: 'seraphar',
      autoAccept: false,
      requireDiscord: true,
      requireMic: true,
      customQuestions: ['Warum sollten wir dich aufnehmen?', 'Was kannst du der Gilde bieten?', 'Wie viele Stunden spielst du pro Woche?'],
      welcomeMessage: 'Willkommen bei Phoenix Rising! 🔥 Du bist jetzt Teil der Elite!'
    }
  },
  {
    id: '2',
    name: 'Iron Legion',
    tag: 'IRON',
    logo: '🛡️',
    faction: 'vorgaroth',
    level: 23,
    members: 45,
    maxMembers: 50,
    kills: 24789,
    wars: { won: 38, lost: 12 },
    founded: '2024-01-15',
    leader: 'IronCommander',
    description: 'Unzerbrechlich wie Stahl! Die mächtigste Vorgaroth-Gilde mit 10 Territorien und der stärksten Defense auf dem Server.',
    recruiting: true,
    requirements: 'Level 50+, K/D 2.5+, Tank/Paladin bevorzugt',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 50,
      minKD: 2.5,
      minPlaytime: 150,
      minCoins: 15000,
      requiredClass: ['warrior', 'paladin'],
      requiredFaction: 'vorgaroth',
      autoAccept: false,
      requireDiscord: true,
      requireMic: true,
      customQuestions: ['Beschreibe deine Defense-Erfahrung'],
      welcomeMessage: 'Willkommen in der Iron Legion! Stahl bricht nicht! 🛡️'
    }
  },
  {
    id: '3',
    name: 'Dragons of Chaos',
    tag: 'DoC',
    logo: '🐉',
    faction: 'vorgaroth',
    level: 22,
    members: 42,
    maxMembers: 50,
    kills: 22456,
    wars: { won: 35, lost: 15 },
    founded: '2024-01-20',
    leader: 'DragonSlayer',
    description: 'Die älteste und legendärste Gilde auf ELDRUN! Wir dominieren seit Tag 1 und haben 3 Fraktionskriege gewonnen.',
    recruiting: true,
    requirements: 'Level 50+, K/D 2.0+, Discord Pflicht',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 50,
      minKD: 2.0,
      minPlaytime: 100,
      minCoins: 10000,
      requiredClass: [],
      requiredFaction: 'vorgaroth',
      autoAccept: false,
      requireDiscord: true,
      requireMic: true,
      customQuestions: ['Warum willst du den Dragons beitreten?', 'Wie viele Stunden spielst du pro Woche?'],
      welcomeMessage: 'Willkommen bei den Dragons of Chaos! 🐉 Feuer und Blut!'
    }
  },
  {
    id: '4',
    name: 'Knights of Light',
    tag: 'KoL',
    logo: '⚔️',
    faction: 'seraphar',
    level: 20,
    members: 38,
    maxMembers: 45,
    kills: 19876,
    wars: { won: 32, lost: 14 },
    founded: '2024-01-25',
    leader: 'SirLancelot',
    description: 'Für Ehre und Ruhm! Die Elite-Ritter der Seraphar Fraktion. Bekannt für taktische Kriegsführung.',
    recruiting: false
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MID TIER GILDEN - Aufstrebende Macht
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: '5',
    name: 'Shadow Clan',
    tag: 'SDW',
    logo: '🌑',
    faction: 'vorgaroth',
    level: 18,
    members: 35,
    maxMembers: 40,
    kills: 17654,
    wars: { won: 28, lost: 16 },
    founded: '2024-02-01',
    leader: 'ShadowMaster',
    description: 'Wir operieren im Verborgenen. Spezialisiert auf Guerilla-Taktiken, Hinterhalte und Assassinierungen.',
    recruiting: true,
    requirements: 'Level 40+, Rogue/Assassin bevorzugt',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 40,
      minKD: 2.0,
      minPlaytime: 80,
      minCoins: 8000,
      requiredClass: ['rogue'],
      requiredFaction: 'vorgaroth',
      autoAccept: false,
      requireDiscord: true,
      requireMic: false,
      customQuestions: ['Beschreibe deinen Spielstil'],
      welcomeMessage: 'Die Schatten heißen dich willkommen... 🌑'
    }
  },
  {
    id: '6',
    name: 'Night Watch',
    tag: 'NTW',
    logo: '🦉',
    faction: 'seraphar',
    level: 16,
    members: 32,
    maxMembers: 40,
    kills: 15234,
    wars: { won: 24, lost: 18 },
    founded: '2024-02-10',
    leader: 'NightOwl',
    description: 'Die Wächter der Nacht! Wir spielen hauptsächlich nachts (23-06 Uhr) und dominieren die Nachtschicht.',
    recruiting: true,
    requirements: 'Level 35+, Nachtaktiv',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 35,
      minKD: 1.5,
      minPlaytime: 60,
      minCoins: 5000,
      requiredClass: [],
      requiredFaction: 'seraphar',
      autoAccept: true,
      requireDiscord: true,
      requireMic: true,
      customQuestions: ['Zu welchen Zeiten bist du online?'],
      welcomeMessage: 'Die Nacht gehört uns! 🦉'
    }
  },
  {
    id: '7',
    name: 'Blood Raiders',
    tag: 'BLD',
    logo: '💀',
    faction: 'vorgaroth',
    level: 15,
    members: 28,
    maxMembers: 35,
    kills: 13456,
    wars: { won: 21, lost: 19 },
    founded: '2024-02-15',
    leader: 'BloodMoon',
    description: 'Hardcore PvP Gilde! Wir leben für den Kampf und das Raiden. Tägliche Raids garantiert.',
    recruiting: true,
    requirements: 'Level 35+, PvP-fokussiert',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 35,
      minKD: 2.0,
      minPlaytime: 70,
      minCoins: 5000,
      requiredClass: [],
      requiredFaction: 'vorgaroth',
      autoAccept: false,
      requireDiscord: true,
      requireMic: true,
      customQuestions: ['Wie viele Raids hast du diese Woche gemacht?'],
      welcomeMessage: 'Blut für den Blutgott! 💀'
    }
  },
  {
    id: '8',
    name: 'Storm Breakers',
    tag: 'STM',
    logo: '⚡',
    faction: 'seraphar',
    level: 14,
    members: 25,
    maxMembers: 35,
    kills: 11234,
    wars: { won: 18, lost: 17 },
    founded: '2024-02-20',
    leader: 'StormRider',
    description: 'Schnell wie der Blitz! Spezialisiert auf schnelle Raids und Counter-Attacks.',
    recruiting: true,
    requirements: 'Level 30+, Schnelle Reaktionszeit',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 30,
      minKD: 1.5,
      minPlaytime: 50,
      minCoins: 3000,
      requiredClass: [],
      requiredFaction: 'seraphar',
      autoAccept: true,
      requireDiscord: true,
      requireMic: false,
      customQuestions: [],
      welcomeMessage: 'Willkommen bei den Storm Breakers! ⚡'
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AUFSTREBENDE GILDEN - Neue Macht
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: '9',
    name: 'Dark Council',
    tag: 'DRK',
    logo: '�️',
    faction: 'vorgaroth',
    level: 12,
    members: 22,
    maxMembers: 30,
    kills: 9876,
    wars: { won: 14, lost: 16 },
    founded: '2024-03-01',
    leader: 'DarkMage',
    description: 'Wissen ist Macht. Die Magier-Gilde von Vorgaroth. Spezialisiert auf AoE-Schaden und Kontrolle.',
    recruiting: true,
    requirements: 'Magier-Klasse, Level 25+',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 25,
      minKD: 1.0,
      minPlaytime: 40,
      minCoins: 3000,
      requiredClass: ['mage', 'necromancer'],
      requiredFaction: 'vorgaroth',
      autoAccept: false,
      requireDiscord: true,
      requireMic: false,
      customQuestions: ['Welche Magie-Spezialisierung bevorzugst du?'],
      welcomeMessage: 'Wissen ist Macht. Willkommen im Dark Council. 👁️'
    }
  },
  {
    id: '10',
    name: 'Golden Eagles',
    tag: 'GLD',
    logo: '🦅',
    faction: 'seraphar',
    level: 11,
    members: 20,
    maxMembers: 30,
    kills: 8234,
    wars: { won: 12, lost: 14 },
    founded: '2024-03-10',
    leader: 'EagleEye',
    description: 'Archer-spezialisierte Gilde! Wir kontrollieren das Schlachtfeld aus der Distanz.',
    recruiting: true,
    requirements: 'Archer-Klasse bevorzugt, Level 25+',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 25,
      minKD: 1.5,
      minPlaytime: 30,
      minCoins: 2000,
      requiredClass: ['archer'],
      requiredFaction: 'seraphar',
      autoAccept: true,
      requireDiscord: false,
      requireMic: false,
      customQuestions: [],
      welcomeMessage: 'Fliege hoch mit den Golden Eagles! 🦅'
    }
  },
  {
    id: '11',
    name: 'Void Walkers',
    tag: 'VWK',
    logo: '🌀',
    faction: 'vorgaroth',
    level: 10,
    members: 18,
    maxMembers: 25,
    kills: 7123,
    wars: { won: 10, lost: 12 },
    founded: '2024-03-15',
    leader: 'VoidMaster',
    description: 'Wir wandeln zwischen den Welten. Necromancer-fokussierte Gilde mit dunkler Magie.',
    recruiting: true,
    requirements: 'Necromancer bevorzugt, Level 20+',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 20,
      minKD: 1.0,
      minPlaytime: 25,
      minCoins: 1500,
      requiredClass: ['necromancer'],
      requiredFaction: 'vorgaroth',
      autoAccept: true,
      requireDiscord: false,
      requireMic: false,
      customQuestions: [],
      welcomeMessage: 'Willkommen in der Leere... 🌀'
    }
  },
  {
    id: '12',
    name: 'Frost Giants',
    tag: 'FST',
    logo: '❄️',
    faction: 'seraphar',
    level: 9,
    members: 16,
    maxMembers: 25,
    kills: 6234,
    wars: { won: 8, lost: 11 },
    founded: '2024-03-20',
    leader: 'FrostKing',
    description: 'Die Kälte macht uns stark! Paladin-fokussierte Gilde mit Fokus auf Heilung und Schutz.',
    recruiting: true,
    requirements: 'Paladin bevorzugt, Level 20+',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 20,
      minKD: 0,
      minPlaytime: 20,
      minCoins: 1000,
      requiredClass: ['paladin'],
      requiredFaction: 'seraphar',
      autoAccept: true,
      requireDiscord: false,
      requireMic: false,
      customQuestions: [],
      welcomeMessage: 'Winter is coming! ❄️'
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CASUAL & NEUE GILDEN - Für Einsteiger
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: '13',
    name: 'Merchant Alliance',
    tag: 'MRC',
    logo: '💰',
    faction: 'seraphar',
    level: 8,
    members: 24,
    maxMembers: 40,
    kills: 4567,
    wars: { won: 5, lost: 8 },
    founded: '2024-04-01',
    leader: 'GoldMaster',
    description: 'Die Händler-Allianz! Wir kontrollieren die Wirtschaft und bieten Trading-Services für alle.',
    recruiting: true,
    requirements: 'Keine! Jeder ist willkommen',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 1,
      minKD: 0,
      minPlaytime: 0,
      minCoins: 0,
      requiredClass: [],
      requiredFaction: 'seraphar',
      autoAccept: true,
      requireDiscord: false,
      requireMic: false,
      customQuestions: [],
      welcomeMessage: 'Willkommen in der Händler-Allianz! Zeit, reich zu werden! 💰'
    }
  },
  {
    id: '14',
    name: 'Newbie Haven',
    tag: 'NEW',
    logo: '🌟',
    faction: 'seraphar',
    level: 5,
    members: 35,
    maxMembers: 50,
    kills: 2345,
    wars: { won: 2, lost: 5 },
    founded: '2024-04-15',
    leader: 'HelpfulVet',
    description: 'Die Gilde für neue Spieler! Wir helfen beim Einstieg und erklären alle Systeme.',
    recruiting: true,
    requirements: 'Neue Spieler willkommen!',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 1,
      minKD: 0,
      minPlaytime: 0,
      minCoins: 0,
      requiredClass: [],
      requiredFaction: null,
      autoAccept: true,
      requireDiscord: false,
      requireMic: false,
      customQuestions: [],
      welcomeMessage: 'Willkommen auf Eldrun! Wir helfen dir beim Start! 🌟'
    }
  },
  {
    id: '15',
    name: 'Roleplay Kingdom',
    tag: 'RPK',
    logo: '🎭',
    faction: 'vorgaroth',
    level: 7,
    members: 18,
    maxMembers: 30,
    kills: 1234,
    wars: { won: 3, lost: 4 },
    founded: '2024-04-20',
    leader: 'RoleplayKing',
    description: 'Immersives Roleplay auf Eldrun! Eigene Storylines, Events und Charakter-Entwicklung.',
    recruiting: true,
    requirements: 'RP-Interesse, kreativ',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 10,
      minKD: 0,
      minPlaytime: 10,
      minCoins: 500,
      requiredClass: [],
      requiredFaction: null,
      autoAccept: true,
      requireDiscord: true,
      requireMic: true,
      customQuestions: ['Beschreibe deinen Charakter-Hintergrund'],
      welcomeMessage: 'Willkommen im Roleplay Kingdom! Lass uns Geschichten erzählen! 🎭'
    }
  },
  {
    id: '16',
    name: 'Builder Collective',
    tag: 'BLD',
    logo: '🏗️',
    faction: 'seraphar',
    level: 6,
    members: 15,
    maxMembers: 25,
    kills: 876,
    wars: { won: 1, lost: 3 },
    founded: '2024-05-01',
    leader: 'ArchitectPro',
    description: 'Die Builder-Gilde! Wir bauen die beeindruckendsten Strukturen auf Eldrun.',
    recruiting: true,
    requirements: 'Bau-Interesse',
    recruitmentSettings: {
      isOpen: true,
      minLevel: 5,
      minKD: 0,
      minPlaytime: 5,
      minCoins: 0,
      requiredClass: [],
      requiredFaction: null,
      autoAccept: true,
      requireDiscord: false,
      requireMic: false,
      customQuestions: [],
      welcomeMessage: 'Willkommen im Builder Collective! Zeit zu bauen! 🏗️'
    }
  }
]

const FACTION_COLORS = {
  seraphar: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  vorgaroth: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' }
}

export default function ClansPage() {
  const { currentUser } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [factionFilter, setFactionFilter] = useState<string>('all')
  const [recruitingOnly, setRecruitingOnly] = useState(false)
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [applications, setApplications] = useState<ClanApplication[]>([])

  // Check if current user is a clan leader
  const isLeader = (clanLeader: string) => {
    return currentUser?.username === clanLeader
  }

  const handleApply = (clan: Clan) => {
    setSelectedClan(clan)
    setShowApplicationModal(true)
  }

  const handleSettings = (clan: Clan) => {
    setSelectedClan(clan)
    setShowSettingsModal(true)
  }

  const handleApplicationSubmit = (application: ClanApplication) => {
    setApplications(prev => [...prev, application])
    // console.log('Application submitted:', application)
    // In a real app, this would send to API
  }

  const handleSettingsSave = (settings: ClanRecruitmentSettings) => {
    // console.log('Settings saved:', settings)
    setShowSettingsModal(false)
    // In a real app, this would update via API
  }

  const filteredClans = CLANS.filter(clan => {
    const matchesSearch = clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clan.tag.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFaction = factionFilter === 'all' || clan.faction === factionFilter
    const matchesRecruiting = !recruitingOnly || clan.recruiting
    return matchesSearch && matchesFaction && matchesRecruiting
  })

  const totalMembers = CLANS.reduce((acc, c) => acc + c.members, 0)
  const totalKills = CLANS.reduce((acc, c) => acc + c.kills, 0)

  return (
    <EldrunPageShell
      icon={Users}
      badge="GILDEN"
      title="GILDEN & CLANS"
      subtitle="SCHLIESSE DICH AN"
      description={`Schließe dich einer mächtigen Gilde an oder gründe deine eigene! ${CLANS.length} Gilden mit ${totalMembers} Mitgliedern und ${totalKills.toLocaleString()} Kills.`}
      gradient="from-amber-300 via-amber-400 to-amber-600"
      glowColor="rgba(245,158,11,0.22)"
    >
      <AuthGate>
      <div>
        {/* Faction Showcase */}
        <h2 className="font-display text-2xl font-bold text-white mb-6 text-center">DIE FRAKTIONEN</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* SERAPHAR */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-metal-900"
          >
            <div className="absolute inset-0 opacity-30">
              <Image
                src="/images/factions/seraphar-banner.png"
                alt="SERAPHAR"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="relative p-6 flex items-center gap-6">
              <Image
                src="/images/factions/seraphar-logo.png"
                alt="SERAPHAR Logo"
                width={96}
                height={96}
                className="w-24 h-24 object-contain drop-shadow-2xl"
                priority
              />
              <div>
                <h3 className="font-display text-2xl font-black text-amber-400 mb-2">SERAPHAR</h3>
                <p className="text-metal-300 text-sm mb-3">Die Hüter des Lichts. Ehre, Stärke und Einheit führen zum Sieg.</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-amber-400">🦁 Der goldene Löwe</span>
                  <span className="text-metal-500">|</span>
                  <span className="text-metal-400">{CLANS.filter(c => c.faction === 'seraphar').length} Gilden</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* VORGAROTH */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-metal-900"
          >
            <div className="absolute inset-0 opacity-30">
              <Image
                src="/images/factions/vorgaroth-banner.png"
                alt="VORGAROTH"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="relative p-6 flex items-center gap-6">
              <Image
                src="/images/factions/vorgaroth-logo.png"
                alt="VORGAROTH Logo"
                width={96}
                height={96}
                className="w-24 h-24 object-contain drop-shadow-2xl"
                priority
              />
              <div>
                <h3 className="font-display text-2xl font-black text-red-400 mb-2">VORGAROTH</h3>
                <p className="text-metal-300 text-sm mb-3">Die Macht der Drachen. Stärke durch Blut und Feuer.</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-red-400">🐉 Der Feuerdrache</span>
                  <span className="text-metal-500">|</span>
                  <span className="text-metal-400">{CLANS.filter(c => c.faction === 'vorgaroth').length} Gilden</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Users className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{CLANS.length}</p>
            <p className="text-metal-500 text-sm">Aktive Gilden</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalMembers}</p>
            <p className="text-metal-500 text-sm">Gildenmitglieder</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Sword className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalKills.toLocaleString()}</p>
            <p className="text-metal-500 text-sm">Gilden-Kills</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{CLANS.filter(c => c.recruiting).length}</p>
            <p className="text-metal-500 text-sm">Rekrutieren</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
            <input
              type="text"
              placeholder="Gilde suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={factionFilter}
              onChange={(e) => setFactionFilter(e.target.value)}
              className="px-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Alle Fraktionen</option>
              <option value="seraphar">Seraphar</option>
              <option value="vorgaroth">Vorgaroth</option>
            </select>
            <button
              onClick={() => setRecruitingOnly(!recruitingOnly)}
              className={`px-4 py-3 rounded-xl font-bold transition-colors ${
                recruitingOnly 
                  ? 'bg-green-600 text-white' 
                  : 'bg-metal-900 border border-metal-700 text-metal-400'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Clan CTA */}
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-900/30 to-rust-900/30 border border-amber-500/30 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg mb-1">Eigene Gilde gründen?</h3>
            <p className="text-metal-400">Erreiche Level 30 und gründe deine eigene Gilde!</p>
          </div>
          <Link
            href="/forum/new?category=clans"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Gilde gründen
          </Link>
        </div>

        {/* Clans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClans.map((clan, index) => {
            const factionColor = FACTION_COLORS[clan.faction]
            return (
              <motion.div
                key={clan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-metal-900/50 border border-metal-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all group"
              >
                {/* Header */}
                <div className={`p-4 ${factionColor.bg} border-b ${factionColor.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{clan.logo}</span>
                      <div>
                        <h3 className="font-bold text-white text-lg">{clan.name}</h3>
                        <span className={`text-sm font-mono ${factionColor.text}`}>[{clan.tag}]</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span className="text-white font-bold">Lvl {clan.level}</span>
                      </div>
                      {clan.recruiting && (
                        <span className="text-xs text-green-400">Rekrutiert!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  <p className="text-metal-400 text-sm line-clamp-2">{clan.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-metal-800/50 rounded">
                      <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{clan.members}/{clan.maxMembers}</p>
                    </div>
                    <div className="p-2 bg-metal-800/50 rounded">
                      <Sword className="w-4 h-4 text-red-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{clan.kills.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-metal-800/50 rounded">
                      <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <p className="text-white font-bold text-sm">{clan.wars.won}W</p>
                    </div>
                  </div>

                  {/* Leader */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-metal-500">Leader:</span>
                    <span className="text-amber-400 font-medium">{clan.leader}</span>
                  </div>

                  {/* Requirements */}
                  {clan.requirements && (
                    <div className="p-2 bg-metal-800/50 rounded text-xs text-metal-400">
                      <span className="text-metal-500">Voraussetzungen:</span> {clan.requirements}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/forum/board/clans?clan=${clan.id}`}
                      className="flex-1 py-2 bg-metal-800 hover:bg-metal-700 text-white text-center text-sm font-bold rounded transition-colors"
                    >
                      Profil ansehen
                    </Link>
                    {isLeader(clan.leader) ? (
                      <button 
                        onClick={() => handleSettings(clan)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded transition-colors flex items-center gap-1"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    ) : clan.recruiting && (
                      <button 
                        onClick={() => handleApply(clan)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded transition-colors"
                      >
                        Bewerben
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredClans.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-metal-600 mx-auto mb-4" />
            <p className="text-metal-500">Keine Gilden gefunden.</p>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {showApplicationModal && selectedClan && (
          <ClanApplicationModal
            clan={selectedClan}
            onClose={() => {
              setShowApplicationModal(false)
              setSelectedClan(null)
            }}
            onSubmit={handleApplicationSubmit}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal (for clan leaders) */}
      <AnimatePresence>
        {showSettingsModal && selectedClan && (
          <ClanSettingsModal
            clan={selectedClan}
            onClose={() => {
              setShowSettingsModal(false)
              setSelectedClan(null)
            }}
            onSave={handleSettingsSave}
          />
        )}
      </AnimatePresence>
      </AuthGate>
    </EldrunPageShell>
  )
}
