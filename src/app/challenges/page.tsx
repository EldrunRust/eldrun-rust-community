'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, Clock, Check, Star, Zap, Gift, Crown,
  RefreshCw, ChevronRight, Flame, Sword, Shield,
  Package, Users, Crosshair, Trophy
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

// ═══════════════════════════════════════════════════════════════════════════
// ELDRUN CHALLENGES - Die Prüfungen der Krone
// Tägliche, Wöchentliche und Premium Herausforderungen
// ═══════════════════════════════════════════════════════════════════════════

const DAILY_CHALLENGES = [
  { id: 'd1', title: 'Erste Schritte', description: 'Logge dich heute auf dem Server ein', xp: 100, coins: 50, progress: 1, required: 1, icon: '🎮', category: 'daily', difficulty: 'easy' },
  { id: 'd2', title: 'Ressourcen-Sammler', description: 'Sammle 1000 Holz oder Stein', xp: 200, coins: 100, progress: 650, required: 1000, icon: '⛏️', category: 'daily', difficulty: 'easy' },
  { id: 'd3', title: 'Killer Instinkt', description: 'Eliminiere 3 Spieler im Kampf', xp: 300, coins: 150, progress: 1, required: 3, icon: '💀', category: 'daily', difficulty: 'medium' },
  { id: 'd4', title: 'Handwerker', description: 'Crafte 10 Items in der Werkbank', xp: 150, coins: 75, progress: 10, required: 10, icon: '🔨', category: 'daily', difficulty: 'easy' },
  { id: 'd5', title: 'Der Jäger', description: 'Erlege 5 Tiere (Wildschweine, Hirsche, Bären)', xp: 175, coins: 85, progress: 3, required: 5, icon: '🐗', category: 'daily', difficulty: 'easy' },
  { id: 'd6', title: 'Kopfschuss-König', description: 'Erziele 3 Kopfschüsse', xp: 350, coins: 175, progress: 1, required: 3, icon: '🎯', category: 'daily', difficulty: 'medium' },
  { id: 'd7', title: 'Casino Glückspilz', description: 'Gewinne 500 Coins im Casino', xp: 250, coins: 125, progress: 320, required: 500, icon: '🎰', category: 'daily', difficulty: 'medium' },
  { id: 'd8', title: 'Soziale Aktivität', description: 'Schreibe 5 Chat-Nachrichten', xp: 100, coins: 50, progress: 5, required: 5, icon: '💬', category: 'daily', difficulty: 'easy' },
  { id: 'd9', title: 'Überlebenskünstler', description: 'Überlebe 2 Stunden ohne zu sterben', xp: 400, coins: 200, progress: 1.5, required: 2, icon: '⏰', category: 'daily', difficulty: 'medium' },
  { id: 'd10', title: 'Fraktionspflicht', description: 'Nimm an einem Fraktions-Event teil', xp: 500, coins: 250, progress: 0, required: 1, icon: '⚔️', category: 'daily', difficulty: 'hard' },
]

const WEEKLY_CHALLENGES = [
  { id: 'w1', title: 'Raid-Master', description: 'Zerstöre 5 feindliche Türen', xp: 1000, coins: 500, progress: 2, required: 5, icon: '💣', category: 'weekly', difficulty: 'hard' },
  { id: 'w2', title: 'Clan-Krieger', description: 'Gewinne 3 Clan-Kämpfe', xp: 1500, coins: 750, progress: 1, required: 3, icon: '⚔️', category: 'weekly', difficulty: 'hard' },
  { id: 'w3', title: 'Monument-Eroberer', description: 'Schließe 10 Monument-Runs ab', xp: 800, coins: 400, progress: 7, required: 10, icon: '🏛️', category: 'weekly', difficulty: 'medium' },
  { id: 'w4', title: 'Kill-Streak Legende', description: 'Erreiche eine Killstreak von 10', xp: 2000, coins: 1000, progress: 7, required: 10, icon: '🔥', category: 'weekly', difficulty: 'hard' },
  { id: 'w5', title: 'Großer Händler', description: 'Verkaufe Items für 50.000 Coins', xp: 1200, coins: 600, progress: 32500, required: 50000, icon: '💰', category: 'weekly', difficulty: 'medium' },
  { id: 'w6', title: 'Basisbauer', description: 'Platziere 500 Baublöcke', xp: 900, coins: 450, progress: 312, required: 500, icon: '🏠', category: 'weekly', difficulty: 'medium' },
  { id: 'w7', title: 'Questmeister', description: 'Schließe 20 Quests ab', xp: 1800, coins: 900, progress: 14, required: 20, icon: '📜', category: 'weekly', difficulty: 'hard' },
  { id: 'w8', title: 'Bossjäger', description: 'Besiege 3 Weltbosse', xp: 2500, coins: 1250, progress: 1, required: 3, icon: '🐲', category: 'weekly', difficulty: 'hard' },
]

