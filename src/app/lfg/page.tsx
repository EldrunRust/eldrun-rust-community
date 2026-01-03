'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Search, Filter, Clock, MapPin, Crown,
  Shield, Sword, Mic, MicOff, Globe, ChevronDown, X,
  MessageSquare, Star, UserPlus, Check, AlertCircle, Swords
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const PLAYSTYLES = [
  { id: 'pvp', name: 'PvP Fokus', icon: '⚔️', color: 'text-red-400' },
  { id: 'farming', name: 'Farming', icon: '⛏️', color: 'text-amber-400' },
  { id: 'raiding', name: 'Raiding', icon: '💣', color: 'text-orange-400' },
  { id: 'building', name: 'Base Building', icon: '🏰', color: 'text-blue-400' },
  { id: 'roleplay', name: 'Roleplay', icon: '🎭', color: 'text-purple-400' },
  { id: 'casual', name: 'Casual', icon: '🎮', color: 'text-green-400' },
]

const EXPERIENCE_LEVELS = [
  { id: 'beginner', name: 'Anfänger', hours: '0-100h', color: 'text-green-400' },
  { id: 'intermediate', name: 'Fortgeschritten', hours: '100-500h', color: 'text-blue-400' },
  { id: 'advanced', name: 'Erfahren', hours: '500-2000h', color: 'text-purple-400' },
  { id: 'veteran', name: 'Veteran', hours: '2000h+', color: 'text-amber-400' },
]

