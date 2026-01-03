'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Star, Lock, CheckCircle, Search, Filter,
  Sword, Shield, Coins, Clock, Target, Flame,
  Crown, Zap, Heart, Medal, Award, Sparkles, TrendingUp
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'combat' | 'survival' | 'economy' | 'social' | 'special' | 'seasonal'
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  progress?: { current: number; max: number }
  unlockedAt?: string
  requirements?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN ACHIEVEMENTS - Das Erbe der Könige
// 50+ Achievements im Game of Thrones Stil
// ═══════════════════════════════════════════════════════════════════════════

const SIMULATED_ACHIEVEMENTS: Achievement[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // COMBAT - Die Kunst des Krieges
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'ach_first_blood', name: 'Erstes Blut', description: 'Töte deinen ersten Gegner im Kampf', icon: '⚔️', category: 'combat', points: 10, rarity: 'common', unlockedAt: '12.12.2024' },
  { id: 'ach_warrior_10', name: 'Krieger des Reiches', description: 'Töte 10 Gegner', icon: '🗡️', category: 'combat', points: 25, rarity: 'common', unlockedAt: '13.12.2024' },
  { id: 'ach_warrior_50', name: 'Schattenmörder', description: 'Töte 50 Gegner', icon: '💀', category: 'combat', points: 50, rarity: 'uncommon', unlockedAt: '15.12.2024' },
  { id: 'ach_warrior_100', name: 'Blutiger Baron', description: 'Töte 100 Gegner', icon: '🩸', category: 'combat', points: 100, rarity: 'rare', progress: { current: 87, max: 100 } },
  { id: 'ach_warrior_500', name: 'Henker von Eldrun', description: 'Töte 500 Gegner', icon: '☠️', category: 'combat', points: 250, rarity: 'epic', progress: { current: 87, max: 500 } },
  { id: 'ach_warrior_1000', name: 'Todesengel', description: 'Töte 1000 Gegner - Die Legende von Eldrun', icon: '👼', category: 'combat', points: 500, rarity: 'legendary', progress: { current: 87, max: 1000 } },
  { id: 'ach_headshot_master', name: 'Scharfschütze der Krone', description: 'Erziele 100 Kopfschüsse', icon: '🎯', category: 'combat', points: 150, rarity: 'rare', progress: { current: 67, max: 100 } },
  { id: 'ach_kd_ratio_2', name: 'Überlebender', description: 'Erreiche ein K/D Verhältnis von 2.0', icon: '⚡', category: 'combat', points: 100, rarity: 'rare', unlockedAt: '18.12.2024' },
  { id: 'ach_kd_ratio_5', name: 'Unbezwingbar', description: 'Erreiche ein K/D Verhältnis von 5.0', icon: '👑', category: 'combat', points: 300, rarity: 'legendary', progress: { current: 3.5, max: 5.0 } },
  { id: 'ach_killstreak_5', name: 'Blutrausch', description: 'Erziele eine Killstreak von 5', icon: '🔥', category: 'combat', points: 75, rarity: 'uncommon', unlockedAt: '16.12.2024' },
  { id: 'ach_killstreak_10', name: 'Unstoppbar', description: 'Erziele eine Killstreak von 10', icon: '💥', category: 'combat', points: 200, rarity: 'epic', progress: { current: 7, max: 10 } },
  { id: 'ach_raid_base', name: 'Burgbrecher', description: 'Raide deine erste feindliche Basis', icon: '🏰', category: 'combat', points: 100, rarity: 'rare', unlockedAt: '17.12.2024' },
  { id: 'ach_raid_10', name: 'Plünderfürst', description: 'Raide 10 Basen erfolgreich', icon: '🔱', category: 'combat', points: 250, rarity: 'epic', progress: { current: 4, max: 10 } },
  { id: 'ach_defend_raid', name: 'Verteidiger des Reiches', description: 'Verteidige deine Basis erfolgreich gegen einen Raid', icon: '🛡️', category: 'combat', points: 150, rarity: 'rare', unlockedAt: '19.12.2024' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SURVIVAL - Die Kunst des Überlebens
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'ach_survive_1h', name: 'Überlebenskünstler', description: 'Überlebe 1 Stunde ohne zu sterben', icon: '⏰', category: 'survival', points: 25, rarity: 'common', unlockedAt: '12.12.2024' },
  { id: 'ach_survive_24h', name: 'Eiserner Wille', description: 'Überlebe 24 Stunden ohne zu sterben', icon: '🌅', category: 'survival', points: 100, rarity: 'rare', progress: { current: 18, max: 24 } },
  { id: 'ach_survive_wipe', name: 'Der Letzte seiner Art', description: 'Überlebe einen kompletten Wipe ohne zu sterben', icon: '👻', category: 'survival', points: 500, rarity: 'legendary' },
  { id: 'ach_build_base', name: 'Baumeister', description: 'Baue deine erste Basis', icon: '🏠', category: 'survival', points: 15, rarity: 'common', unlockedAt: '12.12.2024' },
  { id: 'ach_build_castle', name: 'Burgherr', description: 'Errichte eine Burg mit 10+ Räumen', icon: '🏰', category: 'survival', points: 150, rarity: 'rare', unlockedAt: '20.12.2024' },
  { id: 'ach_craft_1000', name: 'Meisterschmied', description: 'Stelle 1000 Items her', icon: '🔨', category: 'survival', points: 100, rarity: 'rare', progress: { current: 756, max: 1000 } },
  { id: 'ach_gather_10k_wood', name: 'Holzfäller', description: 'Sammle 10.000 Holz', icon: '🪵', category: 'survival', points: 50, rarity: 'uncommon', unlockedAt: '14.12.2024' },
  { id: 'ach_gather_10k_stone', name: 'Steinbrecher', description: 'Sammle 10.000 Stein', icon: '🪨', category: 'survival', points: 50, rarity: 'uncommon', unlockedAt: '14.12.2024' },
  { id: 'ach_gather_10k_metal', name: 'Erzsucher', description: 'Sammle 10.000 Metallerz', icon: '⛏️', category: 'survival', points: 75, rarity: 'uncommon', progress: { current: 8500, max: 10000 } },
  { id: 'ach_workbench_3', name: 'Technologiemeister', description: 'Baue eine Werkbank Stufe 3', icon: '🔧', category: 'survival', points: 100, rarity: 'rare', unlockedAt: '18.12.2024' },
  { id: 'ach_electric_base', name: 'Elektroingenieur', description: 'Baue eine elektrisch betriebene Basis', icon: '⚡', category: 'survival', points: 200, rarity: 'epic', progress: { current: 0, max: 1 } },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ECONOMY - Die Macht des Goldes
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'ach_coins_1k', name: 'Erstes Gold', description: 'Sammle 1.000 Eldrun Coins', icon: '🪙', category: 'economy', points: 25, rarity: 'common', unlockedAt: '12.12.2024' },
  { id: 'ach_coins_10k', name: 'Wohlhabend', description: 'Sammle 10.000 Eldrun Coins', icon: '💰', category: 'economy', points: 75, rarity: 'uncommon', unlockedAt: '16.12.2024' },
  { id: 'ach_coins_100k', name: 'Reichtum des Reiches', description: 'Sammle 100.000 Eldrun Coins', icon: '💎', category: 'economy', points: 200, rarity: 'epic', progress: { current: 67500, max: 100000 } },
  { id: 'ach_coins_1m', name: 'Golddrache von Eldrun', description: 'Sammle 1.000.000 Eldrun Coins', icon: '🐉', category: 'economy', points: 500, rarity: 'legendary', progress: { current: 67500, max: 1000000 } },
  { id: 'ach_shop_first', name: 'Erster Einkauf', description: 'Kaufe dein erstes Item im Shop', icon: '🛒', category: 'economy', points: 10, rarity: 'common', unlockedAt: '12.12.2024' },
  { id: 'ach_shop_vip', name: 'VIP Status', description: 'Kaufe ein VIP Paket', icon: '👑', category: 'economy', points: 100, rarity: 'rare', unlockedAt: '15.12.2024' },
  { id: 'ach_auction_sell', name: 'Händler', description: 'Verkaufe dein erstes Item im Auktionshaus', icon: '📦', category: 'economy', points: 50, rarity: 'uncommon', unlockedAt: '17.12.2024' },
  { id: 'ach_auction_100k', name: 'Handelsmogul', description: 'Verdiene 100.000 Coins im Auktionshaus', icon: '🏛️', category: 'economy', points: 250, rarity: 'epic', progress: { current: 45000, max: 100000 } },
  { id: 'ach_casino_win_10k', name: 'Glücksspieler', description: 'Gewinne 10.000 Coins im Casino', icon: '🎰', category: 'economy', points: 100, rarity: 'rare', unlockedAt: '19.12.2024' },
  { id: 'ach_casino_jackpot', name: 'Jackpot!', description: 'Gewinne den Casino Jackpot', icon: '🎯', category: 'economy', points: 500, rarity: 'legendary' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL - Die Macht der Allianz
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'ach_join_clan', name: 'Familienmitglied', description: 'Tritt deiner ersten Gilde bei', icon: '👥', category: 'social', points: 25, rarity: 'common', unlockedAt: '13.12.2024' },
  { id: 'ach_create_clan', name: 'Gründervater', description: 'Gründe deine eigene Gilde', icon: '🏴', category: 'social', points: 100, rarity: 'rare' },
  { id: 'ach_clan_leader', name: 'Anführer', description: 'Werde Anführer einer Gilde', icon: '👑', category: 'social', points: 200, rarity: 'epic' },
  { id: 'ach_friends_10', name: 'Gesellig', description: 'Füge 10 Freunde hinzu', icon: '🤝', category: 'social', points: 50, rarity: 'uncommon', unlockedAt: '15.12.2024' },
  { id: 'ach_forum_first_post', name: 'Erste Worte', description: 'Schreibe deinen ersten Forum-Beitrag', icon: '✍️', category: 'social', points: 15, rarity: 'common', unlockedAt: '13.12.2024' },
  { id: 'ach_forum_100_posts', name: 'Wortgewandt', description: 'Schreibe 100 Forum-Beiträge', icon: '📚', category: 'social', points: 150, rarity: 'rare', progress: { current: 47, max: 100 } },
  { id: 'ach_help_newbie', name: 'Mentor des Reiches', description: 'Hilf 10 neuen Spielern', icon: '🌟', category: 'social', points: 100, rarity: 'rare', progress: { current: 6, max: 10 } },
  { id: 'ach_vote_server', name: 'Unterstützer', description: 'Vote 30 Tage hintereinander für den Server', icon: '🗳️', category: 'social', points: 200, rarity: 'epic', progress: { current: 12, max: 30 } },
  { id: 'ach_referral', name: 'Botschafter', description: 'Werbe 5 neue Spieler', icon: '📣', category: 'social', points: 250, rarity: 'epic', progress: { current: 2, max: 5 } },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SPECIAL - Die Legenden von Eldrun
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'ach_boss_kill', name: 'Drachentöter', description: 'Besiege deinen ersten Weltboss', icon: '🐲', category: 'special', points: 150, rarity: 'rare', unlockedAt: '20.12.2024' },
  { id: 'ach_boss_all', name: 'Bossslayer', description: 'Besiege alle 5 Weltbosse', icon: '💀', category: 'special', points: 500, rarity: 'legendary', progress: { current: 2, max: 5 } },
  { id: 'ach_class_master', name: 'Klassemeister', description: 'Erreiche Level 100 mit einer Klasse', icon: '⭐', category: 'special', points: 300, rarity: 'epic', progress: { current: 67, max: 100 } },
  { id: 'ach_all_classes', name: 'Alleskönner', description: 'Spiele alle 6 Klassen auf Level 50+', icon: '🎭', category: 'special', points: 500, rarity: 'legendary', progress: { current: 2, max: 6 } },
  { id: 'ach_faction_war', name: 'Fraktionskrieger', description: 'Nimm an einem Fraktionskrieg teil', icon: '⚔️', category: 'special', points: 100, rarity: 'rare', unlockedAt: '21.12.2024' },
  { id: 'ach_faction_champion', name: 'Champion der Fraktion', description: 'Gewinne einen Fraktionskrieg als MVP', icon: '🏆', category: 'special', points: 500, rarity: 'legendary' },
  { id: 'ach_territory_control', name: 'Gebietsherrscher', description: 'Kontrolliere 3 Territorien gleichzeitig', icon: '🗺️', category: 'special', points: 300, rarity: 'epic', progress: { current: 1, max: 3 } },
  { id: 'ach_perfect_raid', name: 'Perfekter Raubzug', description: 'Schließe einen Raid ohne Tode ab', icon: '💯', category: 'special', points: 200, rarity: 'epic' },
  { id: 'ach_leaderboard_1', name: 'König des Berges', description: 'Erreiche Platz 1 im Leaderboard', icon: '🥇', category: 'special', points: 500, rarity: 'legendary' },
  { id: 'ach_leaderboard_10', name: 'Elite-Spieler', description: 'Erreiche die Top 10 im Leaderboard', icon: '🏅', category: 'special', points: 200, rarity: 'epic', progress: { current: 34, max: 10 } },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SEASONAL - Die Feste von Eldrun
  // ═══════════════════════════════════════════════════════════════════════════
  { id: 'ach_winter_2024', name: 'Winterfest 2024', description: 'Nimm am Winterfest Event teil', icon: '❄️', category: 'seasonal', points: 100, rarity: 'rare', unlockedAt: '21.12.2024' },
  { id: 'ach_winter_boss', name: 'Frostkönig-Bezwinger', description: 'Besiege den Frostkönig', icon: '🥶', category: 'seasonal', points: 200, rarity: 'epic' },
  { id: 'ach_halloween_2024', name: 'Geisterjäger', description: 'Sammle 100 Kürbisse beim Halloween Event', icon: '🎃', category: 'seasonal', points: 150, rarity: 'rare' },
  { id: 'ach_battlepass_max', name: 'Battle Pass Meister', description: 'Erreiche Level 50 im Battle Pass', icon: '🎖️', category: 'seasonal', points: 300, rarity: 'epic', progress: { current: 32, max: 50 } },
  { id: 'ach_season_3', name: 'Veteran Season 3', description: 'Schließe Season 3 ab', icon: '📜', category: 'seasonal', points: 100, rarity: 'rare' },
  { id: 'ach_founders', name: 'Gründer von Eldrun', description: 'Spiele seit dem ersten Tag', icon: '🏛️', category: 'seasonal', points: 500, rarity: 'legendary', unlockedAt: '01.01.2024', requirements: 'Nur für Spieler die seit Tag 1 dabei sind' },
]

