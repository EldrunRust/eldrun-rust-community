'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Crown, Star, Trophy, Zap, Gift, Shield, Gem,
  CreditCard, Wallet, Bitcoin, ChevronRight, Check,
  Users, TrendingUp, Clock, Award, Sparkles, Coffee,
  Target, Flame, Lock, ExternalLink, Copy, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { AuthGate } from '@/components/AuthGate'

// Limited time bonus (changes dynamically)
const LIMITED_BONUS = {
  active: true,
  bonusPercent: 25,
  endsIn: '2 Tagen 14 Stunden',
  message: '🔥 WINTER SPECIAL: +25% Bonus auf alle Tiers!'
}

// VIP Perks showcase
const VIP_PERKS = [
  { icon: '⚡', title: 'Priority Queue', desc: 'Keine Wartezeiten mehr' },
  { icon: '🏰', title: 'Exklusive Events', desc: 'VIP-only Turniere & Raids' },
  { icon: '🎨', title: 'Custom Cosmetics', desc: 'Einzigartige Skins & Effekte' },
  { icon: '💬', title: 'VIP Discord', desc: 'Privater Channel & Voice' },
  { icon: '🛡️', title: 'Priority Support', desc: 'Schnelle Hilfe bei Problemen' },
  { icon: '🎁', title: 'Monthly Rewards', desc: 'Exklusive monatliche Drops' },
]

// Testimonials
const TESTIMONIALS = [
  { name: 'DragonSlayer', tier: 'mythic', message: 'Beste Investment ever! Die VIP Perks sind unbezahlbar.', avatar: '🐉' },
  { name: 'ShadowQueen', tier: 'legend', message: 'Der Support hier ist unglaublich schnell und freundlich!', avatar: '👑' },
  { name: 'IronWolf', tier: 'champion', message: 'Endlich ein Server der sein Geld wert ist. Top Community!', avatar: '🐺' },
]

// Donation tiers with exclusive rewards
const DONATION_TIERS = [
  {
    id: 'supporter',
    name: 'Supporter',
    price: 5,
    color: 'from-emerald-500 to-emerald-700',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    icon: Heart,
    emoji: '💚',
    rewards: [
      'Supporter-Rang im Discord',
      'Exklusives Supporter-Badge',
      'Name auf der Dankes-Wand',
      '500 In-Game Coins'
    ]
  },
  {
    id: 'champion',
    name: 'Champion',
    price: 15,
    color: 'from-blue-500 to-blue-700',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: Shield,
    emoji: '💎',
    popular: true,
    rewards: [
      'Alle Supporter Rewards',
      'Champion-Rang im Discord',
      'Exklusiver Champion-Skin',
      '2.000 In-Game Coins',
      'Priority Support Queue'
    ]
  },
  {
    id: 'legend',
    name: 'Legend',
    price: 30,
    color: 'from-purple-500 to-purple-700',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    icon: Crown,
    emoji: '👑',
    rewards: [
      'Alle Champion Rewards',
      'Legend-Rang im Discord',
      'Custom Discord Role Color',
      '5.000 In-Game Coins',
      'Exklusiver Legend-Kit',
      'VIP Server Access (1 Monat)'
    ]
  },
  {
    id: 'mythic',
    name: 'Mythic',
    price: 50,
    color: 'from-amber-500 to-amber-700',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    icon: Gem,
    emoji: '🏆',
    rewards: [
      'Alle Legend Rewards',
      'Mythic-Rang im Discord',
      'Persönlicher Dank im Stream',
      '10.000 In-Game Coins',
      'Exklusiver Mythic-Titel',
      'VIP Server Access (3 Monate)',
      'Early Access zu neuen Features'
    ]
  }
]

