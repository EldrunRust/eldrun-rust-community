'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, Lock, Check, Star, Gift, Crown, Zap,
  ChevronRight, Sparkles, Clock, Award, Gem
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const CURRENT_SEASON = {
  number: 3,
  name: 'Krieg der Häuser',
  startDate: new Date('2024-12-01'),
  endDate: new Date('2025-01-15'),
  theme: 'from-amber-500 via-rust-500 to-red-600'
}

const BATTLE_PASS_TIERS = [
  { level: 1, xpRequired: 0, free: { type: 'coins', amount: 100, icon: '🪙' }, premium: { type: 'skin', name: 'Bronze Hatchet', icon: '🪓', rarity: 'uncommon' } },
  { level: 2, xpRequired: 1000, free: { type: 'coins', amount: 150, icon: '🪙' }, premium: { type: 'emote', name: 'Victory Dance', icon: '💃', rarity: 'rare' } },
  { level: 3, xpRequired: 2000, free: null, premium: { type: 'skin', name: 'Steel Pickaxe', icon: '⛏️', rarity: 'rare' } },
  { level: 4, xpRequired: 3500, free: { type: 'xp_boost', amount: '2x 24h', icon: '⚡' }, premium: { type: 'coins', amount: 500, icon: '🪙' } },
  { level: 5, xpRequired: 5000, free: { type: 'coins', amount: 200, icon: '🪙' }, premium: { type: 'skin', name: 'Flame AK', icon: '🔥', rarity: 'epic' } },
  { level: 6, xpRequired: 7000, free: null, premium: { type: 'title', name: 'Kriegsherr', icon: '👑', rarity: 'epic' } },
  { level: 7, xpRequired: 9000, free: { type: 'coins', amount: 250, icon: '🪙' }, premium: { type: 'avatar', name: 'Dragon Frame', icon: '🐉', rarity: 'epic' } },
  { level: 8, xpRequired: 11500, free: { type: 'lootbox', name: 'Bronze Kiste', icon: '📦' }, premium: { type: 'skin', name: 'Shadow Bolt', icon: '🌙', rarity: 'epic' } },
  { level: 9, xpRequired: 14000, free: { type: 'coins', amount: 300, icon: '🪙' }, premium: { type: 'emote', name: 'Flame Trail', icon: '🔥', rarity: 'legendary' } },
  { level: 10, xpRequired: 17000, free: { type: 'coins', amount: 500, icon: '🪙' }, premium: { type: 'skin', name: 'ELDRUN Champion Set', icon: '👑', rarity: 'legendary' } },
]

const RARITY_STYLES = {
  common: 'border-gray-500/50 bg-gray-500/10',
  uncommon: 'border-green-500/50 bg-green-500/10',
  rare: 'border-blue-500/50 bg-blue-500/10',
  epic: 'border-purple-500/50 bg-purple-500/10',
  legendary: 'border-amber-500/50 bg-amber-500/10 animate-pulse',
}