// LFG Post type definition
interface LFGPost {
  id: string
  author: { name: string; avatar: string; level: string; hours: number; online: boolean }
  title: string
  description: string
  playstyle: string[]
  requirements: { minHours: number; voice: boolean; age: number }
  teamSize: { current: number; max: number }
  createdAt: Date
  responses: number
  featured: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMULIERTE LFG POSTS - Die Suche nach Verbündeten
// ═══════════════════════════════════════════════════════════════════════════

const SIMULATED_POSTS: LFGPost[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FEATURED POSTS - Hervorgehobene Gruppensuchen
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'lfg1', author: { name: 'ShadowHunter', avatar: '⚔️', level: 'veteran', hours: 2500, online: true }, title: 'Suche 2 erfahrene Raider für Clan', description: 'Unser Clan sucht verstärkung für tägliche Raids. Wir sind organisiert und haben Discord. Nur erfahrene Spieler!', playstyle: ['raiding', 'pvp'], requirements: { minHours: 500, voice: true, age: 18 }, teamSize: { current: 8, max: 10 }, createdAt: new Date(Date.now() - 1800000), responses: 12, featured: true },
  { id: 'lfg2', author: { name: 'BuildMaster', avatar: '🏰', level: 'advanced', hours: 800, online: true }, title: 'Base Builder für Mega-Projekt', description: 'Wir bauen die größte Burg auf dem Server! Suche kreative Builder mit Erfahrung im Elektro-System.', playstyle: ['building'], requirements: { minHours: 100, voice: false, age: 0 }, teamSize: { current: 3, max: 5 }, createdAt: new Date(Date.now() - 7200000), responses: 5, featured: true },
  { id: 'lfg3', author: { name: 'PhoenixQueen', avatar: '🔥', level: 'veteran', hours: 3000, online: false }, title: 'Seraphar Fraktion sucht PvP Elite', description: 'Für den nächsten Fraktionskrieg brauchen wir die besten PvPler. K/D 3.0+ erwünscht.', playstyle: ['pvp'], requirements: { minHours: 1000, voice: true, age: 16 }, teamSize: { current: 15, max: 20 }, createdAt: new Date(Date.now() - 14400000), responses: 23, featured: true },
  { id: 'lfg4', author: { name: 'IronLegion', avatar: '🛡️', level: 'veteran', hours: 4200, online: true }, title: '[GILDE] Iron Legion - Top 3 Gilde sucht!', description: 'Die legendäre Iron Legion rekrutiert! Wir sind Top 3 auf dem Server, haben eigenes Castle und suchen ambitionierte Krieger für Gildenkriege.', playstyle: ['pvp', 'raiding'], requirements: { minHours: 800, voice: true, age: 18 }, teamSize: { current: 42, max: 50 }, createdAt: new Date(Date.now() - 900000), responses: 47, featured: true },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PVP FOKUS - Für die Kämpfer
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'lfg5', author: { name: 'VorgarothLord', avatar: '💀', level: 'veteran', hours: 2800, online: true }, title: 'Vorgaroth Elite-Einheit rekrutiert', description: 'Die dunkle Legion braucht Krieger! Tägliche Raids, Fraktionskriege, Territoriumskämpfe. Treue wird belohnt!', playstyle: ['pvp', 'raiding'], requirements: { minHours: 500, voice: true, age: 18 }, teamSize: { current: 12, max: 15 }, createdAt: new Date(Date.now() - 28800000), responses: 18, featured: false },
  { id: 'lfg6', author: { name: 'BloodMoon', avatar: '🌑', level: 'veteran', hours: 3500, online: true }, title: 'Hardcore PvP Squad - Nur die Besten', description: 'Wir dominieren Artifact Islands. Suche Spieler mit 4.0+ K/D und Erfahrung in Gruppenkkämpfen.', playstyle: ['pvp'], requirements: { minHours: 1500, voice: true, age: 21 }, teamSize: { current: 4, max: 5 }, createdAt: new Date(Date.now() - 5400000), responses: 31, featured: false },
  { id: 'lfg7', author: { name: 'StormRider', avatar: '⚡', level: 'advanced', hours: 1800, online: true }, title: 'Arena 2v2 Partner gesucht', description: 'Suche festen Partner für Arena-Kämpfe. Bin Warrior-Main, suche idealerweise Mage oder Archer.', playstyle: ['pvp'], requirements: { minHours: 300, voice: true, age: 0 }, teamSize: { current: 1, max: 2 }, createdAt: new Date(Date.now() - 10800000), responses: 14, featured: false },
  { id: 'lfg8', author: { name: 'NightStalker', avatar: '🗡️', level: 'veteran', hours: 2200, online: false }, title: 'Counter-Raid Team - Schnelle Reaktion', description: 'Wir sind das schnellste Counter-Raid Team auf Eldrun. Suche Spieler die innerhalb von 5 Minuten online sein können.', playstyle: ['pvp', 'raiding'], requirements: { minHours: 600, voice: true, age: 16 }, teamSize: { current: 6, max: 8 }, createdAt: new Date(Date.now() - 36000000), responses: 22, featured: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RAIDING FOKUS - Für die Eroberer
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'lfg9', author: { name: 'DragonSlayer', avatar: '🐉', level: 'advanced', hours: 1200, online: true }, title: 'Duo-Partner für Raids gesucht', description: 'Chill aber ambitioniert. Suche jemanden für abendliche Sessions. Fraktionskriege und Monument-Runs.', playstyle: ['raiding', 'farming'], requirements: { minHours: 200, voice: true, age: 0 }, teamSize: { current: 1, max: 2 }, createdAt: new Date(Date.now() - 3600000), responses: 8, featured: false },
  { id: 'lfg10', author: { name: 'RaidKing', avatar: '💣', level: 'veteran', hours: 2600, online: true }, title: 'Oil Rig Farming Team', description: 'Tägliche Oil Rig und Cargo Runs. Wir haben feste Zeiten (20-23 Uhr) und teilen Loot fair. Suche 2-3 zuverlässige Spieler.', playstyle: ['raiding', 'farming'], requirements: { minHours: 400, voice: true, age: 0 }, teamSize: { current: 3, max: 6 }, createdAt: new Date(Date.now() - 18000000), responses: 19, featured: false },
  { id: 'lfg11', author: { name: 'ExplosiveExpert', avatar: '💥', level: 'advanced', hours: 950, online: false }, title: 'Raid Base Hunters', description: 'Wir räumen jeden Tag eine Raid Base! Suche Spieler die Bock auf PvE-Herausforderungen haben.', playstyle: ['raiding'], requirements: { minHours: 150, voice: false, age: 0 }, teamSize: { current: 2, max: 4 }, createdAt: new Date(Date.now() - 72000000), responses: 11, featured: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CASUAL & FARMING - Für die Entspannten
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'lfg12', author: { name: 'CasualGamer', avatar: '🎮', level: 'intermediate', hours: 350, online: true }, title: 'Entspannte Gruppe für Casual Play', description: 'Kein Stress, kein Drama. Einfach Spaß haben. Anfänger willkommen! Wir helfen beim Einstieg.', playstyle: ['casual', 'farming'], requirements: { minHours: 0, voice: false, age: 0 }, teamSize: { current: 2, max: 6 }, createdAt: new Date(Date.now() - 21600000), responses: 15, featured: false },
  { id: 'lfg13', author: { name: 'FarmBot', avatar: '⛏️', level: 'advanced', hours: 900, online: true }, title: 'Farming Crew für 24/7 Operation', description: 'Wir farmen in Schichten und teilen fair. Suche zuverlässige Spieler für Ressourcen-Farming.', playstyle: ['farming'], requirements: { minHours: 100, voice: false, age: 0 }, teamSize: { current: 4, max: 8 }, createdAt: new Date(Date.now() - 57600000), responses: 7, featured: false },
  { id: 'lfg14', author: { name: 'GreenThumb', avatar: '🌿', level: 'intermediate', hours: 420, online: true }, title: 'Farming & Crafting Gemeinschaft', description: 'Wir sind Crafter und Farmer. Produzieren alles selbst und handeln mit anderen. Entspannte Atmosphäre!', playstyle: ['farming', 'casual'], requirements: { minHours: 50, voice: false, age: 0 }, teamSize: { current: 5, max: 10 }, createdAt: new Date(Date.now() - 86400000), responses: 13, featured: false },
  { id: 'lfg15', author: { name: 'ChillVibes', avatar: '☮️', level: 'beginner', hours: 120, online: true }, title: 'Anfängerfreundliche Gruppe!', description: 'Neu auf Eldrun? Ich auch! Suche andere Neulinge zum gemeinsamen Lernen. Keine Erfahrung nötig, nur gute Laune!', playstyle: ['casual'], requirements: { minHours: 0, voice: false, age: 0 }, teamSize: { current: 1, max: 4 }, createdAt: new Date(Date.now() - 7200000), responses: 28, featured: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BUILDING & ROLEPLAY - Für die Kreativen
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'lfg16', author: { name: 'RoleplayKing', avatar: '🎭', level: 'intermediate', hours: 450, online: false }, title: 'Roleplay Gilde sucht Mitglieder', description: 'Immersives RP auf Eldrun. Wir haben eigene Storylines und Events. Kreative Köpfe gesucht!', playstyle: ['roleplay'], requirements: { minHours: 50, voice: true, age: 16 }, teamSize: { current: 6, max: 12 }, createdAt: new Date(Date.now() - 43200000), responses: 9, featured: false },
  { id: 'lfg17', author: { name: 'ArchitectPro', avatar: '📐', level: 'advanced', hours: 1100, online: true }, title: 'Elite Builder Kollektiv', description: 'Wir bauen die beeindruckendsten Strukturen auf Eldrun. Suche erfahrene Builder für gemeinsame Großprojekte.', playstyle: ['building'], requirements: { minHours: 200, voice: false, age: 0 }, teamSize: { current: 4, max: 8 }, createdAt: new Date(Date.now() - 50400000), responses: 6, featured: false },
  { id: 'lfg18', author: { name: 'TavernKeeper', avatar: '🍺', level: 'intermediate', hours: 380, online: true }, title: 'Die Goldene Taverne sucht Personal!', description: 'Wir betreiben eine RP-Taverne in der Safe Zone! Suche Barkeeper, Wachen und Entertainer für Events.', playstyle: ['roleplay', 'casual'], requirements: { minHours: 0, voice: true, age: 16 }, teamSize: { current: 3, max: 8 }, createdAt: new Date(Date.now() - 28800000), responses: 21, featured: false },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GILDEN & CLANS - Große Organisationen
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'lfg19', author: { name: 'PhoenixRising', avatar: '🦅', level: 'veteran', hours: 3200, online: true }, title: '[TOP GILDE] Phoenix Rising rekrutiert!', description: 'Die #1 Gilde auf Eldrun sucht neue Champions! Eigenes Castle, tägliche Events, 24/7 aktiv. Nur für die Besten!', playstyle: ['pvp', 'raiding'], requirements: { minHours: 1000, voice: true, age: 18 }, teamSize: { current: 48, max: 50 }, createdAt: new Date(Date.now() - 3600000), responses: 67, featured: false },
  { id: 'lfg20', author: { name: 'ShadowClan', avatar: '🌑', level: 'veteran', hours: 2900, online: false }, title: '[GILDE] Shadow Clan - Die Unsichtbaren', description: 'Wir operieren im Verborgenen. Spezialisiert auf Guerilla-Taktiken und Hinterhalte. Nur Rogue-Mains!', playstyle: ['pvp'], requirements: { minHours: 600, voice: true, age: 16 }, teamSize: { current: 18, max: 25 }, createdAt: new Date(Date.now() - 64800000), responses: 34, featured: false },
  { id: 'lfg21', author: { name: 'MerchantGuild', avatar: '💰', level: 'advanced', hours: 1500, online: true }, title: '[GILDE] Händler-Allianz sucht Mitglieder', description: 'Die größte Handelsorganisation auf Eldrun! Wir kontrollieren die Wirtschaft. Suche Crafter und Händler.', playstyle: ['farming', 'casual'], requirements: { minHours: 200, voice: false, age: 0 }, teamSize: { current: 25, max: 40 }, createdAt: new Date(Date.now() - 129600000), responses: 42, featured: false },
  { id: 'lfg22', author: { name: 'NightWatch', avatar: '🦉', level: 'veteran', hours: 2400, online: true }, title: '[GILDE] Night Watch - Nachtschicht Crew', description: 'Wir spielen hauptsächlich nachts (23-06 Uhr). Suche Nachteulen für gemeinsame Sessions!', playstyle: ['pvp', 'raiding', 'casual'], requirements: { minHours: 300, voice: true, age: 18 }, teamSize: { current: 12, max: 20 }, createdAt: new Date(Date.now() - 93600000), responses: 16, featured: false },
]

