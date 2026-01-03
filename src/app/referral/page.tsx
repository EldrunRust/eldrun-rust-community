'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Gift, Copy, Check, Share2, Trophy, Star,
  Crown, Zap, ChevronRight, ExternalLink
} from 'lucide-react'
import { EldrunPageShell } from '@/components/layout/EldrunPageShell'
import { AuthGate } from '@/components/AuthGate'

const REFERRAL_TIERS = [
  { level: 1, referrals: 1, reward: '500 Coins + Bronze Badge', icon: '🥉', color: 'from-amber-700 to-amber-900' },
  { level: 2, referrals: 5, reward: '2,500 Coins + Silver Badge', icon: '🥈', color: 'from-gray-400 to-gray-600' },
  { level: 3, referrals: 10, reward: '5,000 Coins + Gold Badge', icon: '🥇', color: 'from-amber-400 to-amber-600' },
  { level: 4, referrals: 25, reward: '15,000 Coins + Platinum Badge', icon: '💎', color: 'from-cyan-400 to-blue-600' },
  { level: 5, referrals: 50, reward: '50,000 Coins + Legendary Badge + Exklusiver Skin', icon: '👑', color: 'from-purple-400 to-pink-600' },
]

const RECENT_REFERRALS = [
  { name: 'Player***123', date: new Date(Date.now() - 1000 * 60 * 60 * 2), reward: 500 },
  { name: 'Rust***ner', date: new Date(Date.now() - 1000 * 60 * 60 * 24), reward: 500 },
  { name: 'New***bie', date: new Date(Date.now() - 1000 * 60 * 60 * 48), reward: 500 },
]

const TOP_REFERRERS = [
  { rank: 1, name: 'MasterRecruiter', referrals: 156, totalEarned: 85000, badge: '👑' },
  { rank: 2, name: 'CommunityKing', referrals: 89, totalEarned: 45000, badge: '💎' },
  { rank: 3, name: 'FriendlyPlayer', referrals: 67, totalEarned: 35000, badge: '🥇' },
  { rank: 4, name: 'RustAmbassador', referrals: 45, totalEarned: 25000, badge: '🥇' },
  { rank: 5, name: 'NewbieHelper', referrals: 32, totalEarned: 18000, badge: '🥈' },
]

export default function ReferralPage() {
  const [referralCode] = useState('ELDRUN-X7K9M')
  const [copied, setCopied] = useState(false)
  const [myReferrals] = useState(7)
  const [totalEarned] = useState(3500)

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://eldrun.lol/join?ref=${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentTier = REFERRAL_TIERS.findIndex(t => myReferrals < t.referrals)
  const nextTier = REFERRAL_TIERS[currentTier] || REFERRAL_TIERS[REFERRAL_TIERS.length - 1]
  const prevTier = REFERRAL_TIERS[currentTier - 1] || { referrals: 0 }
  const progress = ((myReferrals - prevTier.referrals) / (nextTier.referrals - prevTier.referrals)) * 100

  return (
    <EldrunPageShell
      icon={Gift}
      badge="REFERRAL"
      title="FREUNDE WERBEN"
      subtitle="VERDIENE BELOHNUNGEN"
      description={`Lade deine Freunde zu ELDRUN ein und erhalte exklusive Belohnungen. Du hast bereits ${myReferrals} Freunde geworben und ${totalEarned.toLocaleString()} Coins verdient!`}
      gradient="from-pink-300 via-pink-400 to-pink-600"
      glowColor="rgba(236,72,153,0.22)"
    >
      <AuthGate>
      <div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl p-8"
            >
              <h2 className="font-display font-bold text-2xl text-white mb-6">Dein Referral Code</h2>
              
              {/* Code Display */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 px-6 py-4 bg-metal-900 border border-metal-700 rounded-xl font-mono text-2xl text-white text-center tracking-widest">
                  {referralCode}
                </div>
                <button
                  onClick={copyCode}
                  className="px-6 py-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>

              {/* Share Options */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-metal-800 text-metal-300 rounded-lg hover:bg-metal-700 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Link kopieren
                </button>
                <button className="px-4 py-2 bg-[#5865F2] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                  Discord teilen
                </button>
                <button className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                  Twitter teilen
                </button>
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-metal-900/50 border border-metal-800 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-white">Dein Fortschritt</h2>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-400" />
                  <span className="text-2xl font-bold text-white">{myReferrals}</span>
                  <span className="text-metal-400">Referrals</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-metal-400 mb-2">
                  <span>Level {currentTier}</span>
                  <span>{myReferrals} / {nextTier.referrals}</span>
                </div>
                <div className="h-4 bg-metal-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Tiers */}
              <div className="space-y-4">
                {REFERRAL_TIERS.map((tier, index) => {
                  const isUnlocked = myReferrals >= tier.referrals
                  const isCurrent = index === currentTier - 1

                  return (
                    <div
                      key={tier.level}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isUnlocked 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : isCurrent 
                            ? 'bg-pink-500/10 border-pink-500/30'
                            : 'bg-metal-800/30 border-metal-700'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-2xl`}>
                        {tier.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">Level {tier.level}</div>
                        <div className="text-sm text-metal-400">{tier.reward}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${isUnlocked ? 'text-green-400' : 'text-metal-500'}`}>
                          {tier.referrals} Referrals
                        </div>
                        {isUnlocked && <Check className="w-5 h-5 text-green-400 ml-auto" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Recent Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-metal-900/50 border border-metal-800 rounded-2xl p-6"
            >
              <h3 className="font-bold text-white mb-4">Letzte Referrals</h3>
              <div className="space-y-3">
                {RECENT_REFERRALS.map((ref, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-metal-700 flex items-center justify-center">
                        <Users className="w-4 h-4 text-metal-400" />
                      </div>
                      <span className="text-metal-300">{ref.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+{ref.reward} 🪙</div>
                      <div className="text-xs text-metal-500">
                        {Math.floor((Date.now() - ref.date.getTime()) / 3600000)}h ago
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Deine Statistiken</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                  <span className="text-metal-400">Gesamt verdient</span>
                  <span className="font-bold text-amber-400">{totalEarned.toLocaleString()} 🪙</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                  <span className="text-metal-400">Aktive Referrals</span>
                  <span className="font-bold text-green-400">{myReferrals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-metal-800/50 rounded-lg">
                  <span className="text-metal-400">Aktuelles Level</span>
                  <span className="font-bold text-pink-400">Level {currentTier}</span>
                </div>
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Top Werber
              </h3>
              <div className="space-y-3">
                {TOP_REFERRERS.map((referrer) => (
                  <div key={referrer.rank} className="flex items-center gap-3 p-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      referrer.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                      referrer.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                      referrer.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                      'bg-metal-700 text-metal-400'
                    }`}>
                      {referrer.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-white font-medium truncate">{referrer.name}</span>
                        <span>{referrer.badge}</span>
                      </div>
                      <div className="text-xs text-metal-500">{referrer.referrals} Referrals</div>
                    </div>
                    <div className="text-amber-400 text-sm font-bold">
                      {(referrer.totalEarned / 1000).toFixed(0)}K 🪙
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-metal-900/50 border border-metal-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">So funktioniert&apos;s</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold flex-shrink-0">1</div>
                  <p className="text-metal-400 text-sm">Teile deinen Referral-Code mit Freunden</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold flex-shrink-0">2</div>
                  <p className="text-metal-400 text-sm">Dein Freund registriert sich mit dem Code</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold flex-shrink-0">3</div>
                  <p className="text-metal-400 text-sm">Ihr beide erhaltet Belohnungen!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AuthGate>
    </EldrunPageShell>
  )
}