const PREMIUM_CHALLENGES = [
  { id: 'p1', title: 'Legendärer Jäger', description: 'Töte den Bradley APC', xp: 2000, coins: 1000, progress: 0, required: 1, icon: '🚁', category: 'premium', difficulty: 'legendary', premium: true },
  { id: 'p2', title: 'Helikopter-Bezwinger', description: 'Zerstöre den Attack Helicopter', xp: 2500, coins: 1250, progress: 0, required: 1, icon: '🔥', category: 'premium', difficulty: 'legendary', premium: true },
  { id: 'p3', title: 'Drachentöter', description: 'Besiege den Feuerdrachen im Dragon\'s Lair', xp: 5000, coins: 2500, progress: 0, required: 1, icon: '🐉', category: 'premium', difficulty: 'legendary', premium: true },
  { id: 'p4', title: 'Fraktionsmeister', description: 'Gewinne einen Fraktionskrieg als MVP', xp: 4000, coins: 2000, progress: 0, required: 1, icon: '👑', category: 'premium', difficulty: 'legendary', premium: true },
  { id: 'p5', title: 'Casino Tycoon', description: 'Gewinne 1.000.000 Coins im Casino', xp: 3500, coins: 1750, progress: 456000, required: 1000000, icon: '🎰', category: 'premium', difficulty: 'legendary', premium: true },
  { id: 'p6', title: 'Der Unbesiegbare', description: 'Überlebe 7 Tage ohne zu sterben', xp: 6000, coins: 3000, progress: 3, required: 7, icon: '💀', category: 'premium', difficulty: 'legendary', premium: true },
]

const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  hard: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  legendary: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
}

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'premium'>('daily')
  const [timeUntilReset, setTimeUntilReset] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  const allChallenges = [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES, ...PREMIUM_CHALLENGES]
  const completedCount = allChallenges.filter(c => c.progress >= c.required).length
  const totalXP = allChallenges.reduce((acc, c) => acc + c.xp, 0)
  const earnedXP = allChallenges.filter(c => c.progress >= c.required).reduce((acc, c) => acc + c.xp, 0)

  const getChallenges = () => {
    switch (activeTab) {
      case 'daily': return DAILY_CHALLENGES
      case 'weekly': return WEEKLY_CHALLENGES
      case 'premium': return PREMIUM_CHALLENGES
    }
  }

  return (
    <EldrunPageShell
      icon={Target}
      badge="CHALLENGES"
      title="CHALLENGES"
      subtitle="VERDIENE XP & COINS"
      description={`Schließe tägliche und wöchentliche Herausforderungen ab. ${completedCount}/${allChallenges.length} abgeschlossen. Daily Reset in: ${timeUntilReset}`}
      gradient="from-orange-300 via-orange-400 to-orange-600"
      glowColor="rgba(249,115,22,0.22)"
    >
      <AuthGate>
      <div>
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'daily'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                : 'bg-metal-800 text-metal-400 border border-metal-700 hover:border-metal-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            Täglich
            <span className="px-2 py-0.5 bg-metal-700 rounded text-xs">
              {DAILY_CHALLENGES.filter(c => c.progress >= c.required).length}/{DAILY_CHALLENGES.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'weekly'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-metal-800 text-metal-400 border border-metal-700 hover:border-metal-600'
            }`}
          >
            <Star className="w-5 h-5" />
            Wöchentlich
            <span className="px-2 py-0.5 bg-metal-700 rounded text-xs">
              {WEEKLY_CHALLENGES.filter(c => c.progress >= c.required).length}/{WEEKLY_CHALLENGES.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'premium'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'bg-metal-800 text-metal-400 border border-metal-700 hover:border-metal-600'
            }`}
          >
            <Crown className="w-5 h-5" />
            Premium
            <span className="px-2 py-0.5 bg-metal-700 rounded text-xs">
              {PREMIUM_CHALLENGES.filter(c => c.progress >= c.required).length}/{PREMIUM_CHALLENGES.length}
            </span>
          </button>
        </div>

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {getChallenges().map((challenge, index) => {
            const isCompleted = challenge.progress >= challenge.required
            const progress = Math.min(100, (challenge.progress / challenge.required) * 100)
            const difficulty = DIFFICULTY_COLORS[challenge.difficulty as keyof typeof DIFFICULTY_COLORS]

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-metal-900/50 border rounded-xl p-5 ${
                  isCompleted ? 'border-green-500/50' : 'border-metal-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${difficulty.bg}`}>
                    {challenge.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{challenge.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${difficulty.bg} ${difficulty.text}`}>
                        {challenge.difficulty.toUpperCase()}
                      </span>
                      {(challenge as any).premium && (
                        <Crown className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-sm text-metal-400 mb-3">{challenge.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-metal-400 mb-1">
                        <span>{challenge.progress} / {challenge.required}</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-metal-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-bold">{challenge.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-amber-400">🪙</span>
                        <span className="text-amber-400 font-bold">{challenge.coins}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                    ) : (
                      <button className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm font-medium">
                        Track
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bonus Section */}
        <div className="mt-12 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl text-white">Alle Dailies abschließen</h3>
              <p className="text-metal-400">Schließe alle täglichen Challenges ab für einen Bonus!</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-3xl font-black text-amber-400">+500 XP</div>
              <div className="text-sm text-metal-400">Bonus Belohnung</div>
            </div>
          </div>
          <div className="h-3 bg-metal-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              style={{ width: `${(DAILY_CHALLENGES.filter(c => c.progress >= c.required).length / DAILY_CHALLENGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