export default function LFGPage() {
  const [posts, setPosts] = useState<LFGPost[]>(SIMULATED_POSTS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlaystyle, setFilterPlaystyle] = useState<string | null>(null)
  const [filterExperience, setFilterExperience] = useState<string | null>(null)
  const [showVoiceOnly, setShowVoiceOnly] = useState(false)
  const { factionScore, supportFaction } = useStore()
  const totalScore = Math.max(1, factionScore.seraphar + factionScore.vorgaroth)
  const serapharPct = Math.round((factionScore.seraphar / totalScore) * 100)
  const vorgarothPct = 100 - serapharPct

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlaystyle = !filterPlaystyle || post.playstyle.includes(filterPlaystyle)
    const matchesVoice = !showVoiceOnly || post.requirements.voice
    return matchesSearch && matchesPlaystyle && matchesVoice
  })

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 60) return `vor ${minutes}m`
    if (hours < 24) return `vor ${hours}h`
    return `vor ${Math.floor(hours / 24)}d`
  }

  return (
    <EldrunPageShell
      icon={Users}
      badge="LFG"
      title="MITSPIELER SUCHE"
      subtitle="FINDE DEIN TEAM"
      description={`Suche nach Mitspielern oder erstelle dein eigenes LFG-Posting. ${posts.length} aktive Posts, ${posts.filter(p => p.author.online).length} online.`}
      gradient="from-green-300 via-green-400 to-green-600"
      glowColor="rgba(34,197,94,0.22)"
    >
      <div>
        {/* Global Faction Control */}
        <div className="mb-6 bg-metal-900/60 border border-metal-800 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-rust-400" />
              <div>
                <p className="text-xs font-mono text-metal-500 uppercase tracking-wider">Fraktionskrieg – Global</p>
                <p className="text-sm text-metal-300">Support-Buttons wirken global (Demo-State)</p>
              </div>
            </div>
            <div className="flex gap-2 text-[11px] font-mono">
              <button
                onClick={() => supportFaction('seraphar', Math.floor(Math.random() * 3) + 1)}
                className="px-3 py-2 rounded-lg bg-amber-900/30 border border-amber-500/40 hover:border-amber-400 transition-colors"
              >
                +Seraphar
              </button>
              <button
                onClick={() => supportFaction('vorgaroth', Math.floor(Math.random() * 3) + 1)}
                className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-500/40 hover:border-red-400 transition-colors"
              >
                +Vorgaroth
              </button>
            </div>
          </div>
          <div className="mt-3 h-3 bg-metal-800 rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/80 to-amber-400/60 transition-all"
              style={{ width: `${serapharPct}%` }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-600/70 to-red-500/60 transition-all"
              style={{ width: `${vorgarothPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-metal-400 mt-1">
            <span className="text-amber-400">Seraphar {serapharPct}%</span>
            <span className="text-red-400">Vorgaroth {vorgarothPct}%</span>
          </div>
        </div>
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
            <input
              type="text"
              placeholder="Suche nach Gruppen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-green-500"
            />
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            LFG erstellen
          </button>
        </div>

        {/* Playstyle Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterPlaystyle(null)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              !filterPlaystyle
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-metal-800 text-metal-400 border border-metal-700'
            }`}
          >
            Alle
          </button>
          {PLAYSTYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setFilterPlaystyle(filterPlaystyle === style.id ? null : style.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 ${
                filterPlaystyle === style.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-metal-800 text-metal-400 border border-metal-700 hover:border-metal-600'
              }`}
            >
              <span>{style.icon}</span>
              {style.name}
            </button>
          ))}
        </div>

        {/* Voice Filter */}
        <div className="flex items-center gap-4 mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setShowVoiceOnly(!showVoiceOnly)}
              className={`w-10 h-5 rounded-full transition-colors ${showVoiceOnly ? 'bg-green-500' : 'bg-metal-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${showVoiceOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-metal-300 text-sm flex items-center gap-1">
              <Mic className="w-4 h-4" />
              Nur mit Voice
            </span>
          </label>
        </div>

        {/* Featured Posts */}
        {filteredPosts.some(p => p.featured) && (
          <div className="mb-8">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Hervorgehoben
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPosts.filter(p => p.featured).map(post => (
                <LFGCard key={post.id} post={post} formatTimeAgo={formatTimeAgo} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div className="space-y-4">
          <h2 className="font-bold text-white">Alle Posts ({filteredPosts.filter(p => !p.featured).length})</h2>
          {filteredPosts.filter(p => !p.featured).map(post => (
            <LFGCard key={post.id} post={post} formatTimeAgo={formatTimeAgo} />
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-metal-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine LFG-Posts gefunden</p>
            </div>
          )}
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && <CreateLFGModal onClose={() => setShowCreateModal(false)} />}
        </AnimatePresence>
      </div>
    </EldrunPageShell>
  )
}

function LFGCard({ post, formatTimeAgo, featured = false }: { post: LFGPost, formatTimeAgo: (date: Date) => string, featured?: boolean }) {
  const experienceLevel = EXPERIENCE_LEVELS.find(e => e.id === post.author.level)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-metal-900/50 border rounded-xl p-5 hover:border-green-500/50 transition-all ${
        featured ? 'border-amber-500/50' : 'border-metal-800'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Author Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-metal-800 flex items-center justify-center text-2xl">
            {post.author.avatar}
          </div>
          {post.author.online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-metal-900" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-bold text-white text-lg">{post.title}</h3>
              <div className="flex items-center gap-2 text-sm text-metal-400">
                <span>{post.author.name}</span>
                <span>•</span>
                <span className={experienceLevel?.color}>{post.author.hours}h</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.requirements.voice && (
                <div className="p-1.5 bg-green-500/20 rounded-lg" title="Voice erforderlich">
                  <Mic className="w-4 h-4 text-green-400" />
                </div>
              )}
              <div className="px-3 py-1 bg-metal-800 rounded-lg text-sm">
                <span className="text-green-400">{post.teamSize.current}</span>
                <span className="text-metal-500">/{post.teamSize.max}</span>
              </div>
            </div>
          </div>

          <p className="text-metal-400 text-sm mb-3 line-clamp-2">{post.description}</p>

          {/* Playstyles */}
          <div className="flex flex-wrap gap-2 mb-3">
            {post.playstyle.map(style => {
              const s = PLAYSTYLES.find(p => p.id === style)
              return (
                <span key={style} className={`px-2 py-1 bg-metal-800/50 rounded text-xs ${s?.color}`}>
                  {s?.icon} {s?.name}
                </span>
              )
            })}
          </div>

          {/* Requirements */}
          <div className="flex items-center gap-4 text-xs text-metal-500">
            {post.requirements.minHours > 0 && (
              <span>Min. {post.requirements.minHours}h</span>
            )}
            {post.requirements.age > 0 && (
              <span>{post.requirements.age}+ Jahre</span>
            )}
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {post.responses} Antworten
            </span>
          </div>
        </div>

        {/* Action */}
        <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Bewerben
        </button>
      </div>
    </motion.div>
  )
}

function CreateLFGModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    playstyles: [] as string[],
    minHours: 0,
    voice: false,
    age: 0,
    maxPlayers: 4
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-metal-900 border border-metal-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-metal-800 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">LFG erstellen</h2>
          <button onClick={onClose} className="p-2 text-metal-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-metal-400 mb-2">Titel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="z.B. Suche 2 Mitspieler für Raid-Team"
              className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm text-metal-400 mb-2">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Beschreibe was du suchst..."
              rows={4}
              className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white placeholder:text-metal-500 focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-metal-400 mb-2">Spielstil</label>
            <div className="flex flex-wrap gap-2">
              {PLAYSTYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => {
                    const newStyles = formData.playstyles.includes(style.id)
                      ? formData.playstyles.filter(s => s !== style.id)
                      : [...formData.playstyles, style.id]
                    setFormData({...formData, playstyles: newStyles})
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
                    formData.playstyles.includes(style.id)
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-metal-800 text-metal-400 border border-metal-700'
                  }`}
                >
                  <span>{style.icon}</span>
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-metal-400 mb-2">Max. Spieler</label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                min={2}
                max={20}
                className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-metal-400 mb-2">Min. Spielstunden</label>
              <input
                type="number"
                value={formData.minHours}
                onChange={(e) => setFormData({...formData, minHours: parseInt(e.target.value)})}
                min={0}
                className="w-full px-4 py-3 bg-metal-800 border border-metal-700 rounded-lg text-white focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setFormData({...formData, voice: !formData.voice})}
                className={`w-10 h-5 rounded-full transition-colors ${formData.voice ? 'bg-green-500' : 'bg-metal-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${formData.voice ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-metal-300 text-sm">Voice erforderlich</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-metal-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            LFG veröffentlichen
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