// Payment methods
const PAYMENT_METHODS = [
  { id: 'paypal', name: 'PayPal', icon: '💳', description: 'Schnell & Sicher', color: 'bg-[#003087]' },
  { id: 'card', name: 'Kreditkarte', icon: '💳', description: 'Visa, Mastercard, Amex', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { id: 'crypto', name: 'Crypto', icon: '₿', description: 'BTC, ETH, USDT', color: 'bg-gradient-to-r from-orange-500 to-yellow-500' },
]

// Crypto addresses
const CRYPTO_ADDRESSES = {
  btc: { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', name: 'Bitcoin (BTC)' },
  eth: { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', name: 'Ethereum (ETH)' },
  usdt: { address: 'TN3W4H6rK2ce4vX9Td3Ae6qJkVNYiNwVDw', name: 'USDT (TRC20)' },
}

// Recent supporters (simulated - would come from API)
const RECENT_SUPPORTERS = [
  { name: 'DragonSlayer', amount: 50, tier: 'mythic', date: '2024-12-17', message: 'Keep up the great work!' },
  { name: 'NightRaider', amount: 30, tier: 'legend', date: '2024-12-17', message: 'Love this server!' },
  { name: 'PhoenixFire', amount: 15, tier: 'champion', date: '2024-12-16', message: '' },
  { name: 'IronGuard', amount: 30, tier: 'legend', date: '2024-12-16', message: 'Best community ever!' },
  { name: 'ShadowHunter', amount: 5, tier: 'supporter', date: '2024-12-15', message: '' },
  { name: 'RustLord', amount: 50, tier: 'mythic', date: '2024-12-15', message: 'Eldrun forever!' },
  { name: 'SirLancelot', amount: 15, tier: 'champion', date: '2024-12-14', message: '' },
  { name: 'DarkMage', amount: 5, tier: 'supporter', date: '2024-12-14', message: 'Thanks for everything!' },
]

// Shop transactions (simulated - would come from API)
const SHOP_TRANSACTIONS = [
  { item: 'VIP Diamond', buyer: 'ProPlayer', price: 29.99, date: '2024-12-17' },
  { item: 'Starter Kit Bundle', buyer: 'NewPlayer', price: 9.99, date: '2024-12-17' },
  { item: 'VIP Gold', buyer: 'GamerX', price: 14.99, date: '2024-12-16' },
  { item: 'Custom Skin Pack', buyer: 'SkinCollector', price: 19.99, date: '2024-12-16' },
  { item: 'VIP Platinum', buyer: 'EliteWarrior', price: 49.99, date: '2024-12-15' },
]

// Monthly goal data
const MONTHLY_GOAL = {
  current: 847.50,
  goal: 1500,
  supporters: 156,
  month: 'Dezember 2024'
}

// Leaderboard of top supporters
const TOP_SUPPORTERS = [
  { rank: 1, name: 'PhoenixKing', total: 500, badge: '👑', color: 'from-amber-400 to-yellow-500' },
  { rank: 2, name: 'DragonLord', total: 350, badge: '🥈', color: 'from-gray-300 to-gray-400' },
  { rank: 3, name: 'ShadowMaster', total: 275, badge: '🥉', color: 'from-amber-600 to-amber-700' },
  { rank: 4, name: 'IronGuardian', total: 200, badge: '⭐', color: 'from-purple-400 to-purple-500' },
  { rank: 5, name: 'FrostWolf', total: 150, badge: '⭐', color: 'from-blue-400 to-blue-500' },
]

export default function SupportPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [donorName, setDonorName] = useState('')
  const [donorMessage, setDonorMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'donate' | 'supporters' | 'transactions' | 'leaderboard'>('donate')
  const [liveCounter, setLiveCounter] = useState(MONTHLY_GOAL.current)
  const [showConfetti, setShowConfetti] = useState(false)

  // Simulate live donation counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter(prev => {
        const change = (Math.random() - 0.3) * 2
        return Math.max(MONTHLY_GOAL.current, prev + change)
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const progressPercentage = Math.min((MONTHLY_GOAL.current / MONTHLY_GOAL.goal) * 100, 100)
  
  const totalFromShop = SHOP_TRANSACTIONS.reduce((sum, t) => sum + t.price, 0)
  const totalFromDonations = RECENT_SUPPORTERS.reduce((sum, s) => sum + s.amount, 0)
  const grandTotal = totalFromShop + totalFromDonations

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(type)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const handleDonate = async () => {
    if (!selectedTier && !customAmount) return
    
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (selectedPayment === 'paypal') {
      // In production: Redirect to PayPal
      const amount = selectedTier ? DONATION_TIERS.find(t => t.id === selectedTier)?.price : parseFloat(customAmount)
      window.open(`https://www.paypal.com/donate/?business=YOUR_PAYPAL_EMAIL&amount=${amount}&currency_code=EUR`, '_blank')
    } else if (selectedPayment === 'card') {
      // In production: Integrate Stripe
      window.open('https://buy.stripe.com/YOUR_STRIPE_LINK', '_blank')
    } else if (selectedPayment === 'crypto') {
      setShowCryptoModal(true)
    }
    
    setIsProcessing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const getTierByName = (tier: string) => DONATION_TIERS.find(t => t.id === tier)

  return (
    <AuthGate>
      <div className="min-h-screen bg-metal-950 pt-20">
      {/* LIMITED TIME BONUS BANNER */}
      {LIMITED_BONUS.active && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 text-white py-3 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <div className="container-rust flex items-center justify-center gap-4 relative z-10">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-2xl"
            >
              🔥
            </motion.span>
            <span className="font-bold">{LIMITED_BONUS.message}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-mono">
              Endet in: {LIMITED_BONUS.endsIn}
            </span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-2xl"
            >
              🔥
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* Hero Section - ULTRA EXCLUSIVE Design */}
      <div className="relative overflow-hidden border-b border-metal-800">
        {/* Multi-layer animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-metal-900 to-purple-900/30" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Animated glow orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-3xl"
        />
        
        {/* Floating particles effect - Enhanced */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${i % 3 === 0 ? 'w-3 h-3 bg-amber-400/40' : i % 3 === 1 ? 'w-2 h-2 bg-purple-400/30' : 'w-1 h-1 bg-white/20'}`}
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * 500 + 500,
                opacity: 0
              }}
              animate={{ 
                y: -100,
                opacity: [0, 1, 0],
                rotate: 360
              }}
              transition={{ 
                duration: 8 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear'
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Premium badge */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm">COMMUNITY SUPPORT</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </motion.div>

            <motion.div 
              animate={{ 
                boxShadow: [
                  '0 0 40px rgba(245, 158, 11, 0.3)',
                  '0 0 80px rgba(245, 158, 11, 0.5)',
                  '0 0 40px rgba(245, 158, 11, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-28 h-28 mb-8 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-3xl border-2 border-dashed border-white/20"
              />
              <Heart className="w-14 h-14 text-white" />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl bg-white/20"
              />
            </motion.div>
            
            <h1 className="font-display text-5xl sm:text-6xl font-black text-white mb-6">
              SUPPORT <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">ELDRUN</span>
            </h1>
            
            <p className="text-metal-300 text-xl max-w-3xl mx-auto leading-relaxed">
              Hilf uns, die beste Gaming-Community aufzubauen. Jede Spende fließt direkt 
              in Server-Kosten, neue Features und Community-Events.
            </p>

            {/* Quick stats - Enhanced with animations */}
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {[
                { value: MONTHLY_GOAL.supporters, label: 'Unterstützer', icon: '👥', color: 'text-white' },
                { value: `€${liveCounter.toFixed(2)}`, label: 'Live Counter', icon: '💰', color: 'text-amber-400', live: true },
                { value: '24/7', label: 'Server Online', icon: '🟢', color: 'text-green-400' },
                { value: '99.9%', label: 'Uptime', icon: '⚡', color: 'text-blue-400' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="relative bg-metal-800/50 backdrop-blur-sm border border-metal-700 rounded-2xl px-6 py-4 text-center min-w-[140px]"
                >
                  {stat.live && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
                    />
                  )}
                  <span className="text-2xl mb-1 block">{stat.icon}</span>
                  <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-metal-400 text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* VIP Perks Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 max-w-4xl mx-auto"
            >
              <p className="text-metal-500 text-sm mb-4">EXKLUSIVE VIP VORTEILE</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {VIP_PERKS.map((perk, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-metal-800/30 backdrop-blur-sm border border-metal-700/50 rounded-xl p-3 text-center cursor-default"
                  >
                    <span className="text-2xl">{perk.icon}</span>
                    <p className="text-white font-bold text-xs mt-1">{perk.title}</p>
                    <p className="text-metal-500 text-[10px]">{perk.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Monthly Goal Progress */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-metal-900 via-metal-800 to-metal-900 border border-metal-700 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="font-bold text-white">Monatsziel {MONTHLY_GOAL.month}</h3>
                <p className="text-metal-400 text-sm">Server-Kosten & Entwicklung</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl text-white">€{MONTHLY_GOAL.current.toFixed(2)}</p>
              <p className="text-metal-400 text-sm">von €{MONTHLY_GOAL.goal}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-6 bg-metal-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm drop-shadow-lg">
                {progressPercentage.toFixed(1)}% erreicht
              </span>
            </div>
          </div>

          {/* Milestones */}
          <div className="flex justify-between mt-4 text-xs text-metal-500">
            <span>€0</span>
            <span className="text-amber-400">€500 - Server Costs</span>
            <span className="text-orange-400">€1000 - New Features</span>
            <span>€{MONTHLY_GOAL.goal}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Testimonials Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-white mb-2">💬 Was unsere Supporter sagen</h2>
            <p className="text-metal-400">Echte Stimmen aus der Community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, i) => {
              const tier = getTierByName(testimonial.tier)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`relative p-6 rounded-2xl border ${tier?.borderColor} ${tier?.bgColor} backdrop-blur-sm`}
                >
                  <div className="absolute -top-4 -right-4 text-4xl opacity-20">&quot;</div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier?.color} flex items-center justify-center text-2xl`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className={`text-xs ${tier?.textColor}`}>{tier?.emoji} {tier?.name}</p>
                    </div>
                  </div>
                  <p className="text-metal-300 text-sm italic">&quot;{testimonial.message}&quot;</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-12">
          {[
            { id: 'donate', label: 'Spenden', icon: Heart },
            { id: 'supporters', label: 'Unterstützer', icon: Users },
            { id: 'leaderboard', label: 'Top Supporter', icon: Trophy },
            { id: 'transactions', label: 'Shop-Umsatz', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-metal-800 text-metal-400 hover:bg-metal-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* DONATE TAB */}
          {activeTab === 'donate' && (
            <motion.div
              key="donate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Donation Tiers */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {DONATION_TIERS.map((tier, index) => (
                  <motion.button
                    key={tier.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedTier(tier.id)
                      setCustomAmount('')
                    }}
                    className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${
                      selectedTier === tier.id
                        ? `${tier.borderColor} ${tier.bgColor} scale-105`
                        : 'border-metal-700 bg-metal-900/50 hover:border-metal-600'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                        BELIEBT
                      </div>
                    )}
                    
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <tier.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className={`font-display text-xl font-bold ${tier.textColor} mb-1`}>
                      {tier.emoji} {tier.name}
                    </h3>
                    
                    <p className="text-3xl font-black text-white mb-4">
                      €{tier.price}
                    </p>
                    
                    <ul className="space-y-2">
                      {tier.rewards.map((reward, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-metal-300">
                          <Check className={`w-4 h-4 ${tier.textColor} flex-shrink-0 mt-0.5`} />
                          {reward}
                        </li>
                      ))}
                    </ul>

                    {selectedTier === tier.id && (
                      <motion.div
                        layoutId="selectedTier"
                        className="absolute inset-0 border-2 border-white/30 rounded-2xl pointer-events-none"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="max-w-xl mx-auto mb-12">
                <div className="text-center mb-4">
                  <span className="text-metal-400">oder wähle einen</span>
                  <span className="text-white font-bold ml-2">eigenen Betrag</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-metal-400 font-bold">€</span>
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={e => {
                        setCustomAmount(e.target.value)
                        setSelectedTier(null)
                      }}
                      placeholder="Betrag eingeben..."
                      className="w-full pl-10 pr-4 py-4 bg-metal-800 border border-metal-700 rounded-xl text-white text-lg font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[10, 25, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => {
                          setCustomAmount(amount.toString())
                          setSelectedTier(null)
                        }}
                        className="px-4 py-4 bg-metal-800 border border-metal-700 rounded-xl text-white font-bold hover:border-amber-500 hover:bg-amber-500/20 transition-colors"
                      >
                        €{amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="max-w-2xl mx-auto mb-12">
                <h3 className="text-center text-white font-bold text-lg mb-6">Zahlungsmethode wählen</h3>
                <div className="grid grid-cols-3 gap-4">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPayment === method.id
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-metal-700 bg-metal-800/50 hover:border-metal-600'
                      }`}
                    >
                      <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <span className="text-2xl">{method.icon}</span>
                      </div>
                      <p className="text-white font-bold">{method.name}</p>
                      <p className="text-metal-400 text-xs">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Donor Info */}
              <div className="max-w-xl mx-auto mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    placeholder="Dein Name (optional)"
                    className="px-4 py-3 bg-metal-800 border border-metal-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={donorMessage}
                    onChange={e => setDonorMessage(e.target.value)}
                    placeholder="Nachricht (optional)"
                    className="px-4 py-3 bg-metal-800 border border-metal-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Donate Button */}
              <div className="text-center">
                <button
                  onClick={handleDonate}
                  disabled={(!selectedTier && !customAmount) || !selectedPayment || isProcessing}
                  className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl rounded-2xl transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Verarbeite...
                    </>
                  ) : (
                    <>
                      <Heart className="w-6 h-6" />
                      Jetzt Spenden
                      {(selectedTier || customAmount) && (
                        <span className="ml-2">
                          €{selectedTier ? DONATION_TIERS.find(t => t.id === selectedTier)?.price : customAmount}
                        </span>
                      )}
                    </>
                  )}
                </button>
                
                <p className="mt-4 text-metal-500 text-sm flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Sichere Zahlung über SSL-verschlüsselte Verbindung
                </p>
              </div>
            </motion.div>
          )}

          {/* SUPPORTERS TAB */}
          {activeTab === 'supporters' && (
            <motion.div
              key="supporters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl font-bold text-white mb-2">
                    💖 Unsere Unterstützer
                  </h2>
                  <p className="text-metal-400">
                    Danke an alle, die Eldrun am Leben halten!
                  </p>
                </div>

                <div className="grid gap-4">
                  {RECENT_SUPPORTERS.map((supporter, index) => {
                    const tier = getTierByName(supporter.tier)
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border ${tier?.borderColor} ${tier?.bgColor} flex items-center gap-4`}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier?.color} flex items-center justify-center`}>
                          <span className="text-2xl">{tier?.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{supporter.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${tier?.bgColor} ${tier?.textColor}`}>
                              {tier?.name}
                            </span>
                          </div>
                          {supporter.message && (
                            <p className="text-metal-400 text-sm mt-1">&quot;{supporter.message}&quot;</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tier?.textColor}`}>€{supporter.amount}</p>
                          <p className="text-metal-500 text-xs">{supporter.date}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Total from donations */}
                <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl text-center">
                  <p className="text-metal-400 mb-2">Gesamte Spenden diesen Monat</p>
                  <p className="text-4xl font-black text-amber-400">€{totalFromDonations.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl font-bold text-white mb-2">
                    🏆 Top Supporter Leaderboard
                  </h2>
                  <p className="text-metal-400">
                    Die größten Unterstützer aller Zeiten
                  </p>
                </div>

                <div className="space-y-4">
                  {TOP_SUPPORTERS.map((supporter, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -50, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: index * 0.1, type: 'spring' }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className={`relative p-5 rounded-2xl border-2 ${
                        supporter.rank === 1 ? 'border-amber-500 bg-gradient-to-r from-amber-500/20 to-yellow-500/10' :
                        supporter.rank === 2 ? 'border-gray-400 bg-gradient-to-r from-gray-400/20 to-gray-500/10' :
                        supporter.rank === 3 ? 'border-amber-600 bg-gradient-to-r from-amber-600/20 to-amber-700/10' :
                        'border-metal-700 bg-metal-800/50'
                      } flex items-center gap-6`}
                    >
                      {/* Rank Badge */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${supporter.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-3xl">{supporter.badge}</span>
                      </div>
                      
                      {/* Rank Number */}
                      <div className="text-center w-12">
                        <span className={`text-3xl font-black ${
                          supporter.rank === 1 ? 'text-amber-400' :
                          supporter.rank === 2 ? 'text-gray-300' :
                          supporter.rank === 3 ? 'text-amber-600' :
                          'text-metal-500'
                        }`}>#{supporter.rank}</span>
                      </div>
                      
                      {/* Name */}
                      <div className="flex-1">
                        <p className="font-display text-xl font-bold text-white">{supporter.name}</p>
                        <p className="text-metal-400 text-sm">Legende der Community</p>
                      </div>
                      
                      {/* Total */}
                      <div className="text-right">
                        <p className={`text-2xl font-black ${
                          supporter.rank === 1 ? 'text-amber-400' :
                          supporter.rank === 2 ? 'text-gray-300' :
                          supporter.rank === 3 ? 'text-amber-600' :
                          'text-white'
                        }`}>€{supporter.total}</p>
                        <p className="text-metal-500 text-xs">Gesamt gespendet</p>
                      </div>

                      {/* Glow effect for top 3 */}
                      {supporter.rank <= 3 && (
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`absolute inset-0 rounded-2xl ${
                            supporter.rank === 1 ? 'bg-amber-500/10' :
                            supporter.rank === 2 ? 'bg-gray-400/10' :
                            'bg-amber-600/10'
                          } pointer-events-none`}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 text-center p-8 bg-gradient-to-r from-amber-900/20 via-metal-800 to-purple-900/20 border border-amber-500/30 rounded-2xl"
                >
                  <p className="text-2xl mb-2">🎯 Werde Teil der Legende!</p>
                  <p className="text-metal-400 mb-4">Jede Spende bringt dich dem Leaderboard näher</p>
                  <button
                    onClick={() => setActiveTab('donate')}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    Jetzt Spenden →
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="font-display text-3xl font-bold text-white mb-2">
                    🛒 Shop-Umsatz
                  </h2>
                  <p className="text-metal-400">
                    Alle Käufe im Eldrun Shop
                  </p>
                </div>

                <div className="bg-metal-900/50 border border-metal-800 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-metal-800/50">
                      <tr>
                        <th className="text-left px-6 py-4 text-metal-400 font-medium">Artikel</th>
                        <th className="text-left px-6 py-4 text-metal-400 font-medium">Käufer</th>
                        <th className="text-right px-6 py-4 text-metal-400 font-medium">Preis</th>
                        <th className="text-right px-6 py-4 text-metal-400 font-medium">Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHOP_TRANSACTIONS.map((tx, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-metal-800 hover:bg-metal-800/30"
                        >
                          <td className="px-6 py-4">
                            <span className="font-bold text-white">{tx.item}</span>
                          </td>
                          <td className="px-6 py-4 text-metal-300">{tx.buyer}</td>
                          <td className="px-6 py-4 text-right font-bold text-green-400">€{tx.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-metal-500">{tx.date}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total from shop */}
                <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl text-center">
                  <p className="text-metal-400 mb-2">Gesamter Shop-Umsatz diesen Monat</p>
                  <p className="text-4xl font-black text-green-400">€{totalFromShop.toFixed(2)}</p>
                </div>

                {/* Grand Total */}
                <div className="mt-4 p-8 bg-gradient-to-r from-amber-900/30 via-orange-900/30 to-red-900/30 border border-amber-500/30 rounded-2xl text-center">
                  <p className="text-metal-400 mb-2">Gesamter Community Support</p>
                  <p className="text-5xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    €{grandTotal.toFixed(2)}
                  </p>
                  <p className="text-metal-500 text-sm mt-2">Spenden + Shop-Umsatz</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-metal-800">
          <div className="flex flex-wrap justify-center gap-8 text-metal-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>SSL Gesichert</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <span>Sichere Zahlung</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-amber-400" />
              <span>Sofortige Aktivierung</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span>100% für die Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crypto Modal */}
      <AnimatePresence>
        {showCryptoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCryptoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-metal-900 border border-metal-700 rounded-2xl max-w-lg w-full p-6"
            >
              <h3 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Bitcoin className="w-8 h-8 text-orange-400" />
                Crypto Spende
              </h3>

              <div className="space-y-4">
                {Object.entries(CRYPTO_ADDRESSES).map(([key, crypto]) => (
                  <div key={key} className="p-4 bg-metal-800 rounded-xl">
                    <p className="text-metal-400 text-sm mb-2">{crypto.name}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-white text-sm bg-metal-900 px-3 py-2 rounded font-mono truncate">
                        {crypto.address}
                      </code>
                      <button
                        onClick={() => copyToClipboard(crypto.address, key)}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedAddress === key 
                            ? 'bg-green-500 text-white' 
                            : 'bg-metal-700 hover:bg-metal-600 text-metal-300'
                        }`}
                      >
                        {copiedAddress === key ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-metal-400 text-sm text-center">
                Nach der Transaktion kontaktiere uns im Discord mit deiner TX-ID für die Rewards!
              </p>

              <button
                onClick={() => setShowCryptoModal(false)}
                className="w-full mt-6 py-3 bg-metal-800 hover:bg-metal-700 text-white font-bold rounded-xl transition-colors"
              >
                Schließen
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold">Vielen Dank für deine Unterstützung!</span>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </AuthGate>
  )
}