const CATEGORY_CONFIG = {
  combat: { icon: Sword, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Kampf' },
  survival: { icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Überleben' },
  economy: { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Wirtschaft' },
  social: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20', label: 'Sozial' },
  special: { icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Spezial' },
  seasonal: { icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Saisonal' }
}

const RARITY_CONFIG = {
  common: { color: 'text-metal-400', bg: 'bg-metal-500/20', border: 'border-metal-500/30', label: 'Gewöhnlich' },
  uncommon: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', label: 'Ungewöhnlich' },
  rare: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', label: 'Selten' },
  epic: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', label: 'Episch' },
  legendary: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', label: 'Legendär' }
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [showUnlocked, setShowUnlocked] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [animatedPoints, setAnimatedPoints] = useState(0)

  // Load simulated achievements for demo mode
  useEffect(() => {
    // Simulate loading delay for realistic feel
    const timer = setTimeout(() => {
      setAchievements(SIMULATED_ACHIEVEMENTS)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Animate points counter
  const totalPointsReal = achievements.filter(a => a.unlockedAt).reduce((acc, a) => acc + a.points, 0)
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPoints(totalPointsReal), 100)
    return () => clearTimeout(timer)
  }, [totalPointsReal])

  const filteredAchievements = achievements.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter
    const matchesRarity = rarityFilter === 'all' || a.rarity === rarityFilter
    const matchesUnlocked = !showUnlocked || a.unlockedAt
    return matchesSearch && matchesCategory && matchesRarity && matchesUnlocked
  })

  // Near completion achievements
  const nearComplete = achievements.filter(a => 
    a.progress && !a.unlockedAt && (a.progress.current / a.progress.max) >= 0.7
  )

  // Recently unlocked
  const recentlyUnlocked = achievements.filter(a => a.unlockedAt).slice(0, 3)

  const unlockedCount = achievements.filter(a => a.unlockedAt).length
  const totalPoints = achievements.filter(a => a.unlockedAt).reduce((acc, a) => acc + a.points, 0)
  const maxPoints = achievements.reduce((acc, a) => acc + a.points, 0)

  return (
    <EldrunPageShell
      icon={Trophy}
      badge="ACHIEVEMENTS"
      title="ACHIEVEMENTS"
      subtitle="SAMMLE ERFOLGE"
      description="Sammle Erfolge und zeige deine Meisterschaft! Verdiene Punkte und schalte legendäre Belohnungen frei."
      gradient="from-amber-300 via-amber-400 to-amber-600"
      glowColor="rgba(245,158,11,0.22)"
    >
      <AuthGate>
      {/* Near Completion Alert */}
      {nearComplete.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-900/30 via-orange-900/20 to-amber-900/30 border border-amber-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-white font-bold">Fast geschafft!</p>
                <p className="text-metal-400 text-sm">
                  Du bist kurz davor, {nearComplete.length} Achievement{nearComplete.length > 1 ? 's' : ''} freizuschalten!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mt-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{unlockedCount}/{achievements.length}</p>
            <p className="text-metal-500 text-sm">Freigeschaltet</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</p>
            <p className="text-metal-500 text-sm">Achievement Punkte</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0}%</p>
            <p className="text-metal-500 text-sm">Abgeschlossen</p>
          </div>
          <div className="p-4 bg-metal-900/50 border border-metal-800 rounded-xl text-center">
            <Medal className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{achievements.filter((a: Achievement) => a.rarity === 'legendary' && a.unlockedAt).length}</p>
            <p className="text-metal-500 text-sm">Legendäre</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 p-6 bg-metal-900/50 border border-metal-800 rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="text-metal-400">Gesamtfortschritt</span>
            <span className="text-amber-400 font-bold">{totalPoints.toLocaleString()} / {maxPoints.toLocaleString()} Punkte</span>
          </div>
          <div className="h-4 bg-metal-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
              style={{ width: `${(totalPoints / maxPoints) * 100}%` }}
            />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metal-500" />
            <input
              type="text"
              placeholder="Achievement suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white placeholder:text-metal-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Alle Kategorien</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-4 py-3 bg-metal-900 border border-metal-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Alle Seltenheiten</option>
              {Object.entries(RARITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowUnlocked(!showUnlocked)}
              className={`px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 ${
                showUnlocked 
                  ? 'bg-green-600 text-white' 
                  : 'bg-metal-900 border border-metal-700 text-metal-400'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Nur freigeschaltete
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement, index) => {
            const category = CATEGORY_CONFIG[achievement.category]
            const rarity = RARITY_CONFIG[achievement.rarity]
            const isUnlocked = !!achievement.unlockedAt
            const hasProgress = !!achievement.progress

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-4 bg-metal-900/50 border rounded-xl transition-all ${
                  isUnlocked ? `${rarity.border} ${rarity.bg}` : 'border-metal-800 opacity-60'
                }`}
              >
                {/* Rarity Badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded ${rarity.bg} ${rarity.color}`}>
                  {rarity.label}
                </div>

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    isUnlocked ? category.bg : 'bg-metal-800'
                  }`}>
                    {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-metal-600" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-metal-500'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-metal-400 text-sm mb-2">{achievement.description}</p>
                    
                    {/* Progress or Unlocked Date */}
                    {hasProgress && !isUnlocked ? (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-metal-500">Fortschritt</span>
                          <span className="text-metal-400">
                            {achievement.progress!.current.toLocaleString()} / {achievement.progress!.max.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-metal-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${category.bg.replace('/20', '')}`}
                            style={{ width: `${(achievement.progress!.current / achievement.progress!.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : isUnlocked ? (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Freigeschaltet am {achievement.unlockedAt}</span>
                      </div>
                    ) : null}

                    {/* Points */}
                    <div className="flex items-center gap-1 mt-2">
                      <Star className={`w-4 h-4 ${isUnlocked ? 'text-amber-400' : 'text-metal-600'}`} />
                      <span className={`text-sm font-bold ${isUnlocked ? 'text-amber-400' : 'text-metal-600'}`}>
                        {achievement.points} Punkte
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-metal-600 mx-auto mb-4" />
            <p className="text-metal-500">Keine Achievements gefunden.</p>
          </div>
        )}
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
