'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coins, CircleDollarSign, Target, Package, TrendingUp, 
  Dice1, Grid3X3, History, Wallet, Trophy, Users,
  ChevronRight, Sparkles, Flame, Zap, User, Star, LogIn
} from 'lucide-react'
import { useCasinoStore } from '@/hooks/useCasinoStore'
import { useStore } from '@/store/useStore'
import { useProfileSync } from '@/hooks/useProfileSync'
import { CoinflipGame } from './games/CoinflipGame'
import { JackpotGame } from './games/JackpotGame'
import { RouletteGame } from './games/RouletteGame'
import { CrashGame } from './games/CrashGame'
import { CasesGame } from './games/CasesGame'
import { MinesGame } from './games/MinesGame'
import { DiceGame } from './games/DiceGame'
import { WheelGame } from './games/WheelGame'
import { BlackjackGame } from './games/BlackjackGame'
import { SlotsGame } from './games/SlotsGame'
import { DragonsThrone } from './games/DragonsThrone'
import { GameHistory } from './GameHistory'
import { LiveFeed } from './LiveFeed'

type GameTab = 'coinflip' | 'jackpot' | 'roulette' | 'crash' | 'cases' | 'mines' | 'dice' | 'wheel' | 'blackjack' | 'slots' | 'dragons-throne'

const GAMES = [
  { id: 'dragons-throne' as GameTab, name: "Dragon's Throne", icon: Trophy, color: '#FFD700', desc: '👑 Erobere den Eisernen Thron!', featured: true },
  { id: 'coinflip' as GameTab, name: 'Coinflip', icon: Coins, color: '#D4AF37', desc: '1v1 Münzwurf' },
  { id: 'blackjack' as GameTab, name: 'Blackjack', icon: Target, color: '#22c55e', desc: '21 gewinnt' },
  { id: 'slots' as GameTab, name: 'Slots', icon: Grid3X3, color: '#ec4899', desc: 'Jackpot Spins' },
  { id: 'roulette' as GameTab, name: 'Roulette', icon: Target, color: '#DC143C', desc: 'Rot, Schwarz oder Grün' },
  { id: 'crash' as GameTab, name: 'Crash', icon: TrendingUp, color: '#00FF88', desc: 'Timing ist alles' },
  { id: 'jackpot' as GameTab, name: 'Jackpot', icon: Trophy, color: '#ed7620', desc: 'Der Pot gehört dir' },
  { id: 'cases' as GameTab, name: 'Cases', icon: Package, color: '#9400D3', desc: 'Öffne dein Glück' },
  { id: 'mines' as GameTab, name: 'Mines', icon: Grid3X3, color: '#FF6B6B', desc: 'Vermeide die Bomben' },
  { id: 'dice' as GameTab, name: 'Dice', icon: Dice1, color: '#4ECDC4', desc: 'Über oder Unter' },
  { id: 'wheel' as GameTab, name: 'Wheel', icon: CircleDollarSign, color: '#FFD700', desc: 'Dreh das Rad' },
]