export default function BattlePassPage() {
  const [currentXP, setCurrentXP] = useState(8500)
  const [hasPremium, setHasPremium] = useState(false)
  const [selectedTier, setSelectedTier] = useState<number | null>(null)

  const getCurrentLevel = () => {
    for (let i = BATTLE_PASS_TIERS.length - 1; i >= 0; i--) {
      if (currentXP >= BATTLE_PASS_TIERS[i].xpRequired) {
        return BATTLE_PASS_TIERS[i].level
      }
    }
    return 1
  }

  const currentLevel = getCurrentLevel()
  const nextTier = BATTLE_PASS_TIERS.find(t => t.xpRequired > currentXP)
  const progressToNext = nextTier 
    ? ((currentXP - (BATTLE_PASS_TIERS[currentLevel - 1]?.xpRequired || 0)) / 
       (nextTier.xpRequired - (BATTLE_PASS_TIERS[currentLevel - 1]?.xpRequired || 0))) * 100
    : 100

  const daysRemaining = Math.ceil((CURRENT_SEASON.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <EldrunPageShell
      icon={Trophy}
      badge={`SEASON ${CURRENT_SEASON.number}`}
      title="BATTLE PASS"
      subtitle={CURRENT_SEASON.name}
      description={`Level ${currentLevel} - ${currentXP.toLocaleString()} XP. Noch ${daysRemaining} Tage übrig in dieser Season!`}
      gradient="from-amber-300 via-rust-400 to-red-600"
      glowColor="rgba(245,158,11,0.22)"
    >
      <div>
        <AuthGate>
        {/* Premium CTA */}
        {!hasPremium && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => setHasPremium(true)}
            className="mb-8 px-8 py-4 bg-gradient-to-r from-amber-500 to-rust-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-3 mx-auto"
          >
            <Crown className="w-6 h-6" />
            Premium Freischalten - 9.99€
            <Sparkles className="w-5 h-5" />
          </motion.button>
        )}

        {/* Battle Pass Tiers */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {BATTLE_PASS_TIERS.map((tier, index) => {
              const isUnlocked = currentXP >= tier.xpRequired
              const isCurrent = tier.level === currentLevel
              
              return (
                <motion.div
                  key={tier.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative w-40 flex-shrink-0 ${isCurrent ? 'scale-105' : ''}`}
                >
                  {/* Level Badge */}
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-sm font-bold ${
                    isUnlocked 
                      ? 'bg-gradient-to-r from-amber-500 to-rust-500 text-white' 
                      : 'bg-metal-800 text-metal-400'
                  }`}>
                    {tier.level}
                  </div>

                  {/* Tier Card */}
                  <div className={`bg-metal-900/50 border rounded-xl overflow-hidden ${
                    isCurrent ? 'border-amber-500' : isUnlocked ? 'border-green-500/50' : 'border-metal-700'
                  }`}>
                    {/* Premium Reward */}
                    <div className={`p-4 border-b border-metal-800 ${
                      tier.premium.rarity ? RARITY_STYLES[tier.premium.rarity as keyof typeof RARITY_STYLES] : ''
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        {!hasPremium && !isUnlocked && <Lock className="w-4 h-4 text-metal-500" />}
                        {hasPremium && isUnlocked && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="text-3xl text-center mb-2">{tier.premium.icon}</div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-white truncate">
                          {tier.premium.name || `${tier.premium.amount} ${tier.premium.type}`}
                        </div>
                        {tier.premium.rarity && (
                          <div className={`text-xs ${
                            tier.premium.rarity === 'legendary' ? 'text-amber-400' :
                            tier.premium.rarity === 'epic' ? 'text-purple-400' :
                            tier.premium.rarity === 'rare' ? 'text-blue-400' : 'text-green-400'
                          }`}>
                            {tier.premium.rarity.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Free Reward */}
                    <div className="p-4 bg-metal-800/30">
                      {tier.free ? (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-metal-400">FREE</span>
                            {isUnlocked && <Check className="w-4 h-4 text-green-400" />}
                          </div>
                          <div className="text-2xl text-center mb-1">{tier.free.icon}</div>
                          <div className="text-xs text-center text-metal-300">
                            {tier.free.amount} {tier.free.type === 'coins' ? 'Coins' : tier.free.name || tier.free.type}
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-metal-600 py-4">
                          <Lock className="w-6 h-6 mx-auto" />
                          <span className="text-xs">Keine Free Belohnung</span>
                        </div>
                      )}
                    </div>

                    {/* XP Required */}
                    <div className="px-4 py-2 bg-metal-900 text-center">
                      <span className="text-xs text-metal-400">{tier.xpRequired.toLocaleString()} XP</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Premium Benefits */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Exklusive Belohnungen</h3>
            <p className="text-metal-400 text-sm">Erhalte legendäre Skins, Emotes und Titel nur für Premium-Mitglieder.</p>
          </div>
          <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-bold text-white mb-2">+50% XP Boost</h3>
            <p className="text-metal-400 text-sm">Level schneller mit permanentem XP-Boost für die gesamte Season.</p>
          </div>
          <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Tägliche Challenges</h3>
            <p className="text-metal-400 text-sm">Zugang zu Premium-Challenges mit besseren Belohnungen.</p>
          </div>
        </div>
        </AuthGate>
      </div>
    </EldrunPageShell>
  )
}