export function CasinoClient() {
  const [activeGame, setActiveGame] = useState<GameTab>('coinflip')
  const [showHistory, setShowHistory] = useState(false)
  const { balance, totalWagered, totalWon, gamesPlayed, loadState } = useCasinoStore()
  const { currentUser, openAuthModal } = useStore()
  
  // Sync casino data with user profile
  useProfileSync()

  useEffect(() => {
    if (!currentUser) return
    void loadState()
  }, [currentUser, loadState])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num)
  }

  return (
    <div className="min-h-screen bg-metal-950 pt-20">
      {/* Casino Header */}
      <div className="relative overflow-hidden border-b border-metal-800">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-rust-900/20 to-red-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container-rust py-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Title */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 justify-center lg:justify-start mb-2"
              >
                <div className="w-14 h-14 relative">
                  <img src="/images/icons/icon_gambling.svg" alt="Casino" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="font-display font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rust-400 to-red-500">
                    ELDRUN CASINO
                  </h1>
                  <p className="text-metal-500 text-sm">Glück. Strategie. Ruhm.</p>
                </div>
              </motion.div>
            </div>

            {/* Wallet & Stats */}
            <div className="flex flex-wrap items-center gap-4">
              {/* User Profile Badge */}
              {currentUser ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden sm:flex items-center gap-3 px-4 py-2 bg-metal-900/80 border border-metal-700 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-rust-500 to-amber-600 rounded-lg flex items-center justify-center font-bold text-white">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{currentUser.displayName || currentUser.username}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-amber-400">Lvl {currentUser.level}</span>
                      <span className="text-metal-500">•</span>
                      <span className="text-metal-400 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {currentUser.totalAchievementPoints}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => openAuthModal('login')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Anmelden für Boni
                </motion.button>
              )}

              {/* Balance */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-metal-900/80 border border-amber-500/30 px-6 py-3 flex items-center gap-3"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
              >
                <Wallet className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-metal-500">Guthaben</p>
                  <p className="font-mono font-bold text-xl text-amber-400">{formatNumber(balance)}</p>
                </div>
                <Coins className="w-4 h-4 text-amber-500" />
              </motion.div>

              {/* Stats */}
              <div className="hidden md:flex gap-4">
                <div className="text-center px-4">
                  <p className="text-xs text-metal-500">Gespielt</p>
                  <p className="font-mono text-lg text-white">{gamesPlayed}</p>
                </div>
                <div className="text-center px-4 border-l border-metal-700">
                  <p className="text-xs text-metal-500">Gewettet</p>
                  <p className="font-mono text-lg text-rust-400">{formatNumber(totalWagered)}</p>
                </div>
                <div className="text-center px-4 border-l border-metal-700">
                  <p className="text-xs text-metal-500">Gewonnen</p>
                  <p className="font-mono text-lg text-green-400">{formatNumber(totalWon)}</p>
                </div>
              </div>

              {/* History Button */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-3 bg-metal-800 border border-metal-700 hover:border-rust-500 transition-colors"
              >
                <History className="w-5 h-5 text-metal-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Navigation */}
      <div className="sticky top-20 z-40 bg-metal-950/95 backdrop-blur-xl border-b border-metal-800">
        <div className="container-rust">
          <div className="flex overflow-x-auto py-2 gap-2 scrollbar-hide">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-all rounded-lg ${
                  activeGame === game.id
                    ? 'bg-gradient-to-r from-metal-800 to-metal-900 border border-opacity-50'
                    : 'text-metal-400 hover:text-white hover:bg-metal-800/50'
                }`}
                style={{ 
                  borderColor: activeGame === game.id ? game.color : 'transparent',
                  color: activeGame === game.id ? game.color : undefined
                }}
              >
                <game.icon className="w-5 h-5" />
                <span className="font-display text-sm uppercase tracking-wide">{game.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-rust py-8">
        {!currentUser ? (
          <div className="bg-metal-900/50 border border-metal-800 p-8 text-center">
            <h2 className="font-display font-black text-2xl text-white mb-2">Anmelden erforderlich</h2>
            <p className="text-metal-400 mb-6">Casino-Coins sind jetzt profilgebunden. Melde dich an, um mit deinem Guthaben zu spielen.</p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-3 bg-rust-600 hover:bg-rust-500 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Jetzt anmelden
            </button>
          </div>
        ) : (
          balance <= 0 ? (
            <div className="bg-metal-900/50 border border-amber-500/30 p-10 text-center">
              <h2 className="font-display font-black text-2xl text-white mb-2">Keine Casino-Coins mehr</h2>
              <p className="text-metal-400 mb-8">
                Dein Casino-Guthaben ist auf 0. Um weiterzuspielen, kannst du nur noch Casino-Coins im Shop kaufen.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/shop?category=currency"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rust-500 text-black font-bold rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Coins kaufen
                </Link>
                <Link
                  href="/shop"
                  className="px-6 py-3 bg-metal-800 hover:bg-metal-700 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-2 border border-metal-600"
                >
                  <ChevronRight className="w-5 h-5" />
                  Zum Shop
                </Link>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGame}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeGame === 'dragons-throne' && <DragonsThrone />}
                {activeGame === 'coinflip' && <CoinflipGame />}
                {activeGame === 'blackjack' && <BlackjackGame />}
                {activeGame === 'slots' && <SlotsGame />}
                {activeGame === 'jackpot' && <JackpotGame />}
                {activeGame === 'roulette' && <RouletteGame />}
                {activeGame === 'crash' && <CrashGame />}
                {activeGame === 'cases' && <CasesGame />}
                {activeGame === 'mines' && <MinesGame />}
                {activeGame === 'dice' && <DiceGame />}
                {activeGame === 'wheel' && <WheelGame />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Live Feed */}
            <LiveFeed />
            
            {/* Game Info */}
            <div className="bg-metal-900/50 border border-metal-800 p-4">
              <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rust-400" />
                Spiel Info
              </h3>
              <div className="space-y-2 text-sm">
                {GAMES.find(g => g.id === activeGame) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-metal-500">Spiel</span>
                      <span className="text-white">{GAMES.find(g => g.id === activeGame)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-metal-500">Typ</span>
                      <span className="text-metal-300">{GAMES.find(g => g.id === activeGame)?.desc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-metal-500">House Edge</span>
                      <span className="text-green-400">2-5%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-metal-900/50 border border-metal-800 p-4">
              <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Deine Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-metal-500 text-sm">Win Rate</span>
                  <span className="font-mono text-green-400">
                    {gamesPlayed > 0 ? Math.round((totalWon / (totalWagered || 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-metal-500 text-sm">Profit</span>
                  <span className={`font-mono ${totalWon - totalWagered >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalWon - totalWagered >= 0 ? '+' : ''}{formatNumber(totalWon - totalWagered)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
          )
        )}
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <GameHistory onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
